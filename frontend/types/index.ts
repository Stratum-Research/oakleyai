export type MCATSubject =
  | "Biology"
  | "Biochemistry"
  | "Psych/Soc"
  | "General Chemistry"
  | "Organic Chemistry"
  | "Physics";

export interface Question {
  question_id: number;
  created_at: string;
  question_text: string;
  answer_choices: string[];  // Clean list without letter prefixes
  correct_answer: number;  // Index 0-3 in answer_choices array
  explanation: string;
  concept_tags: string[];
  subject: MCATSubject;
  subject_subtopic: string;
  // db_id?: string;  // UUID from database
  query_id?: string;  // UUID of the query this question belongs to
}

export interface UserQuery {
  concept: string;
  num_questions: number;
}

export interface GenerateQuestionsRequest {
  concept: string;
  num_questions: number;
}

export interface FeedbackSubmission {
  question_id: number;
  rating: number;
  comment: string;
}

export interface QuestionFeedback {
  question_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface UserAnswer {
  question_id: number;
  selected_answer: string;
  is_correct: boolean;
}

export interface ExamResults {
  total: number;
  correct: number;
  incorrect: number;
  questions: Array<Question & { user_answer: string; user_answer_index: number | null; is_correct: boolean }>;
}
