import Colors from './colors';

export type CategoryId =
  | 'accident'
  | 'police'
  | 'fight'
  | 'fire'
  | 'entertainment'
  | 'event'
  | 'hazard'
  | 'roadblock';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'accident', label: 'Accident', emoji: '🚗', color: Colors.accident },
  { id: 'police', label: 'Police', emoji: '👮', color: Colors.police },
  { id: 'fight', label: 'Fight', emoji: '⚔️', color: Colors.fight },
  { id: 'fire', label: 'Fire', emoji: '🔥', color: Colors.fire },
  { id: 'entertainment', label: 'Performer', emoji: '🎸', color: Colors.entertainment },
  { id: 'event', label: 'Pop-up', emoji: '🎉', color: Colors.event },
  { id: 'hazard', label: 'Hazard', emoji: '⚠️', color: Colors.hazard },
  { id: 'roadblock', label: 'Road Block', emoji: '🛑', color: Colors.roadblock },
];

export function getCategoryById(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
