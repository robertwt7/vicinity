import { apiClient } from './client';
import { Comment, CreateCommentPayload } from './types';

export async function getCommentsApi(incidentId: string): Promise<Comment[]> {
  console.log('[Comments API] GET /incidents/:id/comments');
  const raw = await apiClient.get<Array<Omit<Comment, 'timestamp'> & { timestamp: string }>>(
    `/incidents/${incidentId}/comments`
  );
  return raw.map((c) => ({ ...c, timestamp: new Date(c.timestamp) }));
}

export async function createCommentApi(payload: CreateCommentPayload): Promise<Comment> {
  console.log('[Comments API] POST /incidents/:id/comments');
  const raw = await apiClient.post<Omit<Comment, 'timestamp'> & { timestamp: string }>(
    `/incidents/${payload.incidentId}/comments`,
    payload
  );
  return { ...raw, timestamp: new Date(raw.timestamp) };
}
