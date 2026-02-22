import { apiClient } from './client';
import { Incident, CreateIncidentPayload } from './types';

export async function getIncidentsApi(): Promise<Incident[]> {
  console.log('[Incidents API] GET /incidents');
  const raw = await apiClient.get<Array<Omit<Incident, 'timestamp'> & { timestamp: string }>>('/incidents');
  return raw.map((i) => ({ ...i, timestamp: new Date(i.timestamp) }));
}

export async function createIncidentApi(payload: CreateIncidentPayload): Promise<Incident> {
  console.log('[Incidents API] POST /incidents');
  const raw = await apiClient.post<Omit<Incident, 'timestamp'> & { timestamp: string }>('/incidents', payload);
  return { ...raw, timestamp: new Date(raw.timestamp) };
}

export async function upvoteIncidentApi(id: string): Promise<Incident> {
  console.log('[Incidents API] POST /incidents/:id/upvote');
  const raw = await apiClient.post<Omit<Incident, 'timestamp'> & { timestamp: string }>(`/incidents/${id}/upvote`);
  return { ...raw, timestamp: new Date(raw.timestamp) };
}

export async function downvoteIncidentApi(id: string): Promise<Incident> {
  console.log('[Incidents API] POST /incidents/:id/downvote');
  const raw = await apiClient.post<Omit<Incident, 'timestamp'> & { timestamp: string }>(`/incidents/${id}/downvote`);
  return { ...raw, timestamp: new Date(raw.timestamp) };
}

export async function deleteIncidentApi(id: string): Promise<void> {
  console.log('[Incidents API] DELETE /incidents/:id');
  await apiClient.delete(`/incidents/${id}`);
}
