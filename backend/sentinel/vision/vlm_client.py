from pathlib import Path
from PIL import Image
from transformers import pipeline


class StubVLMClient:
    def caption_image(self, image_path: Path) -> str:
        return "This is a caption."


class VLMClient:
    def __init__(self, model_name: str) -> None:
        self.model_name = model_name
        self.pipe = pipeline(
            "image-text-to-text", model=self.model_name, device_map="auto"
        )

    def caption_image(self, image_path: Path) -> str:
        image = Image.open(image_path).convert("RGB")

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": "Describe this image."},
                ],
            }
        ]

        # generated output from conversation list
        return self.pipe(messages)[0]["generated_text"][-1]["content"]
