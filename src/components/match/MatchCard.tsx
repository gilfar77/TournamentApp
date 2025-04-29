import React, { useState, useEffect } from 'react';
import { Clock, Plus, X, MapPin } from 'lucide-react';
import { Match, MatchStage, MatchStatus, SportType, PlatoonNames, Platoon, PlayerScore } from '../../types';
import { updateMatchResult } from '../../services/tournamentService';
import { getAllPlayers, incrementPlayerGoals } from '../../services/playerService';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import TeamRosterModal from './TeamRosterModal';

interface MatchCardProps {
  match: Match;
  sportType: SportType;
  tournamentId: string;
  onUpdate?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, sportType, tournamentId, onUpdate }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [teamAScore, setTeamAScore] = useState(match.result?.teamAScore || 0);
  const [teamBScore, setTeamBScore] = useState(match.result?.teamBScore || 0);
  const [loading, setLoading] = useState(false);
  const [scorers, setScorers] = useState<PlayerScore[]>(match.result?.scorers || []);
  const [availablePlayers, setAvailablePlayers] = useState<Array<{ id: string; name: string; platoon: string }>>([]);
  const [showScorerForm, setShowScorerForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [isOwnGoal, setIsOwnGoal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>(match.teamA);
  const [showTeamAModal, setShowTeamAModal] = useState(false);
  const [showTeamBModal, setShowTeamBModal] = useState(false);
  const [teamAPlayers, setTeamAPlayers] = useState<any[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<any[]>([]);
  const [tugOfWarWinner, setTugOfWarWinner] = useState<Platoon | null>(null);

  useEffect(() => {
    if (sportType === SportType.SOCCER) {
      const fetchPlayers = async () => {
        try {
          const players = await getAllPlayers();
          setAvailablePlayers(players.map(p => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            platoon: p.platoon
          })));
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      };
      fetchPlayers();
    }
  }, [sportType]);

  const handleTeamClick = async (platoon: Platoon, isTeamA: boolean) => {
    try {
      const players = await getAllPlayers();
      const teamPlayers = players.filter(p => p.platoon === platoon);
      
      if (isTeamA) {
        setTeamAPlayers(teamPlayers);
        setShowTeamAModal(true);
      } else {
        setTeamBPlayers(teamPlayers);
        setShowTeamBModal(true);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleUpdateResult = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = {
        teamAScore,
        teamBScore,
        scorers: [],
        status: MatchStatus.IN_PROGRESS,
        winner: null,
        startedAt: new Date().toISOString(),
        endedAt: undefined,
        details: undefined,
        notes: undefined
      };
      
      await updateMatchResult(tournamentId, match.id, result);
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating match result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScorer = async () => {
    if (!selectedPlayer) return;

    const player = availablePlayers.find(p => p.id === selectedPlayer);
    if (!player) return;

    try {
      // Only increment goals for non-own goals
      if (!isOwnGoal) {
        await incrementPlayerGoals(player.id);
      }

      const newScorer: PlayerScore = {
        playerId: player.id,
        playerName: player.name,
        team: isOwnGoal ? (selectedTeam === match.teamA ? match.teamB : match.teamA) : selectedTeam,
        count: 1,
        isOwnGoal
      };

      setScorers(prev => [...prev, newScorer]);
      
      // Update total scores
      if (selectedTeam === match.teamA) {
        setTeamAScore(prev => prev + 1);
      } else {
        setTeamBScore(prev => prev + 1);
      }

      // Reset form
      setSelectedPlayer('');
      setIsOwnGoal(false);
      setShowScorerForm(false);
    } catch (error) {
      console.error('Error adding scorer:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleRemoveScorer = async (index: number) => {
    const scorer = scorers[index];
    
    try {
      // Decrement goals for non-own goals
      if (!scorer.isOwnGoal) {
        await incrementPlayerGoals(scorer.playerId, -1);
      }

      setScorers(prev => prev.filter((_, i) => i !== index));
      
      // Update total scores
      if (scorer.team === match.teamA) {
        setTeamAScore(prev => prev - scorer.count);
      } else {
        setTeamBScore(prev => prev - scorer.count);
      }
    } catch (error) {
      console.error('Error removing scorer:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleTugOfWarWinner = async (winner: string) => {
    setLoading(true);
    try {
      await updateMatchResult(tournamentId, match.id, {
        teamAScore: winner === match.teamA ? 1 : 0,
        teamBScore: winner === match.teamB ? 1 : 0,
        winner,
        status: MatchStatus.COMPLETED,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString()
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error setting winner:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-medium text-accent-600">
            {match.stage === MatchStage.GROUP && 'שלב הבתים'}
            {match.stage === MatchStage.QUARTER_FINAL && 'רבע גמר'}
            {match.stage === MatchStage.SEMI_FINAL && 'חצי גמר'}
            {match.stage === MatchStage.FINAL && 'גמר'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Clock className="h-4 w-4 text-accent-500" />
          <span className="text-sm text-accent-600">
            {new Date(match.startTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {match.location && (
            <>
              <MapPin className="h-4 w-4 text-accent-500" />
              <span className="text-sm text-accent-600">{match.location}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-right">
          <button
            onClick={() => handleTeamClick(match.teamA as Platoon, true)}
            className="text-lg font-medium hover:text-primary-500 transition-colors"
          >
            {PlatoonNames[match.teamA as Platoon]}
          </button>
        </div>
        <div className="mx-4 text-2xl font-bold">
          {match.status === MatchStatus.COMPLETED ? (
            `${match.result?.teamAScore || 0} - ${match.result?.teamBScore || 0}`
          ) : isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={teamAScore}
                onChange={(e) => setTeamAScore(Number(e.target.value))}
                className="w-16 text-center border rounded"
                min="0"
              />
              <span>-</span>
              <input
                type="number"
                value={teamBScore}
                onChange={(e) => setTeamBScore(Number(e.target.value))}
                className="w-16 text-center border rounded"
                min="0"
              />
            </div>
          ) : (
            'vs'
          )}
        </div>
        <div className="flex-1 text-left">
          <button
            onClick={() => handleTeamClick(match.teamB as Platoon, false)}
            className="text-lg font-medium hover:text-primary-500 transition-colors"
          >
            {PlatoonNames[match.teamB as Platoon]}
          </button>
        </div>
      </div>

      {/* Scorers List */}
      {sportType === SportType.SOCCER && scorers.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h5 className="text-sm font-medium mb-2">כובשי השערים:</h5>
          <div className="space-y-2">
            {scorers.map((scorer, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{scorer.playerName}</span>
                  {scorer.isOwnGoal && <span className="text-error-500 mr-1">(שער עצמי)</span>}
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveScorer(index)}
                    className="text-error-500 hover:text-error-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {user?.isAdmin && (
        <div className="mt-4 flex justify-center">
          {match.status === MatchStatus.SCHEDULED && (
            <Button
              onClick={() => handleTeamClick(match.teamA as Platoon, true)}
              variant="primary"
              size="sm"
            >
              התחל משחק
            </Button>
          )}

          {match.status === MatchStatus.IN_PROGRESS && (
            <div className="flex space-x-2">
              {sportType === SportType.TUG_OF_WAR ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleTugOfWarWinner(match.teamA as string)}
                    variant="primary"
                    size="sm"
                    isLoading={loading}
                  >
                    {PlatoonNames[match.teamA as string]} ניצח
                  </Button>
                  <Button
                    onClick={() => handleTugOfWarWinner(match.teamB as string)}
                    variant="primary"
                    size="sm"
                    isLoading={loading}
                  >
                    {PlatoonNames[match.teamB as string]} ניצח
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col w-full">
                  {isEditing ? (
                    <>
                      {/* Soccer Scoring Form */}
                      {sportType === SportType.SOCCER && (
                        <div className="mb-4">
                          {showScorerForm ? (
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <select
                                  value={selectedTeam}
                                  onChange={(e) => setSelectedTeam(e.target.value)}
                                  className="flex-1 px-3 py-2 border rounded"
                                >
                                  <option value={match.teamA}>{PlatoonNames[match.teamA as Platoon]}</option>
                                  <option value={match.teamB}>{PlatoonNames[match.teamB as Platoon]}</option>
                                </select>
                                <select
                                  value={selectedPlayer}
                                  onChange={(e) => setSelectedPlayer(e.target.value)}
                                  className="flex-1 px-3 py-2 border rounded"
                                >
                                  <option value="">בחר שחקן</option>
                                  {availablePlayers
                                    .filter(p => !isOwnGoal ? p.platoon === selectedTeam : p.platoon !== selectedTeam)
                                    .map(player => (
                                      <option key={player.id} value={player.id}>
                                        {player.name}
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                              <div className="flex items-center">
                                <label className="flex items-center text-sm">
                                  <input
                                    type="checkbox"
                                    checked={isOwnGoal}
                                    onChange={(e) => setIsOwnGoal(e.target.checked)}
                                    className="mr-2"
                                  />
                                  שער עצמי
                                </label>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={handleAddScorer}
                                  variant="primary"
                                  size="sm"
                                  className="flex-1"
                                >
                                  הוסף שער
                                </Button>
                                <Button
                                  onClick={() => setShowScorerForm(false)}
                                  variant="outline"
                                  size="sm"
                                >
                                  ביטול
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setShowScorerForm(true)}
                              variant="outline"
                              size="sm"
                              leftIcon={<Plus className="h-4 w-4" />}
                            >
                              הוסף שער
                            </Button>
                          )}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleUpdateResult}
                          variant="primary"
                          size="sm"
                          isLoading={loading}
                        >
                          עדכן תוצאה
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      ערוך תוצאה
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {match.status === MatchStatus.COMPLETED && (
        <div className="mt-4 text-center text-sm text-accent-600">
          המשחק הסתיים
        </div>
      )}

      {/* Team Roster Modals */}
      <TeamRosterModal
        platoon={match.teamA as Platoon}
        isOpen={showTeamAModal}
        onClose={() => setShowTeamAModal(false)}
        statistics={{
          wins: 0, // TODO: Calculate from matches
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0
        }}
        players={teamAPlayers}
      />

      <TeamRosterModal
        platoon={match.teamB as Platoon}
        isOpen={showTeamBModal}
        onClose={() => setShowTeamBModal(false)}
        statistics={{
          wins: 0, // TODO: Calculate from matches
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0
        }}
        players={teamBPlayers}
      />
    </Card>
  );
};

export default MatchCard;