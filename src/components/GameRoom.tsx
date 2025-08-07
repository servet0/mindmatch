'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { startNewRound, submitAnswer, calculateRoundResults, finishGame } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Crown, Timer, Users, Trophy, RotateCcw } from 'lucide-react';

export function GameRoom() {
  const { state, actions, dispatch } = useGame();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Oda subscription
  useEffect(() => {
    if (!state.currentRoom) return;

    const unsubscribe = actions.subscribeToRoom(state.currentRoom.id);
    return unsubscribe;
  }, [state.currentRoom?.id]);

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
    } catch (error) {
      // Hata durumunda UI'da gösterilecek
    }
  };

  // Cevap gönderme
  const handleSubmitAnswer = async (e: React.FormEvent) => {
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
    } catch (error) {
      // Hata durumunda UI'da gösterilecek
    } finally {
      setSubmitting(false);
    }
  };

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

  // Yeni oyun
  const handleNewGame = () => {
    actions.resetGame();
  };

  // Timer bitiminde otomatik işlemler
  useEffect(() => {
    if (state.timeLeft === 0 && state.gamePhase === 'answering') {
      // Eğer cevap verilmemişse boş cevap gönder
      if (!state.answers.find(a => a.player_id === state.currentPlayer?.id)) {
        handleSubmitAnswer(new Event('submit') as any);
      }
    }
  }, [state.timeLeft, state.gamePhase]);

  // Round sonuçlarını kontrol et
  useEffect(() => {
    if (state.answers.length === 2 && state.currentRound?.status === 'active') {
      calculateRoundResults(state.currentRound.id);
      dispatch({ type: 'SET_GAME_PHASE', payload: 'results' });
    }
  }, [state.answers.length, state.currentRound?.status]);

  const currentPlayerInRoom = state.roomPlayers.find(
    rp => rp.player_id === state.currentPlayer?.id
  );

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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Yeni oyun butonu */}
            <Button
              variant="game"
              onClick={handleNewGame}
              className="w-full gap-2"
            >
              <RotateCcw className="w-4 h-4" />
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
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Timer className={`w-8 h-8 ${state.timeLeft <= 3 ? 'timer-pulse text-red-400' : 'text-white'}`} />
                    <span className={`text-4xl font-bold ${state.timeLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
                      {state.timeLeft}
                    </span>
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">
                    Kategori: {state.currentRound.category_name}
                  </CardTitle>
                  <p className="text-white/70">
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
                      disabled={submitting || state.timeLeft === 0}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      variant="game"
                      size="lg"
                      className="w-full text-lg font-semibold"
                      disabled={submitting || !answer.trim() || state.timeLeft === 0}
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
                  <Timer className="w-16 h-16 text-white/60 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    Diğer Oyuncu Bekleniyor
                  </h3>
                  <p className="text-white/70">
                    Diğer oyuncunun cevabını bekleyin.
                  </p>
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
                      onClick={handleNewGame}
                      className="w-full text-lg font-semibold gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Yeni Oyun
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
