'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { createPlayer, createRoom, joinRoom } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameRoom } from '@/components/GameRoom';
import { Users, GamepadIcon, Zap } from 'lucide-react';

export function HomePage() {
  const { state, actions } = useGame();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlayer = async (actionType: 'create' | 'join') => {
    if (!nickname.trim()) {
      setError('Lütfen nickname giriniz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const player = await createPlayer(nickname.trim());
      actions.setPlayer(player);

      if (actionType === 'create') {
        const room = await createRoom(player.id);
        actions.setRoom(room);
        actions.updateRoomPlayers();
      } else {
        if (!roomCode.trim()) {
          setError('Lütfen oda kodunu giriniz');
          setLoading(false);
          return;
        }
        const room = await joinRoom(roomCode.trim().toUpperCase(), player.id);
        actions.setRoom(room);
        actions.updateRoomPlayers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Eğer oyuncu ve oda varsa, oyun odasını göster
  if (state.currentPlayer && state.currentRoom) {
    return <GameRoom />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Ana başlık */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Mind<span className="text-yellow-400">Match</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            İki kişilik kelime tahmin oyunu! Aynı kategori, 10 saniye, sonsuz eğlence.
          </p>
        </div>

        {/* Özellikler */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Hızlı Oyun</h3>
            <p className="text-white/70 text-sm">
              Her round sadece 10 saniye. Hızlı düşün, hızlı yaz!
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">İki Oyuncu</h3>
            <p className="text-white/70 text-sm">
              Arkadaşınla gerçek zamanlı olarak yarış!
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GamepadIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Skor Sistemi</h3>
            <p className="text-white/70 text-sm">
              Aynı kelime 2 puan, farklı kelime 1 puan!
            </p>
          </div>
        </div>

        {/* Oyun kartları */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Oda oluştur */}
          <Card className="card-gradient border-white/20 text-white">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">
                Oda Oluştur
              </CardTitle>
              <CardDescription className="text-white/70">
                Yeni bir oyun odası oluştur ve arkadaşını bekle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nickname
                </label>
                <Input
                  type="text"
                  placeholder="Nickname giriniz"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  maxLength={20}
                  disabled={loading}
                />
              </div>
              <Button
                variant="game"
                size="lg"
                className="w-full text-lg font-semibold"
                onClick={() => handleCreatePlayer('create')}
                disabled={loading || !nickname.trim()}
              >
                {loading ? 'Oda Oluşturuluyor...' : 'Oda Oluştur'}
              </Button>
            </CardContent>
          </Card>

          {/* Odaya katıl */}
          <Card className="card-gradient border-white/20 text-white">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white">
                Odaya Katıl
              </CardTitle>
              <CardDescription className="text-white/70">
                Mevcut bir odaya oda kodu ile katıl
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nickname
                </label>
                <Input
                  type="text"
                  placeholder="Nickname giriniz"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  maxLength={20}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Oda Kodu
                </label>
                <Input
                  type="text"
                  placeholder="Oda kodunu giriniz"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono text-center tracking-wider"
                  maxLength={6}
                  disabled={loading}
                />
              </div>
              <Button
                variant="game"
                size="lg"
                className="w-full text-lg font-semibold"
                onClick={() => handleCreatePlayer('join')}
                disabled={loading || !nickname.trim() || !roomCode.trim()}
              >
                {loading ? 'Katılıyor...' : 'Odaya Katıl'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Alt bilgi */}
        <div className="text-center mt-12 text-white/60 text-sm">
          <p>
            Oyun kuralları: Her roundda aynı kategori gösterilir. 10 saniye içinde bir kelime yazın.
            <br />
            Aynı kelime yazarsanız her ikiniz 2 puan, farklı kelime yazarsanız 1 puan alırsınız.
          </p>
        </div>
      </div>
    </div>
  );
}
