import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTournamentById, deleteTournament, updateTournamentGroups } from '../services/tournamentService';
import { Tournament, Match, MatchStage, SportNames, PlatoonNames, SportType, Platoon } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MatchCard from '../components/match/MatchCard';
import GroupStandings from '../components/tournament/GroupStandings';
import GroupDrawAnimation from '../components/tournament/GroupDrawAnimation';

const TournamentDetails: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'standings'>('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDrawAnimation, setShowDrawAnimation] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;
      try {
        const data = await getTournamentById(id);
        setTournament(data);
        setShowDrawAnimation(data?.groups?.every(group => group.teams.length === 0) ?? false);
      } catch (err) {
        console.error('Error fetching tournament:', err);
        setError('אירעה שגיאה בטעינת הטורניר');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('האם אתה בטוח שברצונך למחוק את הטורניר? פעולה זו בלתי הפיכה.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTournament(id);
      navigate('/tournaments');
    } catch (err) {
      console.error('Error deleting tournament:', err);
      setError('אירעה שגיאה במחיקת הטורניר');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDrawComplete = async (groupA: string[], groupB: string[]) => {
    if (!id || !tournament) return;

    try {
      const updatedGroups = [
        {
          id: 'group-a',
          name: 'בית א׳',
          teams: groupA
        },
        {
          id: 'group-b',
          name: 'בית ב׳',
          teams: groupB
        }
      ];

      await updateTournamentGroups(id, updatedGroups);
      
      // Refresh tournament data
      const updatedTournament = await getTournamentById(id);
      if (updatedTournament) {
        setTournament(updatedTournament);
      }
      
      setShowDrawAnimation(false);
    } catch (err) {
      console.error('Error updating tournament groups:', err);
      setError('אירעה שגיאה בעדכון הבתים');
    }
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
          {error || 'לא נמצא טורניר'}
        </div>
      </div>
    );
  }

  const renderGroups = () => (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {tournament.groups?.map((group) => (
        <Card key={group.id} className="p-6">
          <h3 className="text-xl font-bold mb-4">{group.name}</h3>
          <div className="space-y-3">
            {group.teams.map((teamId) => (
              <div key={teamId} className="p-3 bg-secondary-50 rounded-lg">
                <span className="font-medium">{PlatoonNames[teamId as Platoon]}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">פרטי טורניר</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-primary-500 mr-2" />
            <span className="text-accent-700">סוג ספורט: {SportNames[tournament.sportType]}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary-500 mr-2" />
            <span className="text-accent-700">
              תאריכים: {new Date(tournament.startDate).toLocaleDateString('he-IL')} - {new Date(tournament.endDate).toLocaleDateString('he-IL')}
            </span>
          </div>
          <div>
            <p className="text-accent-700">{tournament.description}</p>
          </div>
        </div>
      </Card>

      <h3 className="text-xl font-bold mb-4">חלוקה לבתים</h3>
      {renderGroups()}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      {tournament.matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          sportType={tournament.sportType}
          tournamentId={tournament.id}
          onUpdate={() => {
            // Refresh tournament data when match is updated
            if (id) {
              getTournamentById(id).then(data => {
                if (data) setTournament(data);
              });
            }
          }}
        />
      ))}
    </div>
  );

  const renderStandings = () => (
    <div className="space-y-6">
      {tournament.groups?.map(group => (
        <GroupStandings
          key={group.id}
          groupName={group.name}
          standings={calculateGroupStandings(group.id)}
        />
      ))}
    </div>
  );

  const calculateGroupStandings = (groupId: string) => {
    const standings: Record<string, TeamStanding> = {};

    // Initialize standings for teams in this group
    tournament.groups?.find(g => g.id === groupId)?.teams.forEach(teamId => {
      standings[teamId] = {
        platoon: teamId,
        played: 0,
        won: 0,
        lost: 0,
        drawn: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0
      };
    });

    // Calculate standings from group matches
    tournament.matches
      .filter(match => match.groupId === groupId && match.result)
      .forEach(match => {
        const { teamA, teamB, result } = match;
        
        standings[teamA].played++;
        standings[teamB].played++;
        
        standings[teamA].goalsFor += result!.teamAScore;
        standings[teamA].goalsAgainst += result!.teamBScore;
        standings[teamB].goalsFor += result!.teamBScore;
        standings[teamB].goalsAgainst += result!.teamAScore;

        if (result!.teamAScore > result!.teamBScore) {
          standings[teamA].won++;
          standings[teamB].lost++;
          standings[teamA].points += 3;
        } else if (result!.teamAScore < result!.teamBScore) {
          standings[teamB].won++;
          standings[teamA].lost++;
          standings[teamB].points += 3;
        } else {
          standings[teamA].drawn++;
          standings[teamB].drawn++;
          standings[teamA].points += 1;
          standings[teamB].points += 1;
        }
      });

    return Object.values(standings);
  };

  return (
    <>
      {showDrawAnimation && tournament?.groups && user?.isAdmin && (
        <GroupDrawAnimation
          teams={Object.values(Platoon)}
          onComplete={handleDrawComplete}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-primary-500 mr-3" />
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
          </div>
          {user?.isAdmin && (
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                {tournament.status === 'upcoming' && 'קרוב'}
                {tournament.status === 'group_stage' && 'שלב הבתים'}
                {tournament.status === 'knockout_stage' && 'שלב הנוק-אאוט'}
                {tournament.status === 'completed' && 'הסתיים'}
              </span>
              <Button
                variant="outline"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="text-error-500 border-error-500 hover:bg-error-50"
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                מחק טורניר
              </Button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                סקירה כללית
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'schedule'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                לוח משחקים
              </button>
              <button
                onClick={() => setActiveTab('standings')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'standings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                טבלת דירוג
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-8">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'standings' && renderStandings()}
        </div>
      </div>
    </>
  );
};

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

export default TournamentDetails;