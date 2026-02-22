import createContextHook from '@nkzw/create-context-hook';
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Incident, CreateIncidentPayload } from '@/lib/api/types';
import {
  getIncidentsApi,
  createIncidentApi,
  upvoteIncidentApi,
} from '@/lib/api/incidents';

export const [IncidentsProvider, useIncidents] = createContextHook(() => {
  const queryClient = useQueryClient();

  const incidentsQuery = useQuery({
    queryKey: ['incidents'],
    queryFn: getIncidentsApi,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: createIncidentApi,
    onSuccess: (newIncident) => {
      queryClient.setQueryData<Incident[]>(['incidents'], (prev = []) => [
        newIncident,
        ...prev,
      ]);
      console.log('[Incidents] Created:', newIncident.id, newIncident.title);
    },
    onError: (err) => {
      console.error('[Incidents] Create failed:', err);
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: upvoteIncidentApi,
    onSuccess: (updated) => {
      queryClient.setQueryData<Incident[]>(['incidents'], (prev = []) =>
        prev.map((i) => (i.id === updated.id ? updated : i))
      );
      console.log('[Incidents] Upvoted:', updated.id);
    },
  });

  const addIncident = useCallback(
    (data: CreateIncidentPayload) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const upvoteIncident = useCallback(
    (id: string) => upvoteMutation.mutateAsync(id),
    [upvoteMutation]
  );

  return {
    incidents: incidentsQuery.data ?? [],
    isLoading: incidentsQuery.isLoading,
    isSubmitting: createMutation.isPending,
    addIncident,
    upvoteIncident,
  };
});
