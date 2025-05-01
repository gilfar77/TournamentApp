import React, { useMemo } from 'react';
import { X, Trophy, Timer, Medal } from 'lucide-react';
import { Player, Platoon, PlatoonNames, Match, Tournament } from '../../types';

interface TeamRosterPopupProps {
  platoon: Platoon;
  onClose: () => void;
  players: Player[];
  matches?: Match[];
  tournaments?: Tournament[];
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
  tournaments = []
}) => {
  const formatTime = (seconds: number | undefined): string => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

    matches.forEach(match => {
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
  }, [matches, platoon]);

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
          {players.length === 0 ? (
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
                {players.map((player) => (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {player.firstName} {player.lastName}
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
                        {player.stats?.goalsScored > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            מלך השערים
                          </span>
                        )}
                        {player.stats?.basketsScored > 0 && (
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