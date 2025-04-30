import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Timer, Medal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTournamentById, deleteTournament, updateRunnerTime } from '../services/tournamentService';
import { Tournament, SportType, PlatoonNames, Player } from '../types';
import { getAllPlayers } from '../services/playerService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const TournamentDetails: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [runners, setRunners] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRunner, setSelectedRunner] = useState<string>('');
  const [runningTime, setRunningTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [tournamentData, playersData] = await Promise.all([
          getTournamentById(id),
          getAllPlayers()
        ]);
        setTournament(tournamentData);
        // Only get runners who don't have other sports
        setRunners(playersData.filter(p => p.isRunner && p.sportBranch.length === 1));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('אירעה שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('האם אתה בטוח שברצונך למחוק את התחרות? פעולה זו בלתי הפיכה.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTournament(id);
      navigate('/tournaments');
    } catch (err) {
      console.error('Error deleting tournament:', err);
      setError('אירעה שגיאה במחיקת התחרות');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitTime = async () => {
    if (!selectedRunner || !runningTime || !tournament) return;

    setIsSubmitting(true);
    try {
      // Convert time format from seconds.milliseconds to total seconds
      const [seconds, milliseconds = '0'] = runningTime.split('.');
      const totalSeconds = parseFloat(`${seconds}.${milliseconds}`);

      await updateRunnerTime(tournament.id, selectedRunner, totalSeconds);
      
      // Refresh tournament data
      const updatedTournament = await getTournamentById(tournament.id);
      if (updatedTournament) {
        setTournament(updatedTournament);
      }

      // Refresh runners list
      const updatedRunners = await getAllPlayers();
      setRunners(updatedRunners.filter(p => p.isRunner && p.sportBranch.length === 1));

      // Reset form
      setSelectedRunner('');
      setRunningTime('');
    } catch (err) {
      console.error('Error updating runner time:', err);
      setError('אירעה שגיאה בעדכון הזמן');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number | undefined): string => {
    if (!seconds) return '-';
    // Convert to string with 2 decimal places and ensure we always show both digits
    return seconds.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-100 text-error-700 p-4 rounded-md">
          {error || 'לא נמצאה תחרות'}
        </div>
      </div>
    );
  }

  if (tournament.sportType !== SportType.RUNNING) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-warning-100 text-warning-700 p-4 rounded-md">
          תחרות זו אינה תחרות ריצה
        </div>
      </div>
    );
  }

  const sortedRunners = [...runners].sort((a, b) => {
    if (!a.stats.runningTime) return 1;
    if (!b.stats.runningTime) return -1;
    return a.stats.runningTime - b.stats.runningTime;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Timer className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">האיש המהיר בסיירת</h1>
        </div>
        {user?.isAdmin && (
          <Button
            variant="outline"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="text-error-500 border-error-500 hover:bg-error-50"
          >
            מחק תחרות
          </Button>
        )}
      </div>

      {user?.isAdmin && (
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">הזנת זמן ריצה</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-1">
                  בחר רץ
                </label>
                <select
                  value={selectedRunner}
                  onChange={(e) => setSelectedRunner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">בחר רץ</option>
                  {runners.map((runner) => (
                    <option key={runner.id} value={runner.id}>
                      {runner.firstName} {runner.lastName} ({PlatoonNames[runner.platoon]})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-1">
                  זמן (שניות.אלפיות)
                </label>
                <input
                  type="text"
                  value={runningTime}
                  onChange={(e) => setRunningTime(e.target.value)}
                  placeholder="12.45"
                  pattern="\d+\.\d{0,2}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSubmitTime}
                  isLoading={isSubmitting}
                  disabled={!selectedRunner || !runningTime}
                  className="w-full"
                >
                  עדכן זמן
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-right">דירוג</th>
                <th className="px-6 py-3 text-right">שם</th>
                <th className="px-6 py-3 text-right">פלוגה</th>
                <th className="px-6 py-3 text-center">זמן (שניות)</th>
                <th className="px-6 py-3 text-center">מדליה</th>
              </tr>
            </thead>
            <tbody>
              {sortedRunners.map((runner, index) => (
                <tr key={runner.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{index + 1}</td>
                  <td className="px-6 py-4">
                    {runner.firstName} {runner.lastName}
                  </td>
                  <td className="px-6 py-4">{PlatoonNames[runner.platoon]}</td>
                  <td className="px-6 py-4 text-center">
                    {runner.stats.runningTime ? (
                      <div className="flex items-center justify-center">
                        <Timer className="h-4 w-4 mr-1 text-primary-500" />
                        {formatTime(runner.stats.runningTime)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {runner.stats.runningTime && (
                      <div className="flex justify-center">
                        {index === 0 && <Medal className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                      </div>
                    )}
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

export default TournamentDetails;

export default TournamentDetails