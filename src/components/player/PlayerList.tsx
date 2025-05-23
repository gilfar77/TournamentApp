import React from 'react';
import { User, Shield, Timer, Trophy, Flag, Briefcase } from 'lucide-react';
import { Player, PlatoonNames, SportNames } from '../../types';
import Card from '../ui/Card';

interface PlayerListProps {
  players: Player[];
  onEdit?: (player: Player) => void;
  onDelete?: (playerId: string) => void;
  isAdmin?: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({ 
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <Card key={player.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <User className="h-10 w-10 text-primary-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">
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
                </h3>
                <p className="text-accent-600">{PlatoonNames[player.platoon]}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit?.(player)}
                  className="text-primary-500 hover:text-primary-600"
                >
                  <Shield className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete?.(player.id)}
                  className="text-error-500 hover:text-error-600"
                >
                  <Trophy className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium">ענפי ספורט: </span>
              {player.sportBranch.map(sport => SportNames[sport]).join(', ')}
            </div>
            
            {player.isCaptain && (
              <div className="text-sm text-blue-700 font-medium">
                <span className="flex items-center">
                  <Flag className="h-4 w-4 mr-1" />
                  קפטן
                </span>
              </div>
            )}
            
            {player.isManager && (
              <div className="text-sm text-purple-700 font-medium">
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  מנהל
                </span>
              </div>
            )}
            
            {player.stats.basketsScored !== undefined && (
              <div className="text-sm">
                <span className="font-medium">סלים: </span>
                {player.stats.basketsScored}
              </div>
            )}
            
            {player.stats.goalsScored !== undefined && (
              <div className="text-sm">
                <span className="font-medium">שערים: </span>
                {player.stats.goalsScored}
              </div>
            )}
            
            {player.isRunner && (
              <div className="text-sm">
                <span className="font-medium">זמן ריצה: </span>
                <span className="flex items-center">
                  <Timer className="h-4 w-4 mr-1" />
                  {formatTime(player.stats.runningTime)}
                </span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PlayerList;