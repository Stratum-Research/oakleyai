'use client';

import { useState } from 'react';
import React from 'react';
import { Question } from '@/types';

interface QuestionWithAnswer extends Question {
  user_answer: string;
  user_answer_index: number | null;
  is_correct: boolean;
}

interface QuestionsTableProps {
  questions: QuestionWithAnswer[];
}

export default function QuestionsTable({ questions }: QuestionsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (questionId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getAnswerLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              Question #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              Subject
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              Subject Subtopic
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              Concept Tags
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-b w-12">
              {/* Expand column */}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {questions.map((question, index) => {
            const isExpanded = expandedRows.has(question.question_id);
            const userSelectedIndex = question.user_answer_index ?? null;
            const correctIndex = question.correct_answer;

            return (
              <React.Fragment key={question.question_id}>
                <tr
                  onClick={() => toggleRow(question.question_id)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {question.subject}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {question.subject_subtopic}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {question.concept_tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {question.concept_tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{question.concept_tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {question.is_correct ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        × Incorrect
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`transform transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>
                      ›
                    </span>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${question.question_id}-expanded`}>
                    <td colSpan={6} className="px-4 py-6 bg-gray-50">
                      <div className={`border-2 rounded-lg p-6 ${question.is_correct
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                        }`}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="font-bold text-lg">Question {index + 1}</span>
                          {question.is_correct ? (
                            <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">✓ Correct</span>
                          ) : (
                            <span className="bg-red-600 text-white px-3 py-1 rounded text-sm">× Incorrect</span>
                          )}
                        </div>

                        <p className="text-base mb-4 leading-relaxed">{question.question_text}</p>

                        <div className="space-y-2 mb-4">
                          {question.answer_choices.map((choice, choiceIndex) => {
                            const label = getAnswerLabel(choiceIndex);
                            const isUserAnswer = choiceIndex === userSelectedIndex;
                            const isCorrect = choiceIndex === correctIndex;

                            let bgColor = 'bg-white';
                            let borderColor = 'border-gray-200';
                            let textColor = 'text-gray-700';

                            if (isCorrect) {
                              bgColor = 'bg-green-100';
                              borderColor = 'border-green-400';
                              textColor = 'text-green-900';
                            } else if (isUserAnswer && !isCorrect) {
                              bgColor = 'bg-red-100';
                              borderColor = 'border-red-400';
                              textColor = 'text-red-900';
                            }

                            return (
                              <div
                                key={choiceIndex}
                                className={`p-3 border-2 rounded ${bgColor} ${borderColor} ${textColor}`}
                              >
                                <span className="font-semibold mr-2">{label}.</span>
                                {choice}
                                {isCorrect && <span className="ml-2 text-green-700">✓ Correct Answer</span>}
                                {isUserAnswer && !isCorrect && (
                                  <span className="ml-2 text-red-700">✗ Your Answer</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <h4 className="font-bold text-blue-700 mb-2">Explanation:</h4>
                          <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
