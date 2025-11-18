import axios from 'axios';
import type { Generation, GenerationResponse, ApiSuccessResponse, ApiErrorResponse } from '../types';
import apiClient from '../utils/apiClient';
import { ERROR_MESSAGES, HTTP_STATUS } from '../utils/constants';

export const generationService = {
  async create(
    prompt: string,
    style: string,
    image: File,
    signal?: AbortSignal
  ): Promise<GenerationResponse> {
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('style', style);
      formData.append('image', image);

      const response = await apiClient.post<ApiSuccessResponse<GenerationResponse>>('/generations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle abort
        if (error.code === 'ERR_CANCELED') {
          const abortError = new Error('Request aborted');
          abortError.name = 'AbortError';
          throw abortError;
        }

        // Handle specific error statuses
        if (error.response?.status === HTTP_STATUS.SERVICE_UNAVAILABLE) {
          throw new Error(ERROR_MESSAGES.MODEL_OVERLOADED);
        }

        const errorData = error.response?.data as ApiErrorResponse | undefined;
        let message = errorData?.error?.message || ERROR_MESSAGES.GENERATION_FAILED;
        
        // Handle validation errors (422)
        if (errorData?.error?.errors && errorData.error.errors.length > 0) {
          const validationMessages = errorData.error.errors
            .map(err => `${err.field}: ${err.message}`)
            .join(', ');
          message = `${message} - ${validationMessages}`;
        }
        
        throw new Error(message);
      }
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  },

  async getRecent(limit: number = 5): Promise<Generation[]> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<Generation[]>>('/generations', {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse | undefined;
        const message = errorData?.error?.message || 'Failed to fetch generations';
        throw new Error(message);
      }
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  },
};
