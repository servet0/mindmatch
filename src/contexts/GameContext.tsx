'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { supabase, type Player, type Room, type RoomPlayer, type GameRound, type PlayerAnswer } from '@/lib/supabase';

// Oyun durumları
interface GameState {
  currentPlayer: Player | null;
  currentRoom: Room | null;
  roomPlayers: RoomPlayer[];
  currentRound: GameRound | null;
  answers: PlayerAnswer[];
  timeLeft: number;
  gamePhase: 'lobby' | 'waiting' | 'playing' | 'answering' | 'results' | 'finished';
  loading: boolean;
  error: string | null;
}

// Aksiyon tipleri
type GameAction =
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'SET_ROOM'; payload: Room }
  | { type: 'SET_ROOM_PLAYERS'; payload: RoomPlayer[] }
  | { type: 'SET_CURRENT_ROUND'; payload: GameRound }
  | { type: 'SET_ANSWERS'; payload: PlayerAnswer[] }
  | { type: 'SET_TIME_LEFT'; payload: number }
  | { type: 'SET_GAME_PHASE'; payload: GameState['gamePhase'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' };

// Başlangıç durumu
const initialState: GameState = {
  currentPlayer: null,
  currentRoom: null,
  roomPlayers: [],
  currentRound: null,
  answers: [],
  timeLeft: 10,
  gamePhase: 'lobby',
  loading: false,
  error: null,
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'SET_ROOM':
      return { ...state, currentRoom: action.payload };
    case 'SET_ROOM_PLAYERS':
      return { ...state, roomPlayers: action.payload };
    case 'SET_CURRENT_ROUND':
      return { ...state, currentRound: action.payload };
    case 'SET_ANSWERS':
      return { ...state, answers: action.payload };
    case 'SET_TIME_LEFT':
      return { ...state, timeLeft: action.payload };
    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

// Context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  actions: {
    setPlayer: (player: Player) => void;
    setRoom: (room: Room) => void;
    updateRoomPlayers: () => Promise<void>;
    subscribeToRoom: (roomId: string) => () => void;
    resetGame: () => void;
  };
} | null>(null);



// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Actions
  const actions = {
    setPlayer: (player: Player) => {
      dispatch({ type: 'SET_PLAYER', payload: player });
    },

    setRoom: (room: Room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    },

    updateRoomPlayers: async () => {
      if (!state.currentRoom) return;

      try {
        const { data: roomPlayers, error } = await supabase
          .from('room_players')
          .select(`
            *,
            players:player_id (
              id,
              nickname,
              total_score,
              games_played
            )
          `)
          .eq('room_id', state.currentRoom.id);

        if (error) throw error;

        dispatch({ type: 'SET_ROOM_PLAYERS', payload: roomPlayers || [] });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Oda bilgileri güncellenemedi' });
      }
    },



    subscribeToRoom: (roomId: string) => {
      // Room değişikliklerini dinle
      const roomSubscription = supabase
        .channel(`room-${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rooms',
            filter: `id=eq.${roomId}`,
          },
          (payload) => {
            if (payload.new) {
              dispatch({ type: 'SET_ROOM', payload: payload.new as Room });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'room_players',
            filter: `room_id=eq.${roomId}`,
          },
          () => {
            actions.updateRoomPlayers();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_rounds',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            if (payload.new) {
              const newRound = payload.new as GameRound;
              dispatch({ type: 'SET_CURRENT_ROUND', payload: newRound });
              
              // Round durumuna göre oyun fazını değiştir
              if (newRound.status === 'active') {
                dispatch({ type: 'SET_GAME_PHASE', payload: 'answering' });
                // Yeni round başladığında cevapları temizle
                dispatch({ type: 'SET_ANSWERS', payload: [] });
              } else if (newRound.status === 'completed') {
                dispatch({ type: 'SET_GAME_PHASE', payload: 'results' });
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player_answers',
            filter: `room_id=eq.${roomId}`,
          },
          async () => {
            // Cevapları güncelle
            if (state.currentRound) {
              const { data: answers } = await supabase
                .from('player_answers')
                .select(`
                  *,
                  players:player_id (
                    id,
                    nickname
                  )
                `)
                .eq('round_id', state.currentRound.id);

              dispatch({ type: 'SET_ANSWERS', payload: answers || [] });
              
              // Eğer 2 cevap varsa ve round hala aktifse, otomatik olarak round'u tamamla
              if (answers && answers.length === 2) {
                const { data: currentRound } = await supabase
                  .from('game_rounds')
                  .select('status')
                  .eq('id', state.currentRound.id)
                  .single();
                
                if (currentRound && currentRound.status === 'active') {
                  // Round'u tamamlama işlemini tetikle
                  setTimeout(() => {
                    dispatch({ type: 'SET_GAME_PHASE', payload: 'results' });
                  }, 500);
                }
              }
            }
          }
        )
        .subscribe();

      // Cleanup fonksiyonu
      return () => {
        roomSubscription.unsubscribe();
      };
    },

    resetGame: () => {
      dispatch({ type: 'RESET_GAME' });
    },
  };



  return (
    <GameContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
