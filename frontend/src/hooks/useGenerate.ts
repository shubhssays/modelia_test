import { useState, useRef } from 'react';
import { generationService } from '../services/generation';
import { RETRY_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import type { GenerationResponse } from '../types';

interface UseGenerateOptions {
  onSuccess?: (data: GenerationResponse) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export function useGenerate(options: UseGenerateOptions = {}) {
  const { onSuccess, onError, maxRetries = RETRY_CONFIG.MAX_ATTEMPTS } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = async (prompt: string, style: string, image: File): Promise<GenerationResponse | null> => {
    setIsLoading(true);
    setError(null);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const result = await generationService.create(
        prompt,
        style,
        image,
        abortControllerRef.current.signal
      );

      setRetryCount(0);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(ERROR_MESSAGES.GENERATION_FAILED);
      
      // Don't set error if request was aborted
      if (error.name === 'AbortError') {
        return null;
      }

      setError(error);
      
      // Check if it's a "Model overloaded" error and we can retry
      if (error.message.includes(ERROR_MESSAGES.MODEL_OVERLOADED) && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
      }
      
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setError(null);
      setRetryCount(0);
    }
  };

  const retry = async (prompt: string, style: string, image: File) => {
    if (retryCount >= maxRetries) {
      return null;
    }
    
    // Exponential backoff with configuration
    const delay = Math.min(
      RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, retryCount),
      RETRY_CONFIG.MAX_DELAY
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return generate(prompt, style, image);
  };

  const canRetry = retryCount < maxRetries && error?.message.includes(ERROR_MESSAGES.MODEL_OVERLOADED);

  return {
    generate,
    abort,
    retry,
    isLoading,
    error,
    retryCount,
    canRetry,
  };
}
