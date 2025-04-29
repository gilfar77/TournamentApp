import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Calendar, Trophy } from 'lucide-react';
import { createTournament } from '../services/tournamentService';
import { SportType, TournamentStatus } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface TournamentForm {
  name: string;
  description: string;
  sportType: SportType;
  startDate: string;
  startTime: string;
  endDate: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<TournamentForm>();

  const onSubmit = async (data: TournamentForm) => {
    setLoading(true);
    setError(null);

    try {
      // Combine date and time
      const startDateTime = new Date(data.startDate);
      const [hours, minutes] = data.startTime.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes));

      const tournamentId = await createTournament({
        ...data,
        startDate: startDateTime.toISOString(),
        status: TournamentStatus.UPCOMING,
        createdBy: 'admin', // This will be replaced with actual user ID
      });
      
      // Redirect to the tournament page
      navigate(`/tournaments/${tournamentId}`);
    } catch (err) {
      console.error('Error creating tournament:', err);
      setError('אירעה שגיאה ביצירת הטורניר. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Shield className="h-8 w-8 text-primary-500 mr-3" />
        <h1 className="text-3xl font-bold">ניהול מערכת</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-primary-500 mr-2" />
            <h2 className="text-xl font-bold">יצירת טורניר חדש</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-accent-700 mb-1">
                שם הטורניר
              </label>
              <input
                type="text"
                {...register('name', { required: 'שדה חובה' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="הזן שם טורניר"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-accent-700 mb-1">
                תיאור
              </label>
              <textarea
                {...register('description', { required: 'שדה חובה' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="הזן תיאור טורניר"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-accent-700 mb-1">
                סוג ספורט
              </label>
              <select
                {...register('sportType', { required: 'שדה חובה' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">בחר סוג ספורט</option>
                {Object.entries(SportType).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value === SportType.BASKETBALL && 'כדורסל'}
                    {value === SportType.SOCCER && 'כדורגל'}
                    {value === SportType.VOLLEYBALL && 'כדורעף'}
                    {value === SportType.TUG_OF_WAR && 'משיכת חבל'}
                    {value === SportType.RUNNING && 'ריצת 100 מטר'}
                  </option>
                ))}
              </select>
              {errors.sportType && (
                <p className="mt-1 text-sm text-error-500">{errors.sportType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-1">
                  תאריך התחלה
                </label>
                <input
                  type="date"
                  {...register('startDate', { required: 'שדה חובה' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-error-500">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-1">
                  שעת התחלה
                </label>
                <input
                  type="time"
                  {...register('startTime', { required: 'שדה חובה' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-error-500">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-1">
                  תאריך סיום
                </label>
                <input
                  type="date"
                  {...register('endDate', { required: 'שדה חובה' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-error-500">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-error-100 p-4">
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
              leftIcon={<Calendar className="h-5 w-5" />}
            >
              צור טורניר
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-primary-500 mr-2" />
            <h2 className="text-xl font-bold">ניהול משתמשים</h2>
          </div>
          <p className="text-accent-600">
            ניהול משתמשים יתווסף בקרוב...
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Admin;