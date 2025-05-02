import React, { useState, useEffect } from 'react';
import { Users, Upload, Plus, LayoutGrid, Table, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Player, Platoon, PlatoonNames, SportType, SportNames } from '../types';
import { getAllPlayers, createPlayer, updatePlayer, deletePlayer } from '../services/playerService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PlayerList from '../components/player/PlayerList';
import PlayerTable from '../components/player/PlayerTable';
import PlayerForm from '../components/player/PlayerForm';

const Players: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatoon, setSelectedPlatoon] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [showRunners, setShowRunners] = useState<boolean | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchQuery, selectedPlatoon, selectedSport, showRunners]);

  const fetchPlayers = async () => {
    try {
      const data = await getAllPlayers();
      setPlayers(data);
      setFilteredPlayers(data);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('אירעה שגיאה בטעינת השחקנים');
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = [...players];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(player => 
        player.firstName.toLowerCase().includes(query) ||
        player.lastName.toLowerCase().includes(query)
      );
    }

    // Apply platoon filter
    if (selectedPlatoon) {
      filtered = filtered.filter(player => player.platoon === selectedPlatoon);
    }

    // Apply sport filter
    if (selectedSport) {
      filtered = filtered.filter(player => 
        player.sportBranch.includes(selectedSport as SportType)
      );
    }

    // Apply runners filter
    if (showRunners !== null) {
      filtered = filtered.filter(player => player.isRunner === showRunners);
    }

    // Sort players by platoon, sport, and alphabetically
    filtered.sort((a, b) => {
      // First sort by platoon
      if (a.platoon !== b.platoon) {
        return a.platoon.localeCompare(b.platoon);
      }
      
      // Then sort by first sport in sportBranch array
      const aSport = a.sportBranch[0] || '';
      const bSport = b.sportBranch[0] || '';
      if (aSport !== bSport) {
        return aSport.localeCompare(bSport);
      }
      
      // Finally sort by last name, then first name
      if (a.lastName !== b.lastName) {
        return a.lastName.localeCompare(b.lastName);
      }
      return a.firstName.localeCompare(b.firstName);
    });

    setFilteredPlayers(filtered);
  };

  const handleSubmit = async (data: Omit<Player, 'id' | 'stats' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, data);
      } else {
        await createPlayer(data);
      }
      await fetchPlayers();
      setShowAddForm(false);
      setEditingPlayer(null);
    } catch (err) {
      console.error('Error saving player:', err);
      setError('אירעה שגיאה בשמירת השחקן');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setShowAddForm(true);
  };

  const handleDelete = async (playerId: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את השחקן?')) {
      return;
    }

    try {
      await deletePlayer(playerId);
      await fetchPlayers();
    } catch (err) {
      console.error('Error deleting player:', err);
      setError('אירעה שגיאה במחיקת השחקן');
    }
  };

  const handleImport = () => {
    // TODO: Implement CSV import
    console.log('Import functionality to be implemented');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPlatoon('');
    setSelectedSport('');
    setShowRunners(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">שחקנים</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:text-primary-500'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'table'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:text-primary-500'
              }`}
            >
              <Table className="h-5 w-5" />
            </button>
          </div>
          {user?.isAdmin && (
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowAddForm(true)}
                leftIcon={<Plus className="h-5 w-5" />}
              >
                הוסף שחקן
              </Button>
              <Button
                variant="outline"
                onClick={handleImport}
                leftIcon={<Upload className="h-5 w-5" />}
              >
                ייבא שחקנים
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-accent-700 mb-1">
                חיפוש
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש לפי שם..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Platoon Filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-accent-700 mb-1">
                פלוגה
              </label>
              <select
                value={selectedPlatoon}
                onChange={(e) => setSelectedPlatoon(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">כל הפלוגות</option>
                {Object.entries(PlatoonNames).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sport Filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-accent-700 mb-1">
                ענף ספורט
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">כל הענפים</option>
                {Object.entries(SportNames).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Runners Filter */}
            <div className="w-48">
              <label className="block text-sm font-medium text-accent-700 mb-1">
                רצים
              </label>
              <select
                value={showRunners === null ? '' : showRunners.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setShowRunners(value === '' ? null : value === 'true');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">הכל</option>
                <option value="true">רצים בלבד</option>
                <option value="false">ללא רצים</option>
              </select>
            </div>

            {/* Reset Filters */}
            <Button
              variant="outline"
              onClick={resetFilters}
              className="mb-0"
              leftIcon={<Filter className="h-5 w-5" />}
            >
              אפס סינון
            </Button>
          </div>

          <div className="mt-4 text-sm text-accent-600">
            מציג {filteredPlayers.length} מתוך {players.length} שחקנים
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-error-100 text-error-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {showAddForm && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingPlayer ? 'ערוך שחקן' : 'הוסף שחקן חדש'}
          </h2>
          <PlayerForm
            onSubmit={handleSubmit}
            initialData={editingPlayer || undefined}
            isLoading={isSubmitting}
          />
        </Card>
      )}

      {viewMode === 'table' ? (
        <PlayerTable
          players={filteredPlayers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={user?.isAdmin}
        />
      ) : (
        <PlayerList
          players={filteredPlayers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={user?.isAdmin}
        />
      )}
    </div>
  );
};

export default Players;