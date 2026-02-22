import { apiClient } from './client';
import { AuthResponse, LoginPayload, RegisterPayload, User } from './types';

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  console.log('[Auth API] POST /auth/login');
  return apiClient.post<AuthResponse>('/auth/login', payload);
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  console.log('[Auth API] POST /auth/register');
  return apiClient.post<AuthResponse>('/auth/register', payload);
}

export async function logoutApi(): Promise<void> {
  console.log('[Auth API] POST /auth/logout');
  await apiClient.post('/auth/logout');
}

export async function getMeApi(): Promise<User> {
  console.log('[Auth API] GET /auth/me');
  return apiClient.get<User>('/auth/me');
}
