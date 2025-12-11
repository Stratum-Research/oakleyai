'use client';

import { useState, useEffect } from 'react';
import { Question, ExamResults } from '@/types';
import { generateQuestions } from '@/lib/api';
import { DEMO_QUESTIONS } from '@/lib/demo-questions';
import OakleyForm from '@/components/OakleyForm';
import MCATTestInterface from '@/components/MCATTestInterface';
import ExamResults from '@/components/ExamResults';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type ViewState = 'form' | 'loading' | 'test' | 'results';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [queryId, setQueryId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examResults, setExamResults] = useState<ExamResults | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        setBackendConnected(response.ok);
      } catch {
        setBackendConnected(false);
      }
    };
    checkBackend();
  }, []);

  const handleSubmit = async (concept: string, numQuestions: number) => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setViewState('loading');

    try {
      const generatedQuestions = await generateQuestions({
        concept,
        num_questions: numQuestions,
      });
      setQuestions(generatedQuestions);
      // Extract query_id from first question
      if (generatedQuestions.length > 0 && generatedQuestions[0].query_id) {
        setQueryId(generatedQuestions[0].query_id);
      }
      setViewState('test');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setViewState('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    setQuestions(DEMO_QUESTIONS);
    setQueryId(undefined); // No query ID for demo
    setError(null);
    setViewState('test');
  };

  const handleEndExam = (results: ExamResults) => {
    setExamResults(results);
    setViewState('results');
  };

  const handleRestart = () => {
    setViewState('form');
    setQuestions([]);
    setQueryId(undefined);
    setExamResults(null);
    setError(null);
  };

  if (viewState === 'form') {
    return (
      <>
        {backendConnected === false && (
          <div className="fixed top-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded z-50 max-w-md">
            <p className="text-sm text-yellow-700">
              <strong>Backend not connected.</strong> Make sure the backend server is running on {API_BASE_URL}
            </p>
          </div>
        )}
        <OakleyForm onSubmit={handleSubmit} onDemo={handleDemo} isLoading={isLoading} />
        {error && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}
      </>
    );
  }

  if (viewState === 'loading') {
    return <LoadingSpinner />;
  }

  if (viewState === 'test' && questions.length > 0) {
    return <MCATTestInterface questions={questions} queryId={queryId} onEndExam={handleEndExam} />;
  }

  if (viewState === 'results' && examResults) {
    return <ExamResults results={examResults} onRestart={handleRestart} />;
  }

  return null;
}
