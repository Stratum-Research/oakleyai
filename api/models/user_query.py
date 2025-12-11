from pydantic import BaseModel


class UserQuery(BaseModel):
    concept: str
    num_questions: int
