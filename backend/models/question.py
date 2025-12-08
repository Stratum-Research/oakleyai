from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


MCATSubject = Literal[
    "Biology",
    "Biochemistry",
    "Psych/Soc",
    "General Chemistry",
    "Organic Chemistry",
    "Physics",
]


class Question(BaseModel):
    question_id: int
    created_at: datetime
    question_text: str
    answer_choices: list[str]  # Clean list without letter prefixes (A), B), etc.)
    correct_answer: int = Field(
        ..., ge=0, le=3, description="Index (0-3) of correct answer in answer_choices"
    )
    explanation: str
    concept_tags: list[str]
    subject: MCATSubject = Field(..., description="MCAT subject area")
    subject_subtopic: str = Field(
        ..., description="Specific subtopic within the subject"
    )
    db_id: str | None = Field(default=None, description="UUID from database")
    query_id: str | None = Field(default=None, description="UUID of the query")
