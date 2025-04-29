import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, CheckCircle } from 'lucide-react';
import { Tournament, Match, SportNames, PlatoonNames, MatchStatus } from '../types';
import { getAllTournaments } from '../services/tournamentService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

type MatchFilter = 'live' | 'upcoming' | 'completed' | 'all';

const LiveScores: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filter, setFilter] = useState<MatchFilter>('live');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
        setTournaments(data);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('אירעה שגיאה בטעינת הטורנירים');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
    const fetchInterval = setInterval(fetchTournaments, 10000); // Refresh every 10 seconds
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000); // Update time every second

    return () => {
      clearInterval(fetchInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const getMatchDuration = (match: Match) => {
    if (!match.result?.startedAt) return '00:00';
    
    const start = new Date(match.result.startedAt);
    const end = match.result?.endedAt ? new Date(match.result.endedAt) : currentTime;
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000); // Seconds
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

  const allMatches = tournaments.flatMap(tournament => 
    (tournament.matches || []).map(match => ({ match, tournament }))
  );

  const filteredMatches = allMatches.filter(({ match }) => {
    if (!match || !match.status) return false;
    
    switch (filter) {
      case 'live':
        return match.status === MatchStatus.IN_PROGRESS;
      case 'upcoming':
        return match.status === MatchStatus.SCHEDULED;
      case 'completed':
        return match.status === MatchStatus.COMPLETED;
      default:
        return true;
    }
  }).sort((a, b) => {
    // Sort by status priority and then by start time
    const statusPriority = {
      [MatchStatus.IN_PROGRESS]: 0,
      [MatchStatus.SCHEDULED]: 1,
      [MatchStatus.COMPLETED]: 2,
    };
    
    const statusDiff = statusPriority[a.match.status] - statusPriority[b.match.status];
    if (statusDiff !== 0) return statusDiff;
    
    return new Date(a.match.startTime).getTime() - new Date(b.match.startTime).getTime();
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Trophy className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">תוצאות משחקים</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={filter === 'live' ? 'primary' : 'outline'}
            onClick={() => setFilter('live')}
            size="sm"
          >
            משחקים פעילים
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            onClick={() => setFilter('upcoming')}
            size="sm"
          >
            משחקים קרובים
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            onClick={() => setFilter('completed')}
            size="sm"
          >
            משחקים שהסתיימו
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            הכל
          </Button>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy className="h-12 w-12 text-accent-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">אין משחקים להצגה</h2>
          <p className="text-accent-600">
            {filter === 'live' && 'אין משחקים פעילים כרגע'}
            {filter === 'upcoming' && 'אין משחקים קרובים'}
            {filter === 'completed' && 'אין משחקים שהסתיימו'}
            {filter === 'all' && 'אין משחקים להצגה'}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">זמן</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ענף</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שלב</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">קבוצה א׳</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">תוצאה</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">קבוצה ב׳</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMatches.map(({ match, tournament }) => (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {match.status === MatchStatus.IN_PROGRESS ? (
                      <div className="flex items-center text-primary-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {getMatchDuration(match)}
                      </div>
                    ) : (
                      new Date(match.startTime).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {SportNames[tournament.sportType]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {match.stage === 'group' && 'שלב הבתים'}
                    {match.stage === 'quarter_final' && 'רבע גמר'}
                    {match.stage === 'semi_final' && 'חצי גמר'}
                    {match.stage === 'final' && 'גמר'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{PlatoonNames[match.teamA]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {match.status !== MatchStatus.SCHEDULED ? (
                      <span className="text-lg font-bold">
                        {match.result?.teamAScore || 0} - {match.result?.teamBScore || 0}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">VS</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{PlatoonNames[match.teamB]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {match.status === MatchStatus.IN_PROGRESS && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        משחק פעיל
                      </span>
                    )}
                    {match.status === MatchStatus.COMPLETED && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        הסתיים
                      </span>
                    )}
                    {match.status === MatchStatus.SCHEDULED && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        טרם התחיל
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveScores;