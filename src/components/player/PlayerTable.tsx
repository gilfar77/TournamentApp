import React from 'react';
import { Edit2, Trash2, Timer, Trophy, Medal, Flag, Briefcase } from 'lucide-react';
import { Player, PlatoonNames, SportNames, Platoon } from '../../types';

interface PlayerTableProps {
  players: Player[];
  onEdit?: (player: Player) => void;
  onDelete?: (playerId: string) => void;
  isAdmin?: boolean;
}

const platoonColors: Record<Platoon | string, { bg: string; text: string }> = {
  [Platoon.PALSAR]: { bg: 'bg-sky-100', text: 'text-sky-900' },
  [Platoon.PALCHAN]: { bg: 'bg-orange-100', text: 'text-orange-900' },
  [Platoon.PALNAT]: { bg: 'bg-gray-100', text: 'text-gray-900' },
  [Platoon.MAFGAD]: { bg: 'bg-gray-700', text: 'text-white' },
  [Platoon.PALTAZ]: { bg: 'bg-blue-800', text: 'text-white' },
  [Platoon.MESAYAAT]: { bg: 'bg-black', text: 'text-white' },
  'default': { bg: 'bg-gray-500', text: 'text-white' } // Default case for invalid platoons
};

const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  onEdit,
  onDelete,
  isAdmin = false
}) => {
  const formatTime = (seconds: number | undefined): string => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPlatoonColors = (platoon: Platoon | undefined) => {
    return platoonColors[platoon || 'default'] || platoonColors['default'];
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              פלוגה
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              שם מלא
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              ענפי ספורט
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              סטטיסטיקה
            </th>
            {isAdmin && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                פעולות
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {players.map((player) => {
            const colors = getPlatoonColors(player.platoon);
            return (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${colors.bg}`}>
                      <Trophy className={`h-4 w-4 ${colors.text}`} />
                    </div>
                    <span className="font-medium">{PlatoonNames[player.platoon] || 'לא ידוע'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {player.firstName} {player.lastName}
                    {(player.isCaptain || player.isManager) && (
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
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {player.sportBranch.map(sport => (
                      <span
                        key={sport}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {SportNames[sport]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {player.isCaptain && (
                      <div className="flex items-center text-sm">
                        <Flag className="h-4 w-4 mr-1 text-blue-500" />
                        <span>קפטן</span>
                      </div>
                    )}
                    {player.isManager && (
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-1 text-purple-500" />
                        <span>מנהל</span>
                      </div>
                    )}
                    {player.stats.basketsScored !== undefined && (
                      <div className="flex items-center text-sm">
                        <Trophy className="h-4 w-4 mr-1 text-orange-500" />
                        <span>{player.stats.basketsScored} סלים</span>
                      </div>
                    )}
                    {player.stats.goalsScored !== undefined && (
                      <div className="flex items-center text-sm">
                        <Medal className="h-4 w-4 mr-1 text-blue-500" />
                        <span>{player.stats.goalsScored} שערים</span>
                      </div>
                    )}
                    {player.isRunner && (
                      <div className="flex items-center text-sm">
                        <Timer className="h-4 w-4 mr-1 text-green-500" />
                        <span>{formatTime(player.stats.runningTime)}</span>
                      </div>
                    )}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit?.(player)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete?.(player.id)}
                        className="text-error-600 hover:text-error-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;