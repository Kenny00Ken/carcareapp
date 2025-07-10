'use client';

import { useState, useCallback } from 'react';

interface UseLoadingOptions {
  initialState?: boolean;
  timeout?: number;
}

interface UseLoadingReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export const useLoading = (options: UseLoadingOptions = {}): UseLoadingReturn => {
  const { initialState = false, timeout } = options;
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setLoading(true);
    
    if (timeout) {
      setTimeout(() => {
        setLoading(false);
      }, timeout);
    }
  }, [timeout]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      const result = await fn();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};