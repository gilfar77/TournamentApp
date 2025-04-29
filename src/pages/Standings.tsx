import React, { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { getAllTournaments } from '../services/tournamentService';
import { Tournament, Platoon, PlatoonNames, TournamentStatus } from '../types';
import Card from '../components/ui/Card';

interface PlatoonStats {
  platoon: Platoon;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  gold: number;   // First place finishes
  silver: number; // Second place finishes
  bronze: number; // Third place finishes
}

const Standings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<PlatoonStats[]>([]);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const tournaments = await getAllTournaments();
        const completedTournaments = tournaments.filter(t => t.status === TournamentStatus.COMPLETED);
        
        // Initialize stats for each platoon
        const stats: Record<Platoon, PlatoonStats> = Object.values(Platoon).reduce((acc, platoon) => ({
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
        }), {} as Record<Platoon, PlatoonStats>);

        // Calculate stats from completed tournaments
        completedTournaments.forEach(tournament => {
          const positions = calculateTournamentPositions(tournament);
          
          // Award points based on position
          if (positions[0]) {
            stats[positions[0]].points += 7;
            stats[positions[0]].gold += 1;
          }
          if (positions[1]) {
            stats[positions[1]].points += 4;
            stats[positions[1]].silver += 1;
          }
          if (positions[2]) {
            stats[positions[2]].points += 2;
            stats[positions[2]].bronze += 1;
          }
          if (positions[3]) {
            stats[positions[3]].points += 1;
          }

          // Calculate match statistics
          tournament.matches.forEach(match => {
            if (!match.result?.winner) return;

            const winningTeam = match.result.winner as Platoon;
            const losingTeam = match.teamA === winningTeam ? match.teamB : match.teamA;

            if (match.result.teamAScore === match.result.teamBScore) {
              stats[match.teamA as Platoon].draws++;
              stats[match.teamB as Platoon].draws++;
            } else {
              stats[winningTeam].wins++;
              stats[losingTeam as Platoon].losses++;
            }
          });
        });

        // Sort by points and then by gold medals
        const sortedStandings = Object.values(stats).sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.gold !== a.gold) return b.gold - a.gold;
          if (b.silver !== a.silver) return b.silver - a.silver;
          return b.bronze - a.bronze;
        });

        setStandings(sortedStandings);
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError('אירעה שגיאה בטעינת הטבלה');
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  const calculateTournamentPositions = (tournament: Tournament): Platoon[] => {
    const positions: Platoon[] = [];
    const knockoutMatches = tournament.matches.filter(m => 
      m.stage === 'final' || m.stage === 'third_place'
    );

    // Find winner (1st place)
    const finalMatch = knockoutMatches.find(m => m.stage === 'final');
    if (finalMatch?.result?.winner) {
      positions[0] = finalMatch.result.winner as Platoon;
      positions[1] = (finalMatch.teamA === finalMatch.result.winner ? 
        finalMatch.teamB : finalMatch.teamA) as Platoon;
    }

    // Find 3rd place
    const thirdPlaceMatch = knockoutMatches.find(m => m.stage === 'third_place');
    if (thirdPlaceMatch?.result?.winner) {
      positions[2] = thirdPlaceMatch.result.winner as Platoon;
      positions[3] = (thirdPlaceMatch.teamA === thirdPlaceMatch.result.winner ? 
        thirdPlaceMatch.teamB : thirdPlaceMatch.teamA) as Platoon;
    }

    return positions;
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
        <h1 className="text-3xl font-bold">טבלת דירוג כללית</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">דירוג</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">פלוגה</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">נקודות</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">נצ׳</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">תיקו</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">הפ׳</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                  <Trophy className="h-5 w-5 text-yellow-500 inline" />
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                  <Trophy className="h-4 w-4 text-gray-400 inline" />
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                  <Medal className="h-4 w-4 text-amber-700 inline" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {standings.map((stat, index) => (
                <tr key={stat.platoon} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && (
                        <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                      )}
                      <span className="font-medium">{PlatoonNames[stat.platoon]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="font-bold text-lg">{stat.points}</span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{stat.wins}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{stat.draws}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{stat.losses}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap font-medium text-yellow-500">
                    {stat.gold}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap font-medium text-gray-400">
                    {stat.silver}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap font-medium text-amber-700">
                    {stat.bronze}
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