import { Question } from '@/types';
import QuestionFeedback from './QuestionFeedback';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const getAnswerLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
        <h3 className="text-xl font-bold text-purple-600">
          Question {question.question_id}
        </h3>
        <div className="flex gap-2 flex-wrap">
          {question.concept_tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="text-lg text-gray-800 mb-6 font-medium leading-relaxed">
        {question.question_text}
      </p>

      <ul className="space-y-3 mb-6">
        {question.answer_choices.map((choice, index) => {
          const isCorrect = choice === question.correct_answer;
          return (
            <li
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCorrect
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span className="font-semibold text-purple-600 mr-3">
                {getAnswerLabel(index)}.
              </span>
              <span>{choice}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <h4 className="font-bold text-blue-700 mb-2">Explanation:</h4>
        <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
      </div>

      <QuestionFeedback questionId={question.question_id} />
    </div>
  );
}

