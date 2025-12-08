import json
from typing import List
from sqlalchemy.orm import Session
from models.db_models import UserQueryDB, QuestionDB
from models.question import Question
from models.user_query import UserQuery


class DatabaseService:
    """Service for database operations."""

    @staticmethod
    def save_query_and_questions(
        db: Session, user_query: UserQuery, questions: List[Question]
    ) -> str:
        """
        Save user query and generated questions to database.
        
        Returns:
            The query_id (UUID) of the saved query
        """
        import uuid
        
        # Create and save user query with UUID
        query_uuid = str(uuid.uuid4())
        db_query = UserQueryDB(
            id=query_uuid,
            concept=user_query.concept,
            num_questions=user_query.num_questions,
        )
        db.add(db_query)
        db.flush()  # Flush to get the ID without committing
        
        # Save all questions associated with this query
        for question in questions:
            question_uuid = str(uuid.uuid4())
            db_question = QuestionDB(
                id=question_uuid,
                query_id=db_query.id,
                question_id=question.question_id,
                created_at=question.created_at,
                question_text=question.question_text,
                answer_choices=json.dumps(question.answer_choices),
                correct_answer=int(question.correct_answer),  # Ensure it's an integer
                explanation=question.explanation,
                concept_tags=json.dumps(question.concept_tags),
                subject=question.subject,
                subject_subtopic=question.subject_subtopic,
            )
            db.add(db_question)
        
        db.commit()
        db.refresh(db_query)
        
        return db_query.id

    @staticmethod
    def get_query_by_id(db: Session, query_id: str) -> UserQueryDB:
        """Get a user query by UUID."""
        return db.query(UserQueryDB).filter(UserQueryDB.id == query_id).first()

    @staticmethod
    def get_questions_by_query_id(db: Session, query_id: str) -> List[QuestionDB]:
        """Get all questions for a specific query UUID."""
        return db.query(QuestionDB).filter(QuestionDB.query_id == query_id).all()

    @staticmethod
    def get_all_queries(db: Session, limit: int = 100) -> List[UserQueryDB]:
        """Get all user queries (most recent first)."""
        return (
            db.query(UserQueryDB)
            .order_by(UserQueryDB.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def convert_db_question_to_pydantic(db_question: QuestionDB) -> Question:
        """Convert database question to Pydantic model."""
        return Question(
            question_id=db_question.question_id,
            created_at=db_question.created_at,
            question_text=db_question.question_text,
            answer_choices=json.loads(db_question.answer_choices),
            correct_answer=db_question.correct_answer,
            explanation=db_question.explanation,
            concept_tags=json.loads(db_question.concept_tags),
            subject=db_question.subject,
            subject_subtopic=db_question.subject_subtopic,
            db_id=db_question.id,
            query_id=db_question.query_id,
        )

