import { Platoon } from './platoon';
import { Match } from './match';

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  platoons: Platoon[];
  matches: Match[];
} 