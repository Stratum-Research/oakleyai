from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base


class UserQueryDB(Base):
    """Database model for user queries."""
    __tablename__ = "user_queries"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    concept = Column(String, nullable=False, index=True)
    num_questions = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    
    # Relationship to questions
    questions = relationship("QuestionDB", back_populates="query", cascade="all, delete-orphan")


class QuestionDB(Base):
    """Database model for generated questions."""
    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    query_id = Column(String, ForeignKey("user_queries.id"), nullable=False, index=True)
    question_id = Column(Integer, nullable=False)  # Question number within the query
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    question_text = Column(Text, nullable=False)
    answer_choices = Column(Text, nullable=False)  # Stored as JSON string
    correct_answer = Column(Integer, nullable=False)  # Index 0-3
    explanation = Column(Text, nullable=False)
    concept_tags = Column(Text, nullable=False)  # Stored as JSON string
    subject = Column(String, nullable=False, index=True)
    subject_subtopic = Column(String, nullable=False, index=True)
    
    # Relationship to query
    query = relationship("UserQueryDB", back_populates="questions")

