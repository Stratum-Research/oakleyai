import os
import json
import re
from datetime import datetime
from typing import List
import httpx
from models.question import Question
from logger_config import setup_logger
from services.local_llm import LocalLLM

logger = setup_logger("MCATQuestionMaker")
from dotenv import load_dotenv

load_dotenv()


class MCATQuestionMaker:
    """Service class for generating MCAT questions using OpenRouter API."""

    def __init__(self, api_key: str | None = None):
        """
        Initialize the MCAT Question Maker.

        Args:
            api_key: OpenRouter API key. If None, will read from OPENROUTER_API_KEY env var.
        """
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY", "")
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
        self.timeout = 120.0  # Increased timeout to 2 minutes

    def _build_prompt(self, concept: str, num_questions: int) -> str:
        """Build the prompt for generating MCAT questions."""
        return f"""Generate {num_questions} discrete MCAT-style multiple choice questions about {concept}.
            Each question should be:
            - Discrete (standalone, not passage-based)
            - At the difficulty level appropriate for the MCAT
            - The question stem and answer choices should be unambiguous and clear.  
            - Have exactly 4 answer choices
            - Include a clear explanation for the correct answer. the explanation shuold be from first principles and contain a clear and relatable example.
            - Tagged with relevant concept tags
            - Categorized by MCAT subject and subtopic


            IMPORTANT FORMATTING RULES:
            - answer_choices: Array of exactly 4 strings WITHOUT letter prefixes (A), B), etc.). Just the answer text.
            - correct_answer: Integer 0, 1, 2, or 3 representing the index of the correct answer in the answer_choices array (0 = first choice, 1 = second choice, etc.)

            Return the questions as a JSON array where each question has the following structure:
            {{
            "question_text": "The question text here",
            "answer_choices": ["First answer choice text", "Second answer choice text", "Third answer choice text", "Fourth answer choice text"],
            "correct_answer": 0,
            "explanation": "Detailed explanation of why this is correct",
            "concept_tags": ["tag1", "tag2"],
            "subject": "One of: Biology, Biochemistry, Psych/Soc, General Chemistry, Organic Chemistry, Physics",
            "subject_subtopic": "Specific subtopic within the subject (e.g., 'Cell Biology', 'Enzyme Kinetics', 'Cognition', 'Acid-Base Chemistry', 'Reactions', 'Mechanics')"
            }}

            Return ONLY valid JSON, no markdown formatting or additional text."""

    async def _call_openrouter(self, prompt: str) -> str:
        """Call OpenRouter API to generate questions."""
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable not set")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "MCAT Question Generator",
        }

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 4000,
        }

        logger.info(f"Using model: {self.model}")
        logger.debug(f"API URL: {self.api_url}")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    self.api_url, headers=headers, json=payload
                )

                if response.status_code == 404:
                    error_detail = response.text
                    logger.error(
                        f"OpenRouter API 404 error. Model: {self.model}, Response: {error_detail}"
                    )
                    # Check if it's a data policy issue
                    if (
                        "data policy" in error_detail.lower()
                        or "privacy" in error_detail.lower()
                    ):
                        raise ValueError(
                            "The selected AI model requires privacy settings to be configured. Please check your OpenRouter account settings or try a different model."
                        )
                    raise ValueError(
                        f"The AI model '{self.model}' is not available. Please check your model configuration."
                    )

                response.raise_for_status()
                return response.json()["choices"][0]["message"]["content"]
            except httpx.HTTPStatusError as e:
                error_detail = ""
                try:
                    error_detail = e.response.text
                except:
                    pass
                logger.error(
                    f"OpenRouter API error ({e.response.status_code}). Model: {self.model}, Detail: {error_detail or str(e)}"
                )

                # Return user-friendly error messages
                if e.response.status_code == 401:
                    raise ValueError(
                        "Authentication failed. Please check your API key."
                    )
                elif e.response.status_code == 403:
                    raise ValueError(
                        "Access denied. Please check your API key permissions."
                    )
                elif e.response.status_code == 429:
                    raise ValueError(
                        "Rate limit exceeded. Please try again in a moment."
                    )
                elif e.response.status_code >= 500:
                    raise ValueError(
                        "The AI service is temporarily unavailable. Please try again later."
                    )
                else:
                    raise ValueError(
                        "Failed to generate questions. Please try again or contact support if the problem persists."
                    )

    def _parse_response(self, response_text: str) -> List[dict]:
        """Parse the OpenRouter response and extract JSON."""
        logger.info(f"Response text: {response_text}")
        # Clean up markdown code blocks if present
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        try:
            questions_data = json.loads(response_text)
            if not isinstance(questions_data, list):
                questions_data = [questions_data]
            return questions_data
        except json.JSONDecodeError as e:
            # Log the problematic response for debugging
            logger.error(f"JSON parsing error: {str(e)}")
            logger.debug(f"Response text (first 500 chars): {response_text[:500]}")
            logger.debug(f"Response text (last 500 chars): {response_text[-500:]}")
            logger.debug(f"Response length: {len(response_text)}")
            raise ValueError(f"Failed to parse questions from API response: {str(e)}")

    def _clean_answer_choice(self, choice: str) -> str:
        """Remove letter prefixes (A), B), etc.) from answer choices."""
        import re

        # Remove patterns like "A)", "A.", "A) ", "(A)", etc.
        cleaned = re.sub(r"^[A-D][\)\.]\s*", "", choice.strip())
        cleaned = re.sub(r"^\([A-D]\)\s*", "", cleaned)
        return cleaned.strip()

    def _parse_correct_answer(
        self, correct_answer: any, answer_choices: List[str]
    ) -> int:
        """Parse correct answer to integer index (0-3)."""
        # If it's already an integer, validate and return
        if isinstance(correct_answer, int):
            if 0 <= correct_answer <= 3:
                return correct_answer
            raise ValueError(
                f"correct_answer index {correct_answer} is out of range (0-3)"
            )

        # If it's a string, try to extract index
        if isinstance(correct_answer, str):
            correct_answer = correct_answer.strip()

            # Try to match by letter (A=0, B=1, C=2, D=3)
            letter_match = re.match(r"^([A-D])", correct_answer.upper())
            if letter_match:
                letter = letter_match.group(1)
                idx = ord(letter) - ord("A")
                if 0 <= idx <= 3:
                    return idx

            # Try to find exact match in answer_choices (after cleaning)
            cleaned_correct = self._clean_answer_choice(correct_answer)
            for idx, choice in enumerate(answer_choices):
                if self._clean_answer_choice(choice) == cleaned_correct:
                    return idx

            # Try partial match (case-insensitive)
            cleaned_correct_lower = cleaned_correct.lower()
            for idx, choice in enumerate(answer_choices):
                cleaned_choice = self._clean_answer_choice(choice).lower()
                if (
                    cleaned_correct_lower == cleaned_choice
                    or cleaned_correct_lower in cleaned_choice
                    or cleaned_choice in cleaned_correct_lower
                ):
                    return idx

        # Default to 0 if we can't parse (better than failing)
        logger.warning(
            f"Could not parse correct_answer '{correct_answer}', defaulting to index 0"
        )
        return 0

    def _build_questions(
        self, questions_data: List[dict], num_questions: int
    ) -> List[Question]:
        """Convert raw question data into Question objects."""
        import re

        questions = []
        for idx, q_data in enumerate(questions_data[:num_questions], 1):
            try:
                # Clean answer choices (remove letter prefixes)
                raw_choices = q_data.get("answer_choices", [])
                if not raw_choices or len(raw_choices) == 0:
                    raise ValueError(f"Question {idx} has no answer_choices")

                cleaned_choices = [
                    self._clean_answer_choice(str(choice)) for choice in raw_choices
                ]

                # Ensure we have exactly 4 choices
                if len(cleaned_choices) != 4:
                    raise ValueError(
                        f"Question {idx} must have exactly 4 answer choices, got {len(cleaned_choices)}"
                    )

                # Parse correct answer to integer index
                correct_answer_idx = self._parse_correct_answer(
                    q_data.get("correct_answer", 0), cleaned_choices
                )

                question = Question(
                    question_id=idx,
                    created_at=datetime.now(),
                    question_text=q_data.get("question_text", ""),
                    answer_choices=cleaned_choices,
                    correct_answer=correct_answer_idx,
                    explanation=q_data.get("explanation", ""),
                    concept_tags=q_data.get("concept_tags", []),
                    subject=q_data.get("subject", "Biology"),
                    subject_subtopic=q_data.get("subject_subtopic", "General"),
                )
                questions.append(question)
            except Exception as e:
                logger.error(
                    f"Error processing question {idx}: {str(e)}. Question data: {q_data}",
                    exc_info=True,
                )
                raise ValueError(
                    f"Failed to process question {idx}. Please try generating questions again."
                )
        return questions

    async def generate_questions(
        self, concept: str, num_questions: int
    ) -> List[Question]:
        """
        Generate MCAT questions for a given concept.

        Args:
            concept: The MCAT concept/topic (e.g., "Acids and Bases")
            num_questions: Number of questions to generate (1-20)

        Returns:
            List of Question objects

        Raises:
            ValueError: If API key is missing or response parsing fails
            httpx.HTTPError: If API request fails
        """
        logger.info(f"Generating {num_questions} questions for concept: {concept}")
        prompt = self._build_prompt(concept, num_questions)

        logger.info("Calling OpenRouter API...")
        response_text = await self._call_openrouter(prompt)
        # response_text = LocalLLM().generate_questions(prompt)

        logger.info("Received response from OpenRouter, parsing...")
        questions_data = self._parse_response(response_text)

        logger.info(
            f"Parsed {len(questions_data)} questions, building Question objects..."
        )
        questions = self._build_questions(questions_data, num_questions)

        logger.info(f"Successfully generated {len(questions)} questions")
        return questions
