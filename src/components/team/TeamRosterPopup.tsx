import React, { useMemo } from 'react';
import { X, Trophy, Timer, Medal, Flag, Briefcase } from 'lucide-react';
import { Player, Platoon, PlatoonNames, Match, Tournament } from '../../types';

interface TeamRosterPopupProps {
  platoon: Platoon;
  onClose: () => void;
  players: Player[];
  matches?: Match[];
  tournaments?: Tournament[];
  currentTournamentId?: string;
}

interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

const TeamRosterPopup: React.FC<TeamRosterPopupProps> = ({
  platoon,
  onClose,
  players,
  matches = [],
  tournaments = [],
  currentTournamentId
}) => {
  const formatTime = (seconds: number | undefined): string => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredPlayers = useMemo(() => {
    console.log("TeamRosterPopup filtering:", { currentTournamentId, tournaments });
    
    if (!currentTournamentId) {
      console.log("No tournament ID provided");
      return players.filter(player => player.platoon === platoon);
    }
    
    const currentTournament = tournaments.find(t => t.id === currentTournamentId);
    if (!currentTournament) {
      console.log("Tournament not found:", currentTournamentId);
      return players.filter(player => player.platoon === platoon);
    }

    console.log("Current tournament:", currentTournament);
    
    // First filter by platoon
    const platoonPlayers = players.filter(player => player.platoon === platoon);
    console.log("Players after platoon filter:", platoonPlayers.length);
    
    // Then filter by sport type - show players whose sportBranch includes the tournament's sportType
    const result = platoonPlayers.filter(player => 
      Array.isArray(player.sportBranch) && 
      player.sportBranch.includes(currentTournament.sportType)
    );
    
    console.log("Final filtered players:", result.length, "sportType:", currentTournament.sportType);
    return result;
  }, [players, platoon, currentTournamentId, tournaments]);

  const teamStats = useMemo(() => {
    const stats: TeamStats = {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    };

    const relevantMatches = currentTournamentId 
      ? matches.filter(match => match.tournamentId === currentTournamentId)
      : matches;

    relevantMatches.forEach(match => {
      if (!match.result) return;

      const isTeamA = match.teamA === platoon;
      const isTeamB = match.teamB === platoon;
      if (!isTeamA && !isTeamB) return;

      stats.played++;
      const teamScore = isTeamA ? match.result.teamAScore : match.result.teamBScore;
      const opponentScore = isTeamA ? match.result.teamBScore : match.result.teamAScore;

      stats.goalsFor += teamScore;
      stats.goalsAgainst += opponentScore;

      if (match.result.winner === platoon) {
        stats.won++;
        stats.points += 3;
      } else if (!match.result.winner) {
        stats.drawn++;
        stats.points += 1;
      } else {
        stats.lost++;
      }
    });

    return stats;
  }, [matches, platoon, currentTournamentId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{PlatoonNames[platoon]}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Team Statistics */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-7 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl font-bold">{teamStats.played}</div>
              <div className="text-sm text-gray-600">משחקים</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-green-600">{teamStats.won}</div>
              <div className="text-sm text-gray-600">נצחונות</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-yellow-600">{teamStats.drawn}</div>
              <div className="text-sm text-gray-600">תיקו</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-red-600">{teamStats.lost}</div>
              <div className="text-sm text-gray-600">הפסדים</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold">{teamStats.goalsFor}</div>
              <div className="text-sm text-gray-600">הבקעות</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold">{teamStats.goalsAgainst}</div>
              <div className="text-sm text-gray-600">ספיגות</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-primary-600">{teamStats.points}</div>
              <div className="text-sm text-gray-600">נקודות</div>
            </div>
          </div>
        </div>
        
        {/* Player Roster Table */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {filteredPlayers.length === 0 ? (
            <p className="text-center text-gray-500">לא נמצאו שחקנים</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-right">שם</th>
                  <th className="py-2 px-4 text-center">שערים</th>
                  <th className="py-2 px-4 text-center">סלים</th>
                  <th className="py-2 px-4 text-center">זמן ריצה</th>
                  <th className="py-2 px-4 text-center">סטטיסטיקה</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {player.firstName} {player.lastName}
                        <span className="inline-flex gap-1 ml-2">
                          {player.isCaptain && (
                            <span className="relative group">
                              <Flag className="h-4 w-4 text-blue-500" />
                              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-12 ml-2 z-10">קפטן</span>
                            </span>
                          )}
                          {player.isManager && (
                            <span className="relative group">
                              <Briefcase className="h-4 w-4 text-purple-500" />
                              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-12 ml-2 z-10">מנהל</span>
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {player.stats?.goalsScored !== undefined ? (
                        <div className="flex items-center justify-center">
                          <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                          {player.stats.goalsScored}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {player.stats?.basketsScored !== undefined ? (
                        <div className="flex items-center justify-center">
                          <Medal className="h-4 w-4 mr-1 text-orange-500" />
                          {player.stats.basketsScored}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {player.isRunner ? (
                        <div className="flex items-center justify-center">
                          <Timer className="h-4 w-4 mr-1 text-green-500" />
                          {formatTime(player.stats?.runningTime)}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {player.isCaptain && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            קפטן
                          </span>
                        )}
                        {player.isManager && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            מנהל
                          </span>
                        )}
                        {player.stats?.goalsScored !== undefined && player.stats.goalsScored > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            מלך השערים
                          </span>
                        )}
                        {player.stats?.basketsScored !== undefined && player.stats.basketsScored > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                            מלך הסלים
                          </span>
                        )}
                        {player.isRunner && player.stats?.runningTime && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            רץ מצטיין
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamRosterPopup;

export { TeamRosterPopup }