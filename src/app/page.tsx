'use client';

import { GameProvider } from '@/contexts/GameContext';
import { HomePage } from '@/components/HomePage';

export default function Home() {
  return (
    <GameProvider>
      <div className="game-container">
        <HomePage />
      </div>
    </GameProvider>
  );
}