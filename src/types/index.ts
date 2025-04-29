// Auth Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

// Platoon Types
export enum Platoon {
  PALCHAN = 'palchan',
  PALSAR = 'palsar',
  PALNAT = 'palnat',
  PALTAZ = 'paltaz',
  PALSAM = 'palsam',
  MESAYAAT = 'mesayaat',
}

export const PlatoonNames: Record<Platoon, string> = {
  [Platoon.PALCHAN]: 'פלחה"ן',
  [Platoon.PALSAR]: 'פלס"ר',
  [Platoon.PALNAT]: 'פלנ"ט',
  [Platoon.PALTAZ]: 'פלת"ץ',
  [Platoon.PALSAM]: 'פלס"ם',
  [Platoon.MESAYAAT]: 'מסייעת',
};

// Sport Types
export enum SportType {
  BASKETBALL = 'basketball',
  SOCCER = 'soccer',
  VOLLEYBALL = 'volleyball',
  TUG_OF_WAR = 'tug_of_war',
  RUNNING = 'running',
}

export const SportNames: Record<SportType, string> = {
  [SportType.BASKETBALL]: 'כדורסל',
  [SportType.SOCCER]: 'כדורגל',
  [SportType.VOLLEYBALL]: 'כדורעף',
  [SportType.TUG_OF_WAR]: 'משיכת חבל',
  [SportType.RUNNING]: 'ריצת 100 מטר',
};

// Player Types
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  platoon: Platoon;
  sportBranch: SportType[];
  isRunner: boolean;
  stats: PlayerStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerStats {
  basketsScored?: number;
  goalsScored?: number;
  runningTime?: number; // in seconds
}

// Tournament Types
export enum TournamentFormat {
  LEAGUE_KNOCKOUT = 'league_knockout',
  INDIVIDUAL = 'individual',
}

export enum TournamentStatus {
  UPCOMING = 'upcoming',
  GROUP_STAGE = 'group_stage',
  KNOCKOUT_STAGE = 'knockout_stage',
  COMPLETED = 'completed',
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  sportType: SportType;
  format: TournamentFormat;
  startDate: Date | string;
  endDate: Date | string;
  status: TournamentStatus;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  groups?: TournamentGroup[];
  teams: Team[];
  matches: Match[];
}

export interface TournamentGroup {
  id: string;
  name: string;
  teams: string[]; // Team IDs
}

// Team Types
export interface Team {
  id: string;
  platoon: Platoon;
  name: string;
  description?: string;
  members: TeamMember[];
  tournamentId: string;
  groupId?: string;
  stats?: TeamStats;
  createdAt: Date | string;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
}

export interface TeamStats {
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  // Sport specific stats
  goalsFor?: number;      // Soccer
  goalsAgainst?: number;  // Soccer
  pointsScored?: number;  // Basketball
  pointsAllowed?: number; // Basketball
}

// Match Types
export enum MatchStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MatchStage {
  GROUP = 'group',
  QUARTER_FINAL = 'quarter_final',
  SEMI_FINAL = 'semi_final',
  THIRD_PLACE = 'third_place',
  FINAL = 'final',
}

export interface MatchResult {
  teamAScore: number;
  teamBScore: number;
  winner: string | null; // Team ID
  status?: MatchStatus;  // Add status field
  actualStartTime?: Date | string; // Add actual start time
  details?: {
    periods?: number[];   // Basketball/Soccer period scores
    sets?: number[][];    // Volleyball set scores
    time?: number;        // Running time in seconds
  };
  notes?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  stage: MatchStage;
  groupId?: string;
  round: number;
  teamA: string; // Team ID
  teamB: string; // Team ID
  startTime: Date | string;
  location?: string;
  status: MatchStatus;
  result?: MatchResult;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Running Event Types
export interface RunningParticipant {
  id: string;
  userId: string;
  name: string;
  platoon: Platoon;
  time: number; // Time in seconds
  rank?: number;
  tournamentId: string;
  createdAt: Date | string;
}