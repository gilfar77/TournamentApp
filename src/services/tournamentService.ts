import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  Timestamp, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Tournament, 
  Team, 
  Match, 
  TournamentStatus, 
  SportType, 
  TournamentFormat,
  Platoon,
  RunningParticipant,
  TournamentGroup,
  MatchStage,
  MatchStatus
} from '../types';

// Collection references
const tournamentsRef = collection(db, 'tournaments');

const MATCH_DURATION = 20; // minutes
const BREAK_DURATION = 5; // minutes between matches

const updateSemiFinalTeams = async (
  tournamentId: string,
  matches: Match[],
  groups: TournamentGroup[]
) => {
  const batch = writeBatch(db);
  const tournamentRef = doc(db, 'tournaments', tournamentId);

  // Get group standings
  const groupStandings = groups.map(group => {
    const standings: Record<string, { points: number; goalDiff: number; goalsFor: number }> = {};
    
    // Initialize standings
    group.teams.forEach(team => {
      standings[team] = { points: 0, goalDiff: 0, goalsFor: 0 };
    });

    // Calculate points from matches
    matches
      .filter(m => m.groupId === group.id && m.status === MatchStatus.COMPLETED)
      .forEach(match => {
        if (!match.result) return;

        const { teamAScore, teamBScore, winner } = match.result;
        
        if (winner === match.teamA) {
          standings[match.teamA].points += 3;
        } else if (winner === match.teamB) {
          standings[match.teamB].points += 3;
        } else {
          standings[match.teamA].points += 1;
          standings[match.teamB].points += 1;
        }

        standings[match.teamA].goalsFor += teamAScore;
        standings[match.teamA].goalDiff += teamAScore - teamBScore;
        standings[match.teamB].goalsFor += teamBScore;
        standings[match.teamB].goalDiff += teamBScore - teamAScore;
      });

    // Sort teams by points, goal difference, and goals scored
    return Object.entries(standings)
      .sort(([, a], [, b]) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
      })
      .map(([team]) => team);
  });

  // Update semi-final matches
  const semiFinals = matches.filter(m => m.stage === MatchStage.SEMI_FINAL);
  
  if (semiFinals.length === 2) {
    // First semi-final: 1st group A vs 2nd group B
    const sf1 = semiFinals.find(m => m.id === 'sf1');
    if (sf1) {
      const matchRef = doc(collection(tournamentRef, 'matches'), sf1.id);
      batch.update(matchRef, {
        teamA: groupStandings[0][0], // Winner Group A
        teamB: groupStandings[1][1], // Runner-up Group B
        updatedAt: serverTimestamp()
      });
    }

    // Second semi-final: 1st group B vs 2nd group A
    const sf2 = semiFinals.find(m => m.id === 'sf2');
    if (sf2) {
      const matchRef = doc(collection(tournamentRef, 'matches'), sf2.id);
      batch.update(matchRef, {
        teamA: groupStandings[1][0], // Winner Group B
        teamB: groupStandings[0][1], // Runner-up Group A
        updatedAt: serverTimestamp()
      });
    }
  }

  await batch.commit();
};

const generateKnockoutMatches = (
  tournamentId: string,
  startDate: Date,
  lastGroupMatch: Date
): Match[] => {
  const matches: Match[] = [];
  let currentTime = new Date(Math.max(startDate.getTime(), lastGroupMatch.getTime() + (BREAK_DURATION * 60000)));

  // Semi Finals
  matches.push(
    {
      id: 'sf1',
      tournamentId,
      stage: MatchStage.SEMI_FINAL,
      round: 1,
      teamA: 'TBD-A1', // Winner Group A
      teamB: 'TBD-B2', // Runner-up Group B
      startTime: new Date(currentTime),
      location: 'מגרש מרכזי',
      status: MatchStatus.SCHEDULED,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sf2',
      tournamentId,
      stage: MatchStage.SEMI_FINAL,
      round: 1,
      teamA: 'TBD-B1', // Winner Group B
      teamB: 'TBD-A2', // Runner-up Group A
      startTime: new Date(currentTime.getTime() + ((MATCH_DURATION + BREAK_DURATION) * 60000)),
      location: 'מגרש מרכזי',
      status: MatchStatus.SCHEDULED,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );

  // Update current time for finals
  currentTime = new Date(currentTime.getTime() + ((MATCH_DURATION + BREAK_DURATION) * 2 * 60000));

  // Third Place Match
  matches.push({
    id: '3rd',
    tournamentId,
    stage: MatchStage.THIRD_PLACE,
    round: 1,
    teamA: 'TBD-SF1L', // Loser of first semi-final
    teamB: 'TBD-SF2L', // Loser of second semi-final
    startTime: new Date(currentTime),
    location: 'מגרש מרכזי',
    status: MatchStatus.SCHEDULED,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Final
  matches.push({
    id: 'final',
    tournamentId,
    stage: MatchStage.FINAL,
    round: 1,
    teamA: 'TBD-SF1W', // Winner of first semi-final
    teamB: 'TBD-SF2W', // Winner of second semi-final
    startTime: new Date(currentTime.getTime() + ((MATCH_DURATION + BREAK_DURATION) * 60000)),
    location: 'מגרש מרכזי',
    status: MatchStatus.SCHEDULED,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return matches;
};

const generateGroupMatches = (
  tournamentId: string, 
  groups: TournamentGroup[], 
  startDate: Date
): Match[] => {
  const matches: Match[] = [];
  const startTime = new Date(startDate);
  
  // Generate group stage matches with alternating groups
  const groupMatches: { groupId: string; teamA: string; teamB: string }[] = [];
  
  groups.forEach((group) => {
    const teams = group.teams;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        groupMatches.push({
          groupId: group.id,
          teamA: teams[i],
          teamB: teams[j]
        });
      }
    }
  });

  // Alternate between groups when scheduling matches
  let currentTime = new Date(startTime);
  let matchIndex = 0;
  let lastMatchTime = currentTime;
  
  while (groupMatches.length > 0) {
    // Take matches alternating between groups
    const groupAMatch = groupMatches.find(m => m.groupId === 'group-a');
    const groupBMatch = groupMatches.find(m => m.groupId === 'group-b');
    
    if (groupAMatch) {
      matches.push({
        id: `g${++matchIndex}`,
        tournamentId,
        stage: MatchStage.GROUP,
        groupId: groupAMatch.groupId,
        round: matchIndex,
        teamA: groupAMatch.teamA,
        teamB: groupAMatch.teamB,
        startTime: new Date(currentTime),
        location: 'מגרש מרכזי',
        status: MatchStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      currentTime = new Date(currentTime.getTime() + (MATCH_DURATION + BREAK_DURATION) * 60000);
      lastMatchTime = currentTime;
      groupMatches.splice(groupMatches.indexOf(groupAMatch), 1);
    }
    
    if (groupBMatch) {
      matches.push({
        id: `g${++matchIndex}`,
        tournamentId,
        stage: MatchStage.GROUP,
        groupId: groupBMatch.groupId,
        round: matchIndex,
        teamA: groupBMatch.teamA,
        teamB: groupBMatch.teamB,
        startTime: new Date(currentTime),
        location: 'מגרש מרכזי',
        status: MatchStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      currentTime = new Date(currentTime.getTime() + (MATCH_DURATION + BREAK_DURATION) * 60000);
      lastMatchTime = currentTime;
      groupMatches.splice(groupMatches.indexOf(groupBMatch), 1);
    }
  }

  // Generate knockout stage matches
  const knockoutMatches = generateKnockoutMatches(tournamentId, startDate, lastMatchTime);
  return [...matches, ...knockoutMatches];
};

// Tournament Management
export const createTournament = async (tournament: Omit<Tournament, 'id' | 'teams' | 'matches' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const format = tournament.sportType === SportType.RUNNING 
      ? TournamentFormat.INDIVIDUAL 
      : TournamentFormat.LEAGUE_KNOCKOUT;

    // Create initial groups with empty teams
    const groups: TournamentGroup[] = [
      {
        id: 'group-a',
        name: 'בית א׳',
        teams: []
      },
      {
        id: 'group-b',
        name: 'בית ב׳',
        teams: []
      }
    ];

    const tournamentData = {
      ...tournament,
      format,
      groups,
      startDate: Timestamp.fromDate(new Date(tournament.startDate)),
      endDate: Timestamp.fromDate(new Date(tournament.endDate)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Create tournament first to get the ID
    const tournamentRef = await addDoc(tournamentsRef, tournamentData);
    
    return tournamentRef.id;
  } catch (error) {
    console.error("Error creating tournament:", error);
    throw error;
  }
};

export const updateTournamentGroups = async (
  tournamentId: string, 
  groups: TournamentGroup[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Update tournament with new groups
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    
    if (!tournamentDoc.exists()) {
      throw new Error('Tournament not found');
    }

    const tournamentData = tournamentDoc.data();
    
    // Update tournament document with new groups
    batch.update(tournamentRef, {
      groups: groups.map(group => ({
        id: group.id,
        name: group.name,
        teams: group.teams
      })),
      updatedAt: serverTimestamp()
    });

    // Generate and create matches based on the new groups
    const matches = generateGroupMatches(
      tournamentId,
      groups,
      tournamentData.startDate.toDate()
    );

    // Delete existing matches if any
    const matchesRef = collection(tournamentRef, 'matches');
    const existingMatchesSnapshot = await getDocs(matchesRef);
    existingMatchesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Create new matches
    matches.forEach(match => {
      const newMatchRef = doc(matchesRef, match.id);
      batch.set(newMatchRef, {
        ...match,
        startTime: Timestamp.fromDate(match.startTime as Date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error updating tournament groups:", error);
    throw error;
  }
};

export const updateTournament = async (id: string, data: Partial<Tournament>): Promise<void> => {
  try {
    const tournamentRef = doc(db, 'tournaments', id);
    await updateDoc(tournamentRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating tournament:", error);
    throw error;
  }
};

export const deleteTournament = async (tournamentId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    
    // Delete all matches in the subcollection
    const matchesRef = collection(tournamentRef, 'matches');
    const matchesSnapshot = await getDocs(matchesRef);
    matchesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete tournament document
    batch.delete(tournamentRef);
    
    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error("Error deleting tournament:", error);
    throw error;
  }
};

export const getAllTournaments = async (): Promise<Tournament[]> => {
  const q = query(tournamentsRef, orderBy('startDate', 'desc'));
  const snapshot = await getDocs(q);
  
  const tournaments = await Promise.all(snapshot.docs.map(async doc => {
    // Fetch matches from subcollection
    const matchesRef = collection(doc.ref, 'matches');
    const matchesQuery = query(matchesRef, orderBy('startTime'));
    const matchesSnapshot = await getDocs(matchesQuery);
    const matches = matchesSnapshot.docs.map(matchDoc => ({
      id: matchDoc.id,
      ...matchDoc.data(),
      startTime: matchDoc.data().startTime.toDate(),
      createdAt: matchDoc.data().createdAt.toDate(),
      updatedAt: matchDoc.data().updatedAt.toDate()
    } as Match));

    return {
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      teams: [], // These will be fetched separately when needed
      matches
    } as Tournament;
  }));

  return tournaments;
};

export const getTournamentById = async (id: string): Promise<Tournament | null> => {
  try {
    const docRef = doc(db, 'tournaments', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const tournamentData = docSnap.data();
    
    // Fetch matches from subcollection
    const matchesRef = collection(docRef, 'matches');
    const matchesQuery = query(matchesRef, orderBy('startTime'));
    const matchesSnapshot = await getDocs(matchesQuery);
    const matches = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Match));
    
    return {
      id,
      ...tournamentData,
      startDate: tournamentData.startDate.toDate(),
      endDate: tournamentData.endDate.toDate(),
      createdAt: tournamentData.createdAt.toDate(),
      updatedAt: tournamentData.updatedAt.toDate(),
      matches
    } as Tournament;
  } catch (error) {
    console.error("Error getting tournament:", error);
    throw error;
  }
};

// Match Management
export const updateMatchResult = async (tournamentId: string, matchId: string, result: Match['result']): Promise<void> => {
  try {
    if (!tournamentId || !matchId) {
      throw new Error('Tournament ID and Match ID are required');
    }

    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const matchRef = doc(collection(tournamentRef, 'matches'), matchId);
    
    // Get the current match data
    const matchDoc = await getDoc(matchRef);
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    const matchData = matchDoc.data() as Match;
    
    // Update match result and status
    await updateDoc(matchRef, {
      result,
      status: result.status || MatchStatus.COMPLETED,
      updatedAt: serverTimestamp()
    });

    // Get all matches to check tournament status
    const matchesRef = collection(tournamentRef, 'matches');
    const matchesQuery = query(matchesRef, orderBy('startTime'));
    const matchesSnapshot = await getDocs(matchesQuery);
    const matches = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Match));

    // Get tournament data
    const tournamentDoc = await getDoc(tournamentRef);
    if (!tournamentDoc.exists()) {
      throw new Error('Tournament not found');
    }
    const tournamentData = tournamentDoc.data() as Tournament;

    // Check if this is the first match being started
    if (matchData.status === MatchStatus.SCHEDULED && result.status === MatchStatus.IN_PROGRESS) {
      if (tournamentData.status === TournamentStatus.UPCOMING) {
        await updateDoc(tournamentRef, {
          status: TournamentStatus.GROUP_STAGE,
          updatedAt: serverTimestamp()
        });
      }
    }

    // Check if all group matches are completed
    const groupMatches = matches.filter(m => m.stage === MatchStage.GROUP);
    const allGroupMatchesCompleted = groupMatches.every(m => m.status === MatchStatus.COMPLETED);
    const hasGroupMatches = groupMatches.length > 0;

    // If all group matches are completed, update semi-final teams
    if (allGroupMatchesCompleted && hasGroupMatches && tournamentData.groups) {
      await updateSemiFinalTeams(tournamentId, matches, tournamentData.groups);
    }

    // Check if all matches are completed
    const allMatchesCompleted = matches.every(m => m.status === MatchStatus.COMPLETED);

    // Update tournament status based on match completion
    if (allMatchesCompleted) {
      await updateDoc(tournamentRef, {
        status: TournamentStatus.COMPLETED,
        updatedAt: serverTimestamp()
      });
    } else if (allGroupMatchesCompleted && hasGroupMatches) {
      await updateDoc(tournamentRef, {
        status: TournamentStatus.KNOCKOUT_STAGE,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error updating match result:", error);
    throw error;
  }
};