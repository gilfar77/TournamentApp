import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllTournaments } from '../services/tournamentService';
import { Tournament, SportNames, SportType } from '../types';
import Card from '../components/ui/Card';

const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

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
        <h1 className="text-3xl font-bold">טורנירים</h1>
      </div>

      {tournaments.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy className="h-12 w-12 text-accent-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">אין טורנירים פעילים</h2>
          <p className="text-accent-600">טורנירים חדשים יתווספו בקרוב...</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Link key={tournament.id} to={`/tournaments/${tournament.id}`}>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                      <p className="text-accent-600 mb-4">{SportNames[tournament.sportType]}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                      {tournament.status === 'upcoming' && 'קרוב'}
                      {tournament.status === 'group_stage' && 'שלב הבתים'}
                      {tournament.status === 'knockout_stage' && 'שלב הנוק-אאוט'}
                      {tournament.status === 'completed' && 'הסתיים'}
                    </span>
                  </div>

                  <p className="text-accent-700 mb-4 line-clamp-2">{tournament.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-accent-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(tournament.startDate).toLocaleDateString('he-IL')} - {new Date(tournament.endDate).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-accent-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {tournament.sportType === SportType.RUNNING ? '6 רצים' : '6 קבוצות'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tournaments;