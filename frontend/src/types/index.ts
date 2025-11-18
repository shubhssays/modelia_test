export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Generation {
  id: number;
  prompt: string;
  style: string;
  imageUrl: string;
  resultUrl?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface GenerationRequest {
  prompt: string;
  style: string;
  image: File;
}

export interface GenerationResponse {
  id: number;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: string;
  status: string;
}

export type StyleOption = 'casual' | 'formal' | 'vintage' | 'modern' | 'elegant';
