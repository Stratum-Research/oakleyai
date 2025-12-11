import { Question, GenerateQuestionsRequest, FeedbackSubmission, QuestionFeedback } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateQuestions(
  request: GenerateQuestionsRequest
): Promise<Question[]> {
  const url = `${API_BASE_URL}/api/generate-questions`;
  const payload = {
    concept: request.concept,
    num_questions: request.num_questions,
  };

  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout (OpenRouter can be slow)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Failed to generate questions. Please try again.';
      try {
        const errorText = await response.text();
        const error = JSON.parse(errorText);
        // Use the error detail from backend (which is now user-friendly)
        errorMessage = error.detail || errorMessage;
      } catch {
        // If we can't parse the error, use a generic message
        if (response.status === 500) {
          errorMessage = 'An error occurred while generating questions. Please try again.';
        } else if (response.status === 503) {
          errorMessage = 'The service is temporarily unavailable. Please try again later.';
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Make sure the backend server is running.`);
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The question generation is taking longer than expected. Please try again.');
    }
    throw error;
  }
}

export async function submitFeedback(
  feedback: FeedbackSubmission
): Promise<QuestionFeedback> {
  const response = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedback),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to submit feedback' }));
    throw new Error(error.detail || 'Failed to submit feedback');
  }

  return response.json();
}

