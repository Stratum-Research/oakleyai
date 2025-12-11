import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models.user_query import UserQuery
from models.question import Question
from models.feedback import FeedbackSubmission, QuestionFeedback
from services.mcat_question_maker import MCATQuestionMaker
from services.supabase_connector import SupabaseConnector
from logger_config import setup_logger

logger = setup_logger("FastAPI")

app = FastAPI()


# Enable CORS for frontend
# Get allowed origins from environment variable (for production) or use defaults
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = (
    [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]
    if allowed_origins_str
    else [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Sometimes Next.js uses 3001 if 3000 is busy
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize service
question_maker = MCATQuestionMaker()


@app.get("/")
async def root():
    """Root endpoint."""
    return {"status": "ok", "message": "MCAT Question Generator API is running"}


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "message": "API is healthy"}


@app.post(
    "/api/generate-questions",
    response_model=List[Question],
    response_model_exclude={"query_id", "db_id"},
)
async def generate_questions(query: UserQuery):
    """Generate MCAT questions based on user query and save to Supabase."""
    supabase_connector = SupabaseConnector()

    try:
        logger.info(
            f"Starting question generation for: {query.concept}, {query.num_questions} questions"
        )
        # Generate questions first
        questions = await question_maker.generate_questions(
            concept=query.concept, num_questions=query.num_questions
        )
        logger.info(f"Generated {len(questions)} questions")

        # Only write to database if we have questions and Supabase is configured
        if questions:
            supabase_connector.save_query_and_questions(query, questions)
            return questions
        else:
            return []
    except ValueError as e:
        logger.error(f"ValueError in generate_questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Exception in generate_questions: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while generating questions. Please try again or contact support if the problem persists.",
        )


@app.post("/api/feedback", response_model=QuestionFeedback)
async def submit_feedback(feedback: FeedbackSubmission):
    """Submit feedback for a question."""
    try:
        # Create feedback object with timestamp
        question_feedback = QuestionFeedback(
            question_id=feedback.question_id,
            rating=feedback.rating,
            comment=feedback.comment,
        )
        return question_feedback
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to submit feedback: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
