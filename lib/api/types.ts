import { CategoryId } from '@/constants/categories';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface Incident {
  id: string;
  categoryId: CategoryId;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  reportedBy: string;
  upvotes: number;
}

export interface CreateIncidentPayload {
  categoryId: CategoryId;
  description: string;
  latitude: number;
  longitude: number;
}

export interface Comment {
  id: string;
  incidentId: string;
  text: string;
  author: string;
  isAnonymous: boolean;
  timestamp: Date;
}

export interface CreateCommentPayload {
  incidentId: string;
  text: string;
  isAnonymous: boolean;
}
