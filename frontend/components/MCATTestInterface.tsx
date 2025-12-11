'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswer, ExamResults } from '@/types';

interface MCATTestInterfaceProps {
  questions: Question[];
  onEndExam: (results: ExamResults) => void;
  queryId?: string;
}

export default function MCATTestInterface({ questions, onEndExam, queryId }: MCATTestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); // question_id -> answer index (0-3)

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswerIndex = userAnswers[currentQuestion.question_id] ?? null;

  const handleAnswerSelect = (answerIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.question_id]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleEndExam = () => {
    let correctCount = 0;
    let incorrectCount = 0;

    const questionsWithAnswers = questions.map((q) => {
      const userAnswerIndex = userAnswers[q.question_id] ?? null;
      const isCorrect = userAnswerIndex !== null && userAnswerIndex === q.correct_answer;
      if (isCorrect) {
        correctCount++;
      } else if (userAnswerIndex !== null) {
        incorrectCount++;
      }
      return {
        ...q,
        user_answer: userAnswerIndex !== null ? q.answer_choices[userAnswerIndex] : '',
        user_answer_index: userAnswerIndex,
        is_correct: isCorrect,
      };
    });

    const results: ExamResults = {
      total: questions.length,
      correct: correctCount,
      incorrect: incorrectCount,
      questions: questionsWithAnswers,
    };

    onEndExam(results);
  };

  const getAnswerLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header - Dark Blue */}
      <div className="bg-[#006699] text-white px-6 py-2.5 flex justify-between items-center">
        <div className="text-sm">
          <div className="font-medium">Medical College Admission Test - Practice</div>
        </div>
        {/* <div className="text-sm text-right">
          <div>QId: {currentQuestion.db_id || currentQuestion.question_id}</div>
        </div> */}
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <span>{currentQuestionIndex + 1} of {questions.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden border-t border-gray-300">
        {/* Left Panel - Passage/Context (50%) */}
        <div className="w-1/2 border-r border-gray-300 p-6 overflow-y-auto bg-white">
          <p className="text-sm text-gray-700 leading-relaxed">
            Question {currentQuestionIndex + 1} does not refer to a passage and is an independent question.
          </p>
        </div>

        {/* Right Panel - Question (50%) */}
        <div className="w-1/2 p-6 overflow-y-auto bg-white">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Question {currentQuestionIndex + 1}
          </h2>

          <p className="text-sm text-gray-800 leading-relaxed mb-6">
            {currentQuestion.question_text}
          </p>

          <div className="space-y-2">
            {currentQuestion.answer_choices.map((choice, index) => {
              const label = getAnswerLabel(index);
              const isSelected = selectedAnswerIndex === index;
              return (
                <label
                  key={index}
                  className={`flex items-start p-3 cursor-pointer border rounded transition-colors ${isSelected
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.question_id}`}
                    value={index}
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(index)}
                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <span className="font-bold text-gray-900 mr-1">{label}.</span>
                    <span className="text-sm text-gray-800">{choice}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer - Dark Blue */}
      <div className="bg-[#006699] px-4 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={handleEndExam}
            className="flex items-center gap-1 bg-white text-[#006699] px-4 py-1.5 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <span>↩</span>
            <span>End</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1 bg-white text-[#006699] px-4 py-1.5 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>←</span>
            <span>Previous</span>
          </button>
          <button className="flex items-center gap-2 bg-white text-[#006699] px-4 py-1.5 text-sm font-medium hover:bg-gray-100 transition-colors">
            <span>⊞</span>
            <span>Navigator</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex items-center gap-1 bg-white text-[#006699] px-4 py-1.5 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
