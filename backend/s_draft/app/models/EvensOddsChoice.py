from pydantic import BaseModel, Field


class EvensOddsChoice(BaseModel):
    choice: str | None = Field(default=None, pattern="^(Odd|Even)$")
    number: int = Field(ge=0, le=5)
