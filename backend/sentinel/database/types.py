from __future__ import annotations

import json
from typing import Any

from sqlalchemy import Dialect, func
from sqlalchemy.sql.elements import ColumnElement
from sqlalchemy.types import UserDefinedType


class Vector(UserDefinedType):
    cache_ok = True

    def __init__(self, dimensions: int) -> None:
        self.dimensions = dimensions

    def get_col_spec(self, **kwargs: Any) -> str:
        return f"VECTOR({self.dimensions}) USING VARBINARY"

    def bind_processor(self, dialect: Dialect):
        def process(value: list[float] | None) -> str | None:
            if value is None:
                return None

            return "[" + ",".join(str(float(x)) for x in value) + "]"

        return process

    def bind_expression(self, bindvalue: ColumnElement) -> ColumnElement:
        return func.string_to_vector(bindvalue)

    def column_expression(self, col: ColumnElement) -> ColumnElement:
        return func.vector_to_string(col)

    def result_processor(self, dialect: Dialect, coltype: Any):
        def process(value: str | None) -> list[float] | None:
            if value is None:
                return None

            return [float(x) for x in json.loads(value)]

        return process
