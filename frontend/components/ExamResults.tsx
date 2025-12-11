'use client';

import { ExamResults as ExamResultsType } from '@/types';
import ScoreProgressBar from './ScoreProgressBar';
import QuestionsTable from './QuestionsTable';

interface ExamResultsProps {
  results: ExamResultsType;
  onRestart: () => void;
}

export default function ExamResults({ results, onRestart }: ExamResultsProps) {
  const percentage = Math.round((results.correct / results.total) * 100);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Summary */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Exam Results</h1>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{results.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">{results.incorrect}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{results.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <ScoreProgressBar userScore={percentage} />
          </div>
        </div>

        {/* Questions Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions Review</h2>
          <QuestionsTable questions={results.questions} />
        </div>

        <div className="text-center">
          <button
            onClick={onRestart}
            className="bg-neutral-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-neutral-950 transition-colors"
          >
            Start New Exam
          </button>
        </div>
      </div>
    </div>
  );
}

