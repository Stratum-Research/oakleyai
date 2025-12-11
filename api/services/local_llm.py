from llama_cpp import Llama


class LocalLLM:

    def __init__(self):
        self.llm = Llama.from_pretrained(
            repo_id="Qwen/Qwen2.5-0.5B-Instruct-GGUF",
            filename="qwen2.5-0.5b-instruct-fp16.gguf",
        )

    def _query(self, prompt: str):
        output = self.llm.create_chat_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4000,  # Match OpenRouter API setting
            temperature=0.7,  # Match OpenRouter API setting
        )
        # Extract the text content from the response, similar to OpenRouter API format
        return output["choices"][0]["message"]["content"]

    def _build_prompt(self, concept: str, num_questions: int) -> str:
        """Build the prompt for generating MCAT questions."""
        return f"""Generate {num_questions} discrete MCAT-style multiple choice questions about {concept}.
            Each question should be:
            - Discrete (standalone, not passage-based)
            - At the difficulty level appropriate for the MCAT
            - The question stem and answer choices should be unambiguous and clear.  
            - Have exactly 4 answer choices
            - Include a clear explanation for the correct answer. the explanation shuold be from first principles.
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

    def generate_questions(self, prompt: str):
        return self._query(prompt)
