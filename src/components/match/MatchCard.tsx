import React, { useState, useEffect } from 'react';
import { Clock, Plus, X } from 'lucide-react';
import { Match, MatchStage, MatchStatus, SportType, PlatoonNames, PlayerScore } from '../../types';
import { updateMatchResult } from '../../services/tournamentService';
import { getAllPlayers, incrementPlayerGoals } from '../../services/playerService';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { TeamRosterPopup } from '../team/TeamRosterPopup';

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
  const [showRoster, setShowRoster] = useState<string | null>(null);

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

  const handleStartMatch = async () => {
    try {
      await updateMatchResult(tournamentId, match.id, {
        teamAScore: 0,
        teamBScore: 0,
        winner: null,
        status: MatchStatus.IN_PROGRESS,
        startedAt: new Date().toISOString(),
        scorers: []
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const handleUpdateScore = async () => {
    setLoading(true);
    try {
      await updateMatchResult(tournamentId, match.id, {
        ...match.result,
        teamAScore,
        teamBScore,
        scorers,
        status: MatchStatus.IN_PROGRESS
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating score:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async () => {
    setLoading(true);
    try {
      let winner = null;
      if (teamAScore > teamBScore) winner = match.teamA;
      else if (teamBScore > teamAScore) winner = match.teamB;

      await updateMatchResult(tournamentId, match.id, {
        ...match.result,
        teamAScore,
        teamBScore,
        winner,
        scorers,
        status: MatchStatus.COMPLETED,
        endedAt: new Date().toISOString()
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error completing match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScorer = async () => {
    if (!selectedPlayer) return;

    const player = availablePlayers.find(p => p.id === selectedPlayer);
    if (!player) return;

    try {
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
      
      if (selectedTeam === match.teamA) {
        setTeamAScore(prev => prev + 1);
      } else {
        setTeamBScore(prev => prev + 1);
      }

      setSelectedPlayer('');
      setIsOwnGoal(false);
      setShowScorerForm(false);
    } catch (error) {
      console.error('Error adding scorer:', error);
    }
  };

  const handleRemoveScorer = async (index: number) => {
    const scorer = scorers[index];
    
    try {
      if (!scorer.isOwnGoal) {
        await incrementPlayerGoals(scorer.playerId, -1);
      }

      setScorers(prev => prev.filter((_, i) => i !== index));
      
      if (scorer.team === match.teamA) {
        setTeamAScore(prev => prev - scorer.count);
      } else {
        setTeamBScore(prev => prev - scorer.count);
      }
    } catch (error) {
      console.error('Error removing scorer:', error);
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

  const teamAScorers = scorers.filter(scorer => 
    (scorer.team === match.teamA && !scorer.isOwnGoal) || 
    (scorer.team === match.teamB && scorer.isOwnGoal)
  );

  const teamBScorers = scorers.filter(scorer => 
    (scorer.team === match.teamB && !scorer.isOwnGoal) || 
    (scorer.team === match.teamA && scorer.isOwnGoal)
  );

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
              <Clock className="h-4 w-4 text-accent-500" />
              <span className="text-sm text-accent-600">{match.location}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <button
            onClick={() => setShowRoster(match.teamA)}
            className="font-bold hover:text-primary-600 transition-colors"
          >
            {PlatoonNames[match.teamA]}
          </button>
          {isEditing && sportType !== SportType.TUG_OF_WAR && (
            <input
              type="number"
              min="0"
              value={teamAScore}
              onChange={(e) => setTeamAScore(parseInt(e.target.value) || 0)}
              className="mt-2 w-20 px-2 py-1 border rounded"
            />
          )}
          {!isEditing && (
            <div className="text-2xl font-bold mt-2">
              {match.result?.teamAScore || 0}
            </div>
          )}
          {/* Team A Scorers */}
          {sportType === SportType.SOCCER && teamAScorers.length > 0 && (
            <div className="mt-2 text-sm space-y-1">
              {teamAScorers.map((scorer, index) => (
                <div key={index} className="flex items-center justify-center">
                  <span className="font-medium">
                    {scorer.playerName}
                    {scorer.isOwnGoal && <span className="text-error-500 mr-1">(שער עצמי)</span>}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveScorer(scorers.indexOf(scorer))}
                      className="text-error-500 hover:text-error-700 mr-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-center px-4">
          <div className="text-sm text-accent-600">VS</div>
        </div>
        <div className="text-center flex-1">
          <button
            onClick={() => setShowRoster(match.teamB)}
            className="font-bold hover:text-primary-600 transition-colors"
          >
            {PlatoonNames[match.teamB]}
          </button>
          {isEditing && sportType !== SportType.TUG_OF_WAR && (
            <input
              type="number"
              min="0"
              value={teamBScore}
              onChange={(e) => setTeamBScore(parseInt(e.target.value) || 0)}
              className="mt-2 w-20 px-2 py-1 border rounded"
            />
          )}
          {!isEditing && (
            <div className="text-2xl font-bold mt-2">
              {match.result?.teamBScore || 0}
            </div>
          )}
          {/* Team B Scorers */}
          {sportType === SportType.SOCCER && teamBScorers.length > 0 && (
            <div className="mt-2 text-sm space-y-1">
              {teamBScorers.map((scorer, index) => (
                <div key={index} className="flex items-center justify-center">
                  <span className="font-medium">
                    {scorer.playerName}
                    {scorer.isOwnGoal && <span className="text-error-500 mr-1">(שער עצמי)</span>}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveScorer(scorers.indexOf(scorer))}
                      className="text-error-500 hover:text-error-700 mr-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {user?.isAdmin && (
        <div className="mt-4 flex justify-center">
          {match.status === MatchStatus.SCHEDULED && (
            <Button
              onClick={handleStartMatch}
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
                    onClick={() => handleTugOfWarWinner(match.teamA)}
                    variant="primary"
                    size="sm"
                    isLoading={loading}
                  >
                    {PlatoonNames[match.teamA]} ניצח
                  </Button>
                  <Button
                    onClick={() => handleTugOfWarWinner(match.teamB)}
                    variant="primary"
                    size="sm"
                    isLoading={loading}
                  >
                    {PlatoonNames[match.teamB]} ניצח
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
                                  <option value={match.teamA}>{PlatoonNames[match.teamA]}</option>
                                  <option value={match.teamB}>{PlatoonNames[match.teamB]}</option>
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
                          onClick={handleUpdateScore}
                          variant="primary"
                          size="sm"
                          isLoading={loading}
                        >
                          עדכן תוצאה
                        </Button>
                        <Button
                          onClick={handleCompleteMatch}
                          variant="accent"
                          size="sm"
                          isLoading={loading}
                        >
                          סיים משחק
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

      {showRoster && (
        <TeamRosterPopup
          platoon={showRoster}
          onClose={() => setShowRoster(null)}
          players={availablePlayers.filter(p => p.platoon === showRoster)}
          matches={[match]}
        />
      )}
    </Card>
  );
};

export default MatchCard;