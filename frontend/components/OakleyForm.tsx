'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { DEFAULT_QUESTIONS } from '@/lib/constants';

interface OakleyFormProps {
  onSubmit: (concept: string, numQuestions: number) => void;
  onDemo: () => void;
  isLoading: boolean;
}

export default function OakleyForm({ onSubmit, onDemo, isLoading }: OakleyFormProps) {
  const [concept, setConcept] = useState('');
  const [numQuestions, setNumQuestions] = useState(DEFAULT_QUESTIONS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [concept]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (concept.trim()) {
      onSubmit(concept.trim(), numQuestions);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-black text-center mb-2">OakleyAI</h1>
        <p className="text-base text-black text-center mb-8">Type in a concept - drill MCAT questions.</p>

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-gray-100 rounded-4xl px-6 py-4 border border-gray-200">
            <textarea
              ref={textareaRef}
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Type in a MCAT concept..."
              required
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent outline-none text-black placeholder-gray-400 disabled:opacity-50 resize-none overflow-hidden leading-6 py-0.5"
              style={{ maxHeight: '200px', minHeight: '24px' }}
            />

            <div className="mx-4 flex-shrink-0">
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                disabled={isLoading}
                className="bg-white border border-gray-300 rounded-full px-4 py-1.5 text-black font-medium text-sm appearance-none cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '32px',
                }}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    #{num}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading || !concept.trim()}
              className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>

        <div className="mt-4 text-center py-10">
          <p className="text-sm text-gray-500">
            Want to try it out?{' '}
            <button
              onClick={onDemo}
              disabled={isLoading}
              className="text-gray-600 hover:text-blue-800 underline disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Try out a demo here!
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

