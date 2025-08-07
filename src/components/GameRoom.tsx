'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { startNewRound, submitAnswer, calculateRoundResults, finishGame } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Crown, Users, Trophy, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GameRoomProps {
  roomId?: string;
}

export function GameRoom({ roomId }: GameRoomProps = {}) {
  const { state, actions, dispatch } = useGame();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Player'ı localStorage'dan yükle
  useEffect(() => {
    const savedPlayer = localStorage.getItem('mindmatch_player');
    if (savedPlayer && !state.currentPlayer) {
      const player = JSON.parse(savedPlayer);
      actions.setPlayer(player);
    }
  }, [state.currentPlayer, actions]);

  // Room ID'den oda bilgisini yükle
  useEffect(() => {
    if (roomId && state.currentPlayer && !state.currentRoom) {
      // Room bilgisini yükle
      const loadRoom = async () => {
        const { data: room } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (room) {
          actions.setRoom(room);
          // Room players'ı da yükle
          await actions.updateRoomPlayers();
          
          // Aktif round var mı kontrol et
          const { data: activeRound } = await supabase
            .from('game_rounds')
            .select('*')
            .eq('room_id', room.id)
            .eq('status', 'active')
            .single();
          
          if (activeRound) {
            dispatch({ type: 'SET_CURRENT_ROUND', payload: activeRound });
            dispatch({ type: 'SET_GAME_PHASE', payload: 'answering' });
            
            // Bu round'daki cevapları yükle
            const { data: answers } = await supabase
              .from('player_answers')
              .select(`
                *,
                players:player_id (
                  id,
                  nickname
                )
              `)
              .eq('round_id', activeRound.id);
            
            dispatch({ type: 'SET_ANSWERS', payload: answers || [] });
          } else {
            // Completed round var mı kontrol et
            const { data: completedRound } = await supabase
              .from('game_rounds')
              .select('*')
              .eq('room_id', room.id)
              .eq('status', 'completed')
              .order('round_number', { ascending: false })
              .limit(1)
              .single();
            
            if (completedRound) {
              dispatch({ type: 'SET_CURRENT_ROUND', payload: completedRound });
              dispatch({ type: 'SET_GAME_PHASE', payload: 'results' });
              
              // Son round'un cevaplarını yükle
              const { data: answers } = await supabase
                .from('player_answers')
                .select(`
                  *,
                  players:player_id (
                    id,
                    nickname
                  )
                `)
                .eq('round_id', completedRound.id);
              
              dispatch({ type: 'SET_ANSWERS', payload: answers || [] });
            }
          }
        }
      };
      loadRoom();
    }
  }, [roomId, state.currentPlayer, state.currentRoom, state.currentRound, actions, dispatch]);

  // Oda subscription
  useEffect(() => {
    if (!state.currentRoom) return;

    const unsubscribe = actions.subscribeToRoom(state.currentRoom.id);
    return unsubscribe;
  }, [state.currentRoom, actions]);

  // Oda kopyalama
  const copyRoomCode = async () => {
    if (state.currentRoom) {
      await navigator.clipboard.writeText(state.currentRoom.room_code);
    }
  };

  // Oyun başlatma
  const handleStartGame = async () => {
    if (!state.currentRoom || state.roomPlayers.length < 2) return;

    try {
      await startNewRound(state.currentRoom.id, 1);
    } catch {
      // Hata durumunda UI'da gösterilecek
    }
  };

  // Cevap gönderme
  const handleSubmitAnswer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentRound || !state.currentPlayer || !answer.trim()) return;

    setSubmitting(true);
    try {
      await submitAnswer(
        state.currentRound.id,
        state.currentPlayer.id,
        state.currentRoom!.id,
        answer.trim()
      );
      setAnswer('');
      dispatch({ type: 'SET_GAME_PHASE', payload: 'waiting' });
    } catch {
      // Hata durumunda UI'da gösterilecek
    } finally {
      setSubmitting(false);
    }
  }, [state.currentRound, state.currentPlayer, state.currentRoom, answer, dispatch]);

  // Sonraki round
  const handleNextRound = async () => {
    if (!state.currentRoom) return;

    const nextRoundNumber = state.currentRoom.current_round + 1;
    
    if (nextRoundNumber > state.currentRoom.max_rounds) {
      await finishGame(state.currentRoom.id);
      dispatch({ type: 'SET_GAME_PHASE', payload: 'finished' });
    } else {
      await startNewRound(state.currentRoom.id, nextRoundNumber);
    }
  };

  // Ana sayfaya dön
  const handleGoHome = () => {
    localStorage.removeItem('mindmatch_player');
    window.location.href = '/';
  };



  // Round sonuçlarını kontrol et
  useEffect(() => {
    if (state.answers.length === 2 && state.currentRound?.status === 'active') {
      // Sonuçları hesapla
      const processResults = async () => {
        try {
          await calculateRoundResults(state.currentRound!.id);
          // Room players'ı güncelle
          await actions.updateRoomPlayers();
          dispatch({ type: 'SET_GAME_PHASE', payload: 'results' });
        } catch (error) {
          console.error('Results calculation error:', error);
        }
      };
      
      processResults();
    }
  }, [state.answers.length, state.currentRound?.status, state.currentRound?.id, dispatch, actions]);

  const isRoomCreator = state.currentRoom?.created_by === state.currentPlayer?.id;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Oda başlığı */}
        <Card className="card-gradient border-white/20 text-white mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400" />
                <div>
                  <CardTitle className="text-xl text-white">
                    Oda: {state.currentRoom?.room_code}
                  </CardTitle>
                  <p className="text-white/70 text-sm">
                    Round {state.currentRoom?.current_round} / {state.currentRoom?.max_rounds}
                  </p>
                </div>
              </div>
              <Button
                variant="game"
                size="sm"
                onClick={copyRoomCode}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Kopyala
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sol panel - Oyuncular */}
          <div className="space-y-4">
            {/* Oyuncular */}
            <Card className="card-gradient border-white/20 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  Oyuncular ({state.roomPlayers.length}/2)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {state.roomPlayers.map((roomPlayer) => (
                  <div
                    key={roomPlayer.id}
                    className={`p-3 rounded-lg ${
                      roomPlayer.player_id === state.currentPlayer?.id
                        ? 'bg-white/20'
                        : 'bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {state.currentRoom?.created_by === roomPlayer.player_id && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="font-medium">
                          {roomPlayer.players?.nickname || 'Oyuncu'}
                        </span>
                        {roomPlayer.player_id === state.currentPlayer?.id && (
                          <span className="text-xs text-white/60">(Sen)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold">{roomPlayer.score}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {state.roomPlayers.length < 2 && (
                  <div className="p-3 rounded-lg bg-white/5 border-2 border-dashed border-white/20 text-center">
                    <p className="text-white/60 text-sm">
                      İkinci oyuncu bekleniyor...
                    </p>
                    <p className="text-white/40 text-xs mt-2">
                      Oda Kodu: {state.currentRoom?.room_code}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ana sayfaya dön butonu */}
            <Button
              variant="game"
              onClick={handleGoHome}
              className="w-full gap-2"
            >
              <Home className="w-4 h-4" />
              Ana Sayfaya Dön
            </Button>
          </div>

          {/* Orta panel - Oyun alanı */}
          <div className="lg:col-span-2">
            {/* Bekleme durumu */}
            {state.gamePhase === 'lobby' && (
              <Card className="card-gradient border-white/20 text-white text-center">
                <CardContent className="py-12">
                  {state.roomPlayers.length < 2 ? (
                    <div>
                      <Users className="w-16 h-16 text-white/60 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-white">
                        İkinci Oyuncu Bekleniyor
                      </h3>
                      <p className="text-white/70">
                        Oyunu başlatmak için ikinci oyuncunun katılmasını bekleyin.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-4 text-white">
                        Oyun Başlatılabilir!
                      </h3>
                      {isRoomCreator ? (
                        <Button
                          variant="game"
                          size="lg"
                          onClick={handleStartGame}
                          className="text-lg font-semibold"
                        >
                          Oyunu Başlat
                        </Button>
                      ) : (
                        <p className="text-white/70">
                          Oda sahibinin oyunu başlatmasını bekleyin.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Oyun aktif */}
            {state.gamePhase === 'answering' && state.currentRound && (
              <Card className="card-gradient border-white/20 text-white">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-3xl text-white mb-4">
                    Kategori: {state.currentRound.category_name}
                  </CardTitle>
                  <p className="text-white/70 text-lg">
                    Bu kategoriye uygun bir kelime yazın!
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitAnswer} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Cevabınızı yazın..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg"
                      disabled={submitting}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      variant="game"
                      size="lg"
                      className="w-full text-lg font-semibold"
                      disabled={submitting || !answer.trim()}
                    >
                      {submitting ? 'Gönderiliyor...' : 'Cevabı Gönder'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Bekleme durumu - cevap gönderildi */}
            {state.gamePhase === 'waiting' && (
              <Card className="card-gradient border-white/20 text-white text-center">
                <CardContent className="py-12">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    Cevabınız Alındı!
                  </h3>
                  <p className="text-white/70">
                    Diğer oyuncunun cevabını bekliyoruz...
                  </p>
                  <div className="mt-4 bg-white/10 rounded-lg p-3">
                    <p className="text-white/80">Cevabınız: &quot;{state.answers.find(a => a.player_id === state.currentPlayer?.id)?.answer || answer}&quot;</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sonuçlar */}
            {state.gamePhase === 'results' && state.answers.length === 2 && (
              <Card className="card-gradient border-white/20 text-white">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl text-white">
                    Round Sonuçları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {state.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className={`p-4 rounded-lg ${
                          state.answers[0].answer === state.answers[1].answer
                            ? 'answer-match'
                            : 'answer-different'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">
                              {answer.players?.nickname}
                            </div>
                            <div className="text-lg font-bold">
                              &quot;{answer.answer}&quot;
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              +{answer.points_earned}
                            </div>
                            <div className="text-sm opacity-80">puan</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    {state.answers[0].answer === state.answers[1].answer ? (
                      <p className="text-green-300 font-semibold text-lg">
                        🎉 Aynı kelimeyi yazdınız! Her ikiniz 2 puan aldınız!
                      </p>
                    ) : (
                      <p className="text-blue-300 font-semibold text-lg">
                        Farklı kelimeler yazdınız. Her ikiniz 1 puan aldınız.
                      </p>
                    )}
                  </div>

                  {isRoomCreator ? (
                    <Button
                      variant="game"
                      size="lg"
                      onClick={handleNextRound}
                      className="w-full text-lg font-semibold"
                    >
                      {state.currentRoom!.current_round >= state.currentRoom!.max_rounds
                        ? 'Oyunu Bitir'
                        : 'Sonraki Round'}
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-white/70 mb-4">
                        Oda sahibinin sonraki round&apos;u başlatmasını bekleyin...
                      </p>
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Oyun bitti */}
            {state.gamePhase === 'finished' && (
              <Card className="card-gradient border-white/20 text-white text-center">
                <CardContent className="py-12">
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-6 text-white">
                    Oyun Bitti!
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <h4 className="text-lg font-semibold text-white">Final Skorları:</h4>
                    {state.roomPlayers
                      .sort((a, b) => b.score - a.score)
                      .map((player, index) => (
                        <div
                          key={player.id}
                          className={`p-4 rounded-lg ${
                            index === 0 ? 'bg-yellow-500/30' : 'bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                              <span className="font-semibold">
                                {player.players?.nickname}
                              </span>
                            </div>
                            <span className="text-xl font-bold">{player.score} puan</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="game"
                      size="lg"
                      onClick={handleGoHome}
                      className="w-full text-lg font-semibold gap-2"
                    >
                      <Home className="w-5 h-5" />
                      Ana Sayfaya Dön
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
