import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Build zamanında environment variables kontrol et
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Build zamanında warning ver ama error fırlatma
    if (typeof window === 'undefined') {
      console.warn('Supabase environment variables are missing during build');
      // Dummy client return et build için
      return createClient('https://dummy.supabase.co', 'dummy-key');
    }
    throw new Error('Supabase environment variables are missing! Please check your .env.local file.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

export const supabase = createSupabaseClient();

// Veritabanı türleri
export interface Player {
  id: string;
  nickname: string;
  total_score: number;
  games_played: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_code: string;
  created_by: string;
  status: 'waiting' | 'playing' | 'finished';
  current_round: number;
  max_rounds: number;
  created_at: string;
  updated_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  score: number;
  joined_at: string;
  players?: Player;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface GameRound {
  id: string;
  room_id: string;
  round_number: number;
  category_id: string;
  category_name: string;
  status: 'preparing' | 'active' | 'completed';
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface PlayerAnswer {
  id: string;
  round_id: string;
  player_id: string;
  room_id: string;
  answer: string;
  points_earned: number;
  submitted_at: string;
  players?: Player;
}
