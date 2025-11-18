import axios from 'axios';
import type { AuthResponse, ApiSuccessResponse, ApiErrorResponse } from '../types';
import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '../utils/constants';

const authClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await authClient.post<ApiSuccessResponse<AuthResponse>>('/auth/signup', {
        email,
        password,
        name,
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse | undefined;
        let message = errorData?.error?.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
        
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

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authClient.post<ApiSuccessResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse | undefined;
        let message = errorData?.error?.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
        
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

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  setUser(user: AuthResponse['user']): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser(): AuthResponse['user'] | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  logout(): void {
    this.removeToken();
    this.removeUser();
  },
};
