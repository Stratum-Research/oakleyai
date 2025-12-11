import { Question } from '@/types';
import QuestionCard from './QuestionCard';

interface QuestionsListProps {
  questions: Question[];
}

export default function QuestionsList({ questions }: QuestionsListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-400 mb-2">No questions generated</h2>
        <p className="text-gray-500">Please try again with a different concept.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <QuestionCard key={question.question_id} question={question} />
      ))}
    </div>
  );
}

