import React, { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Match, MatchStage, MatchStatus, SportType, PlatoonNames } from '../../types';
import { updateMatchResult } from '../../services/tournamentService';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface MatchCardProps {
  match: Match;
  sportType: SportType;
  tournamentId: string;
  onUpdate?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, sportType, tournamentId, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [teamAScore, setTeamAScore] = useState(match.result?.teamAScore || 0);
  const [teamBScore, setTeamBScore] = useState(match.result?.teamBScore || 0);
  const [loading, setLoading] = useState(false);

  const handleStartMatch = async () => {
    try {
      await updateMatchResult(tournamentId, match.id, {
        teamAScore: 0,
        teamBScore: 0,
        winner: null,
        status: MatchStatus.IN_PROGRESS
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
        teamAScore,
        teamBScore,
        winner: null,
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
        teamAScore,
        teamBScore,
        winner,
        status: MatchStatus.COMPLETED
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error completing match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTugOfWarWinner = async (winner: string) => {
    setLoading(true);
    try {
      await updateMatchResult(tournamentId, match.id, {
        teamAScore: winner === match.teamA ? 1 : 0,
        teamBScore: winner === match.teamB ? 1 : 0,
        winner,
        status: MatchStatus.COMPLETED
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

      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h4 className="font-bold">{PlatoonNames[match.teamA]}</h4>
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
        </div>
        <div className="text-center px-4">
          {match.result ? (
            <div className="text-sm text-accent-600">VS</div>
          ) : (
            <div className="text-sm text-accent-600">VS</div>
          )}
        </div>
        <div className="text-center flex-1">
          <h4 className="font-bold">{PlatoonNames[match.teamB]}</h4>
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
        </div>
      </div>

      {match.status === MatchStatus.SCHEDULED && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleStartMatch}
            variant="primary"
            size="sm"
          >
            התחל משחק
          </Button>
        </div>
      )}

      {match.status === MatchStatus.IN_PROGRESS && (
        <div className="mt-4 flex justify-center space-x-2">
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
            <div className="flex space-x-2">
              {isEditing ? (
                <>
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

      {match.status === MatchStatus.COMPLETED && (
        <div className="mt-4 text-center text-sm text-accent-600">
          המשחק הסתיים
        </div>
      )}
    </Card>
  );
};

export default MatchCard;