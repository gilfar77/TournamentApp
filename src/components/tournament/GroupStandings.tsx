import React from 'react';
import { PlatoonNames } from '../../types';
import Card from '../ui/Card';

interface TeamStanding {
  platoon: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface GroupStandingsProps {
  groupName: string;
  standings: TeamStanding[];
}

const GroupStandings: React.FC<GroupStandingsProps> = ({ groupName, standings }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">{groupName}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-right py-2 px-4">קבוצה</th>
              <th className="text-center py-2 px-4">מש׳</th>
              <th className="text-center py-2 px-4">נצ׳</th>
              <th className="text-center py-2 px-4">הפ׳</th>
              <th className="text-center py-2 px-4">תיקו</th>
              <th className="text-center py-2 px-4">הבקעות</th>
              <th className="text-center py-2 px-4">ספיגות</th>
              <th className="text-center py-2 px-4">הפרש</th>
              <th className="text-center py-2 px-4">נק׳</th>
            </tr>
          </thead>
          <tbody>
            {standings
              .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                const aDiff = a.goalsFor - a.goalsAgainst;
                const bDiff = b.goalsFor - b.goalsAgainst;
                if (bDiff !== aDiff) return bDiff - aDiff;
                return b.goalsFor - a.goalsFor;
              })
              .map((team) => (
                <tr key={team.platoon} className="border-b hover:bg-secondary-50">
                  <td className="py-2 px-4 font-medium">{PlatoonNames[team.platoon]}</td>
                  <td className="text-center py-2 px-4">{team.played}</td>
                  <td className="text-center py-2 px-4">{team.won}</td>
                  <td className="text-center py-2 px-4">{team.lost}</td>
                  <td className="text-center py-2 px-4">{team.drawn}</td>
                  <td className="text-center py-2 px-4">{team.goalsFor}</td>
                  <td className="text-center py-2 px-4">{team.goalsAgainst}</td>
                  <td className="text-center py-2 px-4">{team.goalsFor - team.goalsAgainst}</td>
                  <td className="text-center py-2 px-4 font-bold">{team.points}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default GroupStandings;