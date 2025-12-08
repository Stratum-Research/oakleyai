# MCAT Question Generator

A modern web application that generates MCAT-style practice questions using AI. Built with Next.js (TypeScript) frontend and FastAPI backend. Users can specify a concept (e.g., "Acids and Bases") and the number of questions they want, and the system will generate discrete multiple-choice questions with explanations.

## Features

- **Modern Tech Stack**: Next.js 14+ with TypeScript, Tailwind CSS
- **Clean Architecture**: Reusable components, type-safe API calls, scalable structure
- **MCAT-Style Questions**: Generate discrete multiple-choice questions on any concept
- **Customizable**: Select number of questions (1-10)
- **Beautiful UI**: Modern, responsive design with gradient backgrounds
- **Complete Questions**: Includes answer choices, correct answers, explanations, and concept tags

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

### Backend
- **FastAPI** (Python)
- **Pydantic** for data validation
- **OpenRouter API** for AI question generation

## Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **OpenRouter API key** ([Get one here](https://openrouter.ai/))

### Installation

1. Clone the repository:
```bash
cd generate-questions
```

2. **Backend Setup:**
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set your OpenRouter API key
export OPENROUTER_API_KEY="your-api-key-here"
```

3. **Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# (Optional) Create .env.local file if you need to customize API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Application

**Option 1: Using startup scripts (recommended)**

1. **Start the backend server** (in one terminal):
```bash
./scripts/start-backend.sh
```

2. **Start the frontend** (in another terminal):
```bash
./scripts/start-frontend.sh
```

**Option 2: Manual startup**

1. **Start the backend server** (from project root):
```bash
source venv/bin/activate  # Activate virtual environment
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will run on `http://localhost:8000`

2. **Start the frontend** (in a new terminal):
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Enter an MCAT concept or topic in the input field (e.g., "Acids and Bases", "Organic Chemistry", "Biochemistry")
2. Select the number of questions you want to generate (1-10)
3. Click "Generate Questions"
4. View the generated questions with answer choices, correct answers, and explanations

## Project Structure

```
generate-questions/
├── backend/
│   ├── main.py              # FastAPI backend server
│   └── models/
│       ├── question.py      # Question Pydantic model
│       └── user_query.py    # UserQuery Pydantic model
├── frontend/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main page
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable React components
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionForm.tsx
│   │   ├── QuestionsList.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── lib/                 # Utility functions
│   │   ├── api.ts           # API client
│   │   └── constants.ts     # Constants
│   └── types/               # TypeScript types
│       └── index.ts
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Database

The application uses SQLite to store:
- **User Queries**: Each concept search with number of questions requested
- **Generated Questions**: All questions with their answers, explanations, and categorization

Database file: `backend/mcat_questions.db` (created automatically on first run)

## API Endpoints

### POST `/api/generate-questions`

Generate MCAT questions based on user input and save to database.

**Request Body:**
```json
{
  "concept": "Acids and Bases",
  "num_questions": 5
}
```

**Response:**
```json
[
  {
    "question_id": 1,
    "created_at": "2024-01-01T12:00:00",
    "question_text": "What is the pH of a 0.1 M solution of HCl?",
    "answer_choices": ["1.0", "2.0", "7.0", "13.0"],
    "correct_answer": "1.0",
    "explanation": "HCl is a strong acid...",
    "concept_tags": ["Acids", "pH", "Strong Acids"],
    "subject": "General Chemistry",
    "subject_subtopic": "Acid-Base Chemistry"
  }
]
```

### GET `/api/queries`

Get all past queries (most recent first).

**Query Parameters:**
- `limit` (optional): Maximum number of queries to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "concept": "Acids and Bases",
    "num_questions": 5,
    "created_at": "2024-01-01T12:00:00"
  }
]
```

### GET `/api/queries/{query_id}/questions`

Get all questions for a specific query.

**Response:** Array of Question objects

## Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend Development
```bash
source venv/bin/activate         # Activate virtual environment
cd backend
python -m uvicorn main:app --reload  # Run with auto-reload
```

## Deployment

### Frontend (Vercel)

The frontend is configured for Vercel deployment:

1. **Push your code to GitHub**
2. **Import project to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Set root directory to `frontend`
   - Add environment variable: `NEXT_PUBLIC_API_URL` (your backend API URL)

3. **Deploy:**
   - Vercel will automatically detect Next.js and deploy
   - The frontend will be available at `https://your-project.vercel.app`

### Backend Deployment

The backend needs to be deployed separately. Options include:

- **Railway**: Easy Python deployment
- **Render**: Free tier available
- **Fly.io**: Good for Python apps
- **Heroku**: Traditional option
- **AWS/GCP/Azure**: For production scale

**Important:** Update `NEXT_PUBLIC_API_URL` in Vercel to point to your deployed backend URL.

## Code Quality

The codebase follows best practices:
- **DRY (Don't Repeat Yourself)**: Reusable components and utilities
- **Type Safety**: Full TypeScript coverage
- **Scalable Architecture**: Clear separation of concerns
- **Clean Code**: Well-organized components and functions

## Notes

- The application uses OpenRouter API with GPT-4o-mini model
- Questions are generated as discrete (standalone) questions, not passage-based
- Make sure to set your `OPENROUTER_API_KEY` environment variable before running
- CORS is configured to allow requests from `localhost:3000` (Next.js default port)
