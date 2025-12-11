from datetime import datetime
from pydantic import BaseModel, Field


class QuestionFeedback(BaseModel):
    question_id: int
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: str = Field(default="", max_length=1000, description="Optional comment")
    created_at: datetime = Field(default_factory=datetime.now)


class FeedbackSubmission(BaseModel):
    question_id: int
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: str = Field(default="", max_length=1000, description="Optional comment")

