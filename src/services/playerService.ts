import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, PlayerStats } from '../types';

const playersRef = collection(db, 'players');

export const createPlayer = async (player: Omit<Player, 'id' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const playerData = {
      ...player,
      stats: {
        basketsScored: 0,
        goalsScored: 0,
        runningTime: null
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(playersRef, playerData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
};

export const updatePlayer = async (id: string, data: Partial<Player>): Promise<void> => {
  try {
    const playerRef = doc(playersRef, id);
    await updateDoc(playerRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
};

export const updatePlayerStats = async (id: string, stats: Partial<PlayerStats>): Promise<void> => {
  try {
    const playerRef = doc(playersRef, id);
    const playerDoc = await getDoc(playerRef);
    
    if (!playerDoc.exists()) {
      throw new Error('Player not found');
    }

    const currentStats = playerDoc.data().stats || {};
    await updateDoc(playerRef, {
      stats: {
        ...currentStats,
        ...stats
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating player stats:', error);
    throw error;
  }
};

export const deletePlayer = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(playersRef, id));
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
};

export const getPlayerById = async (id: string): Promise<Player | null> => {
  try {
    const docRef = doc(playersRef, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Player;
  } catch (error) {
    console.error('Error getting player:', error);
    throw error;
  }
};

export const getAllPlayers = async (): Promise<Player[]> => {
  try {
    // Using a single orderBy to avoid composite index requirement
    const q = query(playersRef, orderBy('lastName'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Player));
  } catch (error) {
    console.error('Error getting players:', error);
    throw error;
  }
};

export const getPlayersByPlatoon = async (platoon: string): Promise<Player[]> => {
  try {
    const q = query(
      playersRef,
      where('platoon', '==', platoon),
      orderBy('lastName')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Player));
  } catch (error) {
    console.error('Error getting players by platoon:', error);
    throw error;
  }
};

export const getRunners = async (): Promise<Player[]> => {
  try {
    const q = query(
      playersRef,
      where('isRunner', '==', true)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Player));
  } catch (error) {
    console.error('Error getting runners:', error);
    throw error;
  }
};