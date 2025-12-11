'use client';

import { useState, FormEvent } from 'react';
import { DEFAULT_QUESTIONS, QUESTION_OPTIONS } from '@/lib/constants';

interface QuestionFormProps {
  onSubmit: (concept: string, numQuestions: number) => void;
  isLoading: boolean;
}

export default function QuestionForm({ onSubmit, isLoading }: QuestionFormProps) {
  const [concept, setConcept] = useState('');
  const [numQuestions, setNumQuestions] = useState(DEFAULT_QUESTIONS);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (concept.trim()) {
      onSubmit(concept.trim(), numQuestions);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="concept"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          MCAT Concept/Topic:
        </label>
        <input
          type="text"
          id="concept"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g., Acids and Bases, Organic Chemistry, Biochemistry"
          required
          disabled={isLoading}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="numQuestions"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Number of Questions:
        </label>
        <select
          id="numQuestions"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          required
          disabled={isLoading}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {QUESTION_OPTIONS.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || !concept.trim()}
        className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Generating Questions...' : 'Generate Questions'}
      </button>
    </form>
  );
}

