"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import {
  ArrowUpIcon,
  CheckIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";
import { sendChatMessage } from "@/lib/api/chat.client";
import type { ImageMetadata } from "@/lib/types/image";
import { cn } from "@/lib/utils";

type ToolId = "search";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachments?: ImageMetadata[];
  results?: ImageMetadata[];
  toolLabel?: string;
  isError?: boolean;
};

const MAX_SELECTED_IMAGES = 8;

const tools = [
  {
    id: "search" as const,
    label: "Search",
    icon: SearchIcon,
  },
] as const;

function ResultAttachments({
  results,
  selectedImageIds,
  isBusy,
  onToggleImage,
}: {
  results: ImageMetadata[];
  selectedImageIds: ReadonlySet<string>;
  isBusy: boolean;
  onToggleImage: (image: ImageMetadata) => void;
}) {
  const selectionLimitReached =
    selectedImageIds.size >= MAX_SELECTED_IMAGES;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <p className="text-xs text-muted-foreground">
        Select up to {MAX_SELECTED_IMAGES} to analyse.
      </p>
      <AttachmentGroup className="w-full" aria-label="Sentinel results">
        {results.map((image) => {
          const isSelected = selectedImageIds.has(image.id);
          const isSelectionDisabled =
            isBusy || (selectionLimitReached && !isSelected);

          return (
            <Attachment
              key={image.id}
              orientation="vertical"
              className="w-36"
              data-selected={isSelected}
              data-disabled={isSelectionDisabled}
            >
              <AttachmentMedia variant="image">
                <Image
                  src={`/api/images/${encodeURIComponent(image.id)}/content`}
                  alt=""
                  width={144}
                  height={144}
                  sizes="144px"
                  unoptimized
                  className="size-full object-cover"
                />
              </AttachmentMedia>
              <AttachmentContent className="w-full">
                <AttachmentTitle title={image.user_filename}>
                  {image.user_filename}
                </AttachmentTitle>
              </AttachmentContent>
              <AttachmentActions className="pointer-events-none">
                <AttachmentAction
                  type="button"
                  variant={isSelected ? "default" : "secondary"}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {isSelected ? <CheckIcon /> : <PlusIcon />}
                </AttachmentAction>
              </AttachmentActions>
              <AttachmentTrigger
                disabled={isSelectionDisabled}
                aria-label={
                  isSelected
                    ? `Remove ${image.user_filename} from analysis`
                    : `Select ${image.user_filename} for analysis`
                }
                aria-pressed={isSelected}
                onClick={() => onToggleImage(image)}
              />
            </Attachment>
          );
        })}
      </AttachmentGroup>
    </div>
  );
}

function CompactImageAttachments({
  images,
  label,
  isBusy = false,
  onRemoveImage,
}: {
  images: ImageMetadata[];
  label: string;
  isBusy?: boolean;
  onRemoveImage?: (imageId: string) => void;
}) {
  return (
    <AttachmentGroup className="w-full" aria-label={label}>
      {images.map((image) => (
        <Attachment key={image.id} size="sm" className="max-w-52">
          <AttachmentMedia variant="image">
            <Image
              src={`/api/images/${encodeURIComponent(image.id)}/content`}
              alt=""
              width={32}
              height={32}
              sizes="32px"
              unoptimized
              className="size-full object-cover"
            />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle title={image.user_filename}>
              {image.user_filename}
            </AttachmentTitle>
          </AttachmentContent>
          {onRemoveImage && (
            <AttachmentActions>
              <AttachmentAction
                type="button"
                disabled={isBusy}
                aria-label={`Remove ${image.user_filename} from analysis`}
                onClick={() => onRemoveImage(image.id)}
              >
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          )}
          {!onRemoveImage && (
            <AttachmentTrigger
              render={
                <a
                  href={`/api/images/${encodeURIComponent(image.id)}/content`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${image.user_filename}`}
                />
              }
            />
          )}
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}

function TranscriptMessage({
  message,
  selectedImageIds,
  isBusy,
  onToggleImage,
}: {
  message: ChatMessage;
  selectedImageIds: ReadonlySet<string>;
  isBusy: boolean;
  onToggleImage: (image: ImageMetadata) => void;
}) {
  const isUser = message.role === "user";
  const resultCount = message.results?.length ?? 0;
  const attachmentCount = message.attachments?.length ?? 0;

  return (
    <MessageScrollerItem messageId={message.id} scrollAnchor={isUser}>
      <div className="flex flex-col gap-4">
        {message.toolLabel && (
          <Marker>
            <MarkerIcon>
              <SearchIcon />
            </MarkerIcon>
            <MarkerContent>{message.toolLabel}</MarkerContent>
          </Marker>
        )}
        <Message align={isUser ? "end" : "start"}>
          <MessageContent>
            <Bubble
              align={isUser ? "end" : "start"}
              variant={
                isUser ? "secondary" : message.isError ? "destructive" : "ghost"
              }
            >
              <BubbleContent role={message.isError ? "alert" : undefined}>
                {message.text}
              </BubbleContent>
            </Bubble>
            {attachmentCount > 0 && (
              <CompactImageAttachments
                images={message.attachments ?? []}
                label="Images sent for analysis"
              />
            )}
            {resultCount > 0 && (
              <ResultAttachments
                results={message.results ?? []}
                selectedImageIds={selectedImageIds}
                isBusy={isBusy}
                onToggleImage={onToggleImage}
              />
            )}
          </MessageContent>
        </Message>
      </div>
    </MessageScrollerItem>
  );
}

function SentinelWelcome() {
  return (
    <EmptyHeader>
      <EmptyTitle className="text-2xl tracking-tight">
        How can Sentinel help?
      </EmptyTitle>
      <EmptyDescription>
        Search your library, then select images to analyse.
      </EmptyDescription>
    </EmptyHeader>
  );
}

function ChatComposer({
  promptRef,
  isBusy,
  prompt,
  selectedTool,
  selectedImages,
  onPromptChange,
  onPromptKeyDown,
  onSelectTool,
  onClearTool,
  onClearImages,
  onRemoveImage,
  onSubmit,
}: {
  promptRef: RefObject<HTMLTextAreaElement | null>;
  isBusy: boolean;
  prompt: string;
  selectedTool: ToolId | null;
  selectedImages: ImageMetadata[];
  onPromptChange: (value: string) => void;
  onPromptKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelectTool: (tool: ToolId) => void;
  onClearTool: () => void;
  onClearImages: () => void;
  onRemoveImage: (imageId: string) => void;
  onSubmit: () => void;
}) {
  const selected = tools.find((tool) => tool.id === selectedTool);
  const SelectedIcon = selected?.icon;
  const canSend = Boolean(prompt.trim() && !isBusy);

  function selectTool(tool: ToolId) {
    onSelectTool(tool);
    requestAnimationFrame(() => promptRef.current?.focus());
  }

  function clearTool() {
    onClearTool();
    requestAnimationFrame(() => promptRef.current?.focus());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="sentinel-prompt" className="sr-only">
            Ask Sentinel
          </FieldLabel>
          {selectedImages.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Selected images</p>
                <div className="flex items-center gap-1">
                  <p
                    className="text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    {selectedImages.length}/{MAX_SELECTED_IMAGES}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    disabled={isBusy}
                    onClick={onClearImages}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
              <CompactImageAttachments
                images={selectedImages}
                label="Selected images for analysis"
                isBusy={isBusy}
                onRemoveImage={onRemoveImage}
              />
            </div>
          )}
          <InputGroup>
            <InputGroupTextarea
              ref={promptRef}
              id="sentinel-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              onKeyDown={onPromptKeyDown}
              placeholder={
                selected
                  ? `Describe what to ${selected.label.toLowerCase()}…`
                  : selectedImages.length
                    ? "Ask about the selected images…"
                    : "Ask Sentinel"
              }
              className="max-h-40 min-h-12 px-3 py-3"
            />
            <InputGroupAddon align="block-end">
              {selected && SelectedIcon ? (
                <InputGroupButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isBusy}
                  aria-label={`Remove ${selected.label}`}
                  onClick={clearTool}
                >
                  <SelectedIcon data-icon="inline-start" />
                  {selected.label}
                  <XIcon data-icon="inline-end" />
                </InputGroupButton>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <InputGroupButton
                        size="sm"
                        variant="secondary"
                        disabled={isBusy}
                        aria-label="Tools"
                      />
                    }
                  >
                    <PlusIcon data-icon="inline-start" />
                    Tools
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Tools</DropdownMenuLabel>
                      {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <DropdownMenuItem
                            key={tool.id}
                            onClick={() => selectTool(tool.id)}
                          >
                            <Icon />
                            {tool.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                disabled={!canSend}
                className="ml-auto"
                aria-label={isBusy ? "Working on that" : "Send message"}
              >
                {isBusy ? <Spinner /> : <ArrowUpIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
    </form>
  );
}

export function ChatInterface() {
  const { getToken } = useAuth();
  const requestInFlight = useRef(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageMetadata[]>([]);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const isWorking = pendingMessageId !== null;
  const pendingStatus =
    selectedTool === "search"
      ? "Searching your library…"
      : selectedImages.length
        ? `Analysing ${selectedImages.length} selected ${
            selectedImages.length === 1 ? "image" : "images"
          }…`
        : "Working on that…";

  function handleToggleImage(image: ImageMetadata) {
    if (isWorking) return;

    if (selectedImages.some((item) => item.id === image.id)) {
      setSelectedImages((current) =>
        current.filter((item) => item.id !== image.id),
      );
      return;
    }

    if (selectedImages.length >= MAX_SELECTED_IMAGES) {
      toast.info(`You can select up to ${MAX_SELECTED_IMAGES}.`);
      return;
    }

    setSelectedTool(null);
    setSelectedImages((current) => {
      if (
        current.length >= MAX_SELECTED_IMAGES ||
        current.some((item) => item.id === image.id)
      ) {
        return current;
      }

      return [...current, image];
    });
  }

  function handleRemoveImage(imageId: string) {
    setSelectedImages((current) =>
      current.filter((image) => image.id !== imageId),
    );
  }

  async function handleSubmit() {
    const message = prompt.trim();
    if (!message || requestInFlight.current) return;

    const tool = tools.find((item) => item.id === selectedTool);
    const attachedImages = selectedImages;
    const turnId = crypto.randomUUID();

    requestInFlight.current = true;
    setMessages((current) => [
      ...current,
      {
        id: `${turnId}-user`,
        role: "user",
        text: message,
        attachments: attachedImages.length ? attachedImages : undefined,
      },
    ]);
    setPrompt("");
    setPendingMessageId(`${turnId}-status`);
    requestAnimationFrame(() => promptRef.current?.focus());

    try {
      const history = messages
        .filter((item) => !item.isError)
        .map(({ role, text }) => ({ role, text }));
      const { reply, results, tool_label } = await sendChatMessage(
        message,
        history,
        getToken,
        tool?.id,
        attachedImages.map((image) => image.id),
      );
      setMessages((current) => [
        ...current,
        {
          id: `${turnId}-assistant`,
          role: "assistant",
          text: reply,
          results: results?.length ? results : undefined,
          toolLabel: tool_label ?? undefined,
        },
      ]);
      setSelectedImages([]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${turnId}-assistant`,
          role: "assistant",
          text: "Something went wrong. Try again.",
          isError: true,
        },
      ]);
    } finally {
      requestInFlight.current = false;
      setPendingMessageId(null);
      requestAnimationFrame(() => promptRef.current?.focus());
    }
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const isEmpty = messages.length === 0;
  const selectedImageIds = new Set(selectedImages.map((image) => image.id));

  return (
    <section
      aria-labelledby="chat-heading"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <h1 id="chat-heading" className="sr-only">
        Sentinel visual intelligence
      </h1>
      <MessageScrollerProvider autoScroll scrollPreviousItemPeek={64}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {!isEmpty && (
            <div className="min-h-0 flex-1 overflow-hidden">
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent
                    aria-busy={isWorking}
                    className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6"
                  >
                    {messages.map((message) => (
                      <TranscriptMessage
                        key={message.id}
                        message={message}
                        selectedImageIds={selectedImageIds}
                        isBusy={isWorking}
                        onToggleImage={handleToggleImage}
                      />
                    ))}
                    {pendingMessageId && (
                      <MessageScrollerItem messageId={pendingMessageId}>
                        <Marker role="status">
                          <MarkerIcon>
                            <Spinner />
                          </MarkerIcon>
                          <MarkerContent className="shimmer">
                            {pendingStatus}
                          </MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </div>
          )}
          <div
            className={cn(
              "mx-auto w-full max-w-3xl px-4 md:px-6",
              isEmpty
                ? "flex min-h-0 flex-1 flex-col items-center justify-center gap-6"
                : "shrink-0 pt-2",
            )}
          >
            {isEmpty && <SentinelWelcome />}
            <div className="w-full">
              <ChatComposer
                promptRef={promptRef}
                isBusy={isWorking}
                prompt={prompt}
                selectedTool={selectedTool}
                selectedImages={selectedImages}
                onPromptChange={setPrompt}
                onPromptKeyDown={handlePromptKeyDown}
                onSelectTool={setSelectedTool}
                onClearTool={() => setSelectedTool(null)}
                onClearImages={() => setSelectedImages([])}
                onRemoveImage={handleRemoveImage}
                onSubmit={() => {
                  void handleSubmit();
                }}
              />
            </div>
          </div>
          <div className="h-6 shrink-0" aria-hidden="true" />
        </div>
      </MessageScrollerProvider>
    </section>
  );
}
