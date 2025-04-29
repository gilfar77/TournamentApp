import React from 'react';
import { X } from 'lucide-react';
import { Platoon, PlatoonNames } from '../../types';
import Card from '../ui/Card';

interface TeamRosterModalProps {
  platoon: Platoon;
  isOpen: boolean;
  onClose: () => void;
  statistics: {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  players: {
    id: string;
    name: string;
    platoon: Platoon;
    position?: string;
    number?: number;
  }[];
}

const TeamRosterModal: React.FC<TeamRosterModalProps> = ({
  platoon,
  isOpen,
  onClose,
  statistics,
  players
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{PlatoonNames[platoon]}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">סטטיסטיקות</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">{statistics.wins}</div>
              <div className="text-sm text-gray-600">נצחונות</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">{statistics.draws}</div>
              <div className="text-sm text-gray-600">תיקו</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">{statistics.losses}</div>
              <div className="text-sm text-gray-600">הפסדים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">{statistics.goalsFor}</div>
              <div className="text-sm text-gray-600">שערים לזכות</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">{statistics.goalsAgainst}</div>
              <div className="text-sm text-gray-600">שערים לחובת</div>
            </div>
          </div>
        </div>

        {/* Roster Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">סגל השחקנים</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-4">מספר</th>
                  <th className="text-right py-2 px-4">שם</th>
                  <th className="text-right py-2 px-4">תפקיד</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-center">{player.number || '-'}</td>
                    <td className="py-2 px-4">{player.name}</td>
                    <td className="py-2 px-4">{player.position || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeamRosterModal; 