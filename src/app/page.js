'use client';

import Image from "next/image";
import { useState } from 'react';

export default function Home() {
  const [selectedGame, setSelectedGame] = useState('powerball');
  const games = [
    { id: 'powerball', name: 'Powerball' },
    { id: 'megamillions', name: 'Mega Millions' },
    { id: 'texaslottery', name: 'Texas Lottery' },
  ];

  const handleGameChange = (event) => {
    setSelectedGame(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">Lottery Ticket Generator</h1>
      </header>
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label htmlFor="game-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select a Game:
          </label>
          <select
            id="game-select"
            value={selectedGame}
            onChange={handleGameChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            {games.find(g => g.id === selectedGame)?.name} Ticket
          </h2>
          {/* Placeholder for ticket numbers based on selectedGame */}
          <div className="text-center text-gray-600">
            <p>Ticket numbers will appear here.</p>
            <p>Selected: {selectedGame}</p>
          </div>
        </div>
      </main>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; Pearl&apos;s Lotto</p>
      </footer>
    </div>
  );
}
