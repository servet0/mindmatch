import { supabase, type Room, type RoomPlayer, type GameRound, type PlayerAnswer, type Category } from './supabase';

// Rastgele oda kodu oluştur
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Oyuncu oluştur
export async function createPlayer(nickname: string) {
  const { data, error } = await supabase
    .from('players')
    .insert([{ nickname }])
    .select()
    .single();

  if (error) {
    throw new Error(`Oyuncu oluşturulamadı: ${error.message}`);
  }
  
  return data;
}

// Oda oluştur
export async function createRoom(playerId: string) {
  let roomCode: string;
  let attempts = 0;
  const maxAttempts = 10;

  // Benzersiz oda kodu bul
  do {
    roomCode = generateRoomCode();
    
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('id')
      .eq('room_code', roomCode)
      .single();

    if (!existingRoom) break;
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error('Oda kodu oluşturulamadı');
  }

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert([{
      room_code: roomCode,
      created_by: playerId,
      status: 'waiting'
    }])
    .select()
    .single();

  if (roomError) {
    throw new Error(`Oda oluşturulamadı: ${roomError.message}`);
  }

  // Oda yaratıcısını odaya ekle
  const { error: playerError } = await supabase
    .from('room_players')
    .insert([{
      room_id: room.id,
      player_id: playerId,
      score: 0
    }]);

  if (playerError) {
    throw new Error(`Oyuncu odaya eklenemedi: ${playerError.message}`);
  }

  return room;
}

// Odaya katıl
export async function joinRoom(roomCode: string, playerId: string) {
  // Oda var mı kontrol et
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode)
    .eq('status', 'waiting')
    .single();

  if (roomError || !room) {
    throw new Error('Oda bulunamadı veya oyun zaten başlamış');
  }

  // Zaten katılmış mı kontrol et
  const { data: existingPlayer } = await supabase
    .from('room_players')
    .select('id')
    .eq('room_id', room.id)
    .eq('player_id', playerId)
    .single();

  if (existingPlayer) {
    throw new Error('Bu odaya zaten katıldınız');
  }

  // Oda dolu mu kontrol et (maksimum 2 oyuncu)
  const { data: roomPlayers } = await supabase
    .from('room_players')
    .select('id')
    .eq('room_id', room.id);

  if (roomPlayers && roomPlayers.length >= 2) {
    throw new Error('Oda dolu');
  }

  // Oyuncuyu odaya ekle
  const { error: joinError } = await supabase
    .from('room_players')
    .insert([{
      room_id: room.id,
      player_id: playerId,
      score: 0
    }]);

  if (joinError) throw joinError;

  return room;
}

// Rastgele kategori seç
export async function getRandomCategory(): Promise<Category> {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true);

  if (error || !categories || categories.length === 0) {
    throw new Error('Kategori bulunamadı');
  }

  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

// Yeni round başlat
export async function startNewRound(roomId: string, roundNumber: number) {
  const category = await getRandomCategory();

  const { data: round, error } = await supabase
    .from('game_rounds')
    .insert([{
      room_id: roomId,
      round_number: roundNumber,
      category_id: category.id,
      category_name: category.name,
      status: 'active',
      started_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;

  // Oda durumunu güncelle
  await supabase
    .from('rooms')
    .update({
      status: 'playing',
      current_round: roundNumber,
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);

  return round;
}

// Cevap gönder
export async function submitAnswer(roundId: string, playerId: string, roomId: string, answer: string) {
  const { data, error } = await supabase
    .from('player_answers')
    .insert([{
      round_id: roundId,
      player_id: playerId,
      room_id: roomId,
      answer: answer.trim().toLowerCase(),
      points_earned: 0 // Puanlar sonra hesaplanacak
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Round sonuçlarını hesapla
export async function calculateRoundResults(roundId: string) {
  // Round'daki tüm cevapları al
  const { data: answers, error } = await supabase
    .from('player_answers')
    .select('*')
    .eq('round_id', roundId);

  if (error || !answers || answers.length !== 2) {
    throw new Error('Round tamamlanmamış');
  }

  const [answer1, answer2] = answers;
  let points1 = 1, points2 = 1;

  // Cevaplar aynı mı kontrol et
  if (answer1.answer === answer2.answer) {
    points1 = 2;
    points2 = 2;
  }

  // Puanları güncelle
  await Promise.all([
    supabase
      .from('player_answers')
      .update({ points_earned: points1 })
      .eq('id', answer1.id),
    supabase
      .from('player_answers')
      .update({ points_earned: points2 })
      .eq('id', answer2.id)
  ]);

  // Room players skorlarını güncelle
  const { data: player1Data } = await supabase
    .from('room_players')
    .select('score')
    .eq('room_id', answer1.room_id)
    .eq('player_id', answer1.player_id)
    .single();

  const { data: player2Data } = await supabase
    .from('room_players')
    .select('score')
    .eq('room_id', answer2.room_id)
    .eq('player_id', answer2.player_id)
    .single();

  await Promise.all([
    supabase
      .from('room_players')
      .update({ score: (player1Data?.score || 0) + points1 })
      .eq('room_id', answer1.room_id)
      .eq('player_id', answer1.player_id),
    supabase
      .from('room_players')
      .update({ score: (player2Data?.score || 0) + points2 })
      .eq('room_id', answer2.room_id)
      .eq('player_id', answer2.player_id)
  ]);

  // Round'u tamamla
  await supabase
    .from('game_rounds')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString()
    })
    .eq('id', roundId);

  return {
    answers: [
      { ...answer1, points_earned: points1 },
      { ...answer2, points_earned: points2 }
    ],
    sameAnswer: answer1.answer === answer2.answer
  };
}

// Oyun bitir
export async function finishGame(roomId: string) {
  await supabase
    .from('rooms')
    .update({
      status: 'finished',
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);

  // Oyuncu istatistiklerini güncelle
  const { data: roomPlayers } = await supabase
    .from('room_players')
    .select('player_id, score')
    .eq('room_id', roomId);

  if (roomPlayers) {
    for (const roomPlayer of roomPlayers) {
      // Mevcut oyuncu verilerini al
      const { data: playerData } = await supabase
        .from('players')
        .select('total_score, games_played')
        .eq('id', roomPlayer.player_id)
        .single();

      if (playerData) {
        await supabase
          .from('players')
          .update({
            total_score: (playerData.total_score || 0) + roomPlayer.score,
            games_played: (playerData.games_played || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', roomPlayer.player_id);
      }
    }
  }
}
