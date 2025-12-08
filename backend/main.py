import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
from models.user_query import UserQuery
from models.question import Question
from models.feedback import FeedbackSubmission, QuestionFeedback
from services.mcat_question_maker import MCATQuestionMaker
from services.database_service import DatabaseService
from database import get_db, init_db
from logger_config import setup_logger

logger = setup_logger("FastAPI")

app = FastAPI()

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up application...")
    init_db()
    logger.info("Database initialized")

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
    """Health check endpoint."""
    return {"status": "ok", "message": "MCAT Question Generator API is running"}


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "message": "API is healthy"}


@app.post("/api/generate-questions", response_model=List[Question])
async def generate_questions(query: UserQuery, db: Session = Depends(get_db)):
    """Generate MCAT questions based on user query and save to database."""
    if query.num_questions < 1 or query.num_questions > 20:
        raise HTTPException(
            status_code=400, detail="Number of questions must be between 1 and 20"
        )

    try:
        logger.info(f"Starting question generation for: {query.concept}, {query.num_questions} questions")
        # Generate questions
        questions = await question_maker.generate_questions(
            concept=query.concept, num_questions=query.num_questions
        )
        logger.info(f"Generated {len(questions)} questions, saving to database...")
        
        # Save to database
        query_uuid = DatabaseService.save_query_and_questions(db, query, questions)
        logger.info(f"Saved query {query_uuid} with {len(questions)} questions to database")
        
        # Retrieve from database to get UUIDs
        db_questions = DatabaseService.get_questions_by_query_id(db, query_uuid)
        questions_with_ids = [
            DatabaseService.convert_db_question_to_pydantic(q) for q in db_questions
        ]
        logger.info(f"Returning {len(questions_with_ids)} questions to client")
        
        return questions_with_ids
    except ValueError as e:
        # ValueError messages are already user-friendly
        logger.error(f"ValueError in generate_questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # Log full error details but return user-friendly message
        logger.error(f"Exception in generate_questions: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred while generating questions. Please try again or contact support if the problem persists."
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
        # TODO: Save feedback to database
        return question_feedback
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to submit feedback: {str(e)}"
        )


@app.get("/api/queries")
async def get_queries(db: Session = Depends(get_db), limit: int = 100):
    """Get all past queries."""
    queries = DatabaseService.get_all_queries(db, limit)
    return [
        {
            "id": q.id,
            "concept": q.concept,
            "num_questions": q.num_questions,
            "created_at": q.created_at.isoformat(),
        }
        for q in queries
    ]


@app.get("/api/queries/{query_id}/questions", response_model=List[Question])
async def get_query_questions(query_id: str, db: Session = Depends(get_db)):
    """Get all questions for a specific query UUID."""
    db_questions = DatabaseService.get_questions_by_query_id(db, query_id)
    if not db_questions:
        raise HTTPException(status_code=404, detail="Query not found")
    
    return [
        DatabaseService.convert_db_question_to_pydantic(q) for q in db_questions
    ]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
