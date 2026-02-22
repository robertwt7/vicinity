import { apiClient } from './client';
import { User, Incident } from './types';

export async function getUserProfileApi(id: string): Promise<User> {
  console.log('[Users API] GET /users/:id', id);
  return apiClient.get<User>(`/users/${id}`);
}

export async function getUserIncidentsApi(id: string): Promise<Incident[]> {
  console.log('[Users API] GET /users/:id/incidents', id);
  const raw = await apiClient.get<Array<Omit<Incident, 'timestamp'> & { timestamp: string }>>(`/users/${id}/incidents`);
  return raw.map((i) => ({ ...i, timestamp: new Date(i.timestamp) }));
}
