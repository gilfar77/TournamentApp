import { Platoon } from './platoon';

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  startTime: string;
  endTime?: string;
  location?: string;
  homeTeam: Platoon;
  awayTeam: Platoon;
  tugOfWarWinner?: Platoon;
  tugOfWarScore?: number;
  tugOfWarTime?: number;
  tugOfWarNotes?: string;
  obstacleCourseWinner?: Platoon;
  obstacleCourseScore?: number;
  obstacleCourseTime?: number;
  obstacleCourseNotes?: string;
  relayRaceWinner?: Platoon;
  relayRaceScore?: number;
  relayRaceTime?: number;
  relayRaceNotes?: string;
  totalScoreA?: number;
  totalScoreB?: number;
  winner?: Platoon;
} 