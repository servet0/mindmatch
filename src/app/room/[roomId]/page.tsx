'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameProvider } from '@/contexts/GameContext';
import { GameRoom } from '@/components/GameRoom';
import { supabase } from '@/lib/supabase';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  useEffect(() => {
    // Oda var mı kontrol et
    const checkRoom = async () => {
      if (!roomId) {
        router.push('/');
        return;
      }

      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (!room) {
        router.push('/');
      }
    };

    checkRoom();
  }, [roomId, router]);

  if (!roomId) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <GameProvider>
      <div className="game-container">
        <GameRoom roomId={roomId} />
      </div>
    </GameProvider>
  );
}
