import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { Tournament, Platoon, PlatoonNames, TournamentStatus, MatchStatus } from '../types';
import { getAllTournaments } from '../services/tournamentService';
import Card from '../components/ui/Card';

interface PlatoonStanding {
  platoon: Platoon;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  gold: number;
  silver: number;
  bronze: number;
}

const Standings: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<PlatoonStanding[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
        setTournaments(data);
        calculateStandings(data);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('אירעה שגיאה בטעינת הטורנירים');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const calculateStandings = (tournaments: Tournament[]) => {
    // Initialize standings for all platoons
    const platoonStandings: Record<Platoon, PlatoonStanding> = Object.values(Platoon).reduce((acc, platoon) => ({
      ...acc,
      [platoon]: {
        platoon,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gold: 0,
        silver: 0,
        bronze: 0
      }
    }), {} as Record<Platoon, PlatoonStanding>);

    // Process each tournament
    tournaments.forEach(tournament => {
      if (tournament.status !== TournamentStatus.COMPLETED) return;

      // Find the final match
      const finalMatch = tournament.matches.find(m => m.stage === 'final' && m.status === MatchStatus.COMPLETED);
      const thirdPlaceMatch = tournament.matches.find(m => m.stage === 'third_place' && m.status === MatchStatus.COMPLETED);

      if (finalMatch?.result) {
        // Award points for 1st and 2nd place
        const winner = finalMatch.result.winner;
        const loser = finalMatch.teamA === winner ? finalMatch.teamB : finalMatch.teamA;
        
        platoonStandings[winner as Platoon].points += 7;
        platoonStandings[winner as Platoon].gold += 1;
        platoonStandings[loser as Platoon].points += 4;
        platoonStandings[loser as Platoon].silver += 1;
      }

      if (thirdPlaceMatch?.result) {
        // Award points for 3rd and 4th place
        const thirdPlace = thirdPlaceMatch.result.winner;
        const fourthPlace = thirdPlaceMatch.teamA === thirdPlace ? thirdPlaceMatch.teamB : thirdPlaceMatch.teamA;
        
        platoonStandings[thirdPlace as Platoon].points += 2;
        platoonStandings[thirdPlace as Platoon].bronze += 1;
        platoonStandings[fourthPlace as Platoon].points += 1;
      }

      // Count wins, draws, and losses from all matches
      tournament.matches.forEach(match => {
        if (match.status !== MatchStatus.COMPLETED || !match.result) return;

        const { teamAScore, teamBScore } = match.result;
        
        if (teamAScore > teamBScore) {
          platoonStandings[match.teamA as Platoon].wins += 1;
          platoonStandings[match.teamB as Platoon].losses += 1;
        } else if (teamAScore < teamBScore) {
          platoonStandings[match.teamB as Platoon].wins += 1;
          platoonStandings[match.teamA as Platoon].losses += 1;
        } else {
          platoonStandings[match.teamA as Platoon].draws += 1;
          platoonStandings[match.teamB as Platoon].draws += 1;
        }
      });
    });

    // Convert to array and sort by points
    const sortedStandings = Object.values(platoonStandings).sort((a, b) => b.points - a.points);
    setStandings(sortedStandings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-100 text-error-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Trophy className="h-8 w-8 text-primary-500 mr-3" />
        <h1 className="text-3xl font-bold">דירוג כללי</h1>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4">דירוג</th>
                <th className="text-right py-3 px-4">פלוגה</th>
                <th className="text-center py-3 px-4">נקודות</th>
                <th className="text-center py-3 px-4">נצחונות</th>
                <th className="text-center py-3 px-4">תיקו</th>
                <th className="text-center py-3 px-4">הפסדים</th>
                <th className="text-center py-3 px-4">מדליות</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <tr key={standing.platoon} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-center">
                    {index === 0 ? (
                      <Trophy className="h-6 w-6 text-yellow-500 mx-auto" />
                    ) : index === 1 ? (
                      <Trophy className="h-5 w-5 text-gray-400 mx-auto" />
                    ) : (
                      <span className="font-medium">{index + 1}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium">{PlatoonNames[standing.platoon]}</td>
                  <td className="py-3 px-4 text-center font-bold">{standing.points}</td>
                  <td className="py-3 px-4 text-center">{standing.wins}</td>
                  <td className="py-3 px-4 text-center">{standing.draws}</td>
                  <td className="py-3 px-4 text-center">{standing.losses}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {standing.gold > 0 && (
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="mr-1">{standing.gold}</span>
                        </div>
                      )}
                      {standing.silver > 0 && (
                        <div className="flex items-center">
                          <Trophy className="h-3 w-3 text-gray-400" />
                          <span className="mr-1">{standing.silver}</span>
                        </div>
                      )}
                      {standing.bronze > 0 && (
                        <div className="flex items-center">
                          <Medal className="h-3 w-3 text-amber-600" />
                          <span>{standing.bronze}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Standings; 