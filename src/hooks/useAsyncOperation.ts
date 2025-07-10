'use client';

import { useState, useCallback } from 'react';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  throwOnError?: boolean;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export const useAsyncOperation = <T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> => {
  const { onSuccess, onError, throwOnError = false } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await operation();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      if (throwOnError) {
        throw error;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, throwOnError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};