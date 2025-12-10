import psycopg2
from psycopg2.extras import Json, RealDictCursor
from dotenv import load_dotenv
import os
from typing import List, Optional
from datetime import datetime
from models.question import Question
from models.user_query import UserQuery
from logger_config import setup_logger
import os
from supabase import create_client, Client


# Load environment variables
load_dotenv()

logger = setup_logger("SupabaseConnector")


class SupabaseConnector:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)
        self.supabase = supabase

    def _save_user_query(self, query: UserQuery) -> str:
        try:
            response = (
                self.supabase.table("user_queries")
                .insert(
                    {
                        "concept": query.concept,
                        "num_questions": query.num_questions,
                    }
                )
                .execute()
            )
            # Extract the query_id from the inserted row
            # Assuming the primary key is 'id' or 'query_id'
            query_id = response.data[0].get("id") or response.data[0].get("query_id")
            if not query_id:
                raise ValueError("Failed to get query_id from inserted user_query")
            return query_id
        except Exception as e:
            logger.error(f"Failed to save user query: {e}")
            raise e

    def _save_questions(self, questions: List[Question], query_id: str):
        try:
            # Convert Pydantic models to dictionaries for Supabase
            # Use mode='json' to serialize datetime objects to ISO format strings
            # Include question_id (sequential number within query), exclude db_id (auto-generated UUID)
            questions_dict = [
                {
                    **q.model_dump(exclude={"db_id", "query_id"}, mode="json"),
                    "query_id": query_id,
                }
                for q in questions
            ]
            self.supabase.table("questions").insert(questions_dict).execute()
        except Exception as e:
            logger.error(f"Failed to save questions: {e}")
            raise e

    def save_query_and_questions(self, query: UserQuery, questions: List[Question]):
        query_id = self._save_user_query(query)
        self._save_questions(questions, query_id)
