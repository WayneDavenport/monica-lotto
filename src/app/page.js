'use client';

import Image from "next/image";
import { useState, useMemo } from 'react';
import { TextScramble } from '@/components/motion-primitives/text-scramble';

// Hardcoded historical data for Lotto Texas (December 2024 - May 2025)
const historicalData = [
  [45, 52, 31, 43, 37, 22], [35, 52, 43, 21, 39, 7], [19, 1, 21, 32, 37, 52], [7, 40, 50, 19, 22, 27],
  [20, 14, 18, 36, 34, 54], [9, 7, 44, 42, 18, 19], [6, 7, 43, 19, 11, 1], [15, 4, 53, 18, 45, 21],
  [48, 28, 12, 21, 5, 46], [38, 47, 15, 7, 42, 27], [20, 30, 23, 42, 50, 52], [33, 46, 17, 52, 48, 4],
  [25, 38, 28, 21, 8, 35], [45, 37, 20, 22, 41, 29], [46, 40, 35, 17, 15, 53], [18, 51, 35, 9, 41, 31],
  [17, 12, 37, 44, 38, 26], [12, 20, 46, 1, 15, 18], [46, 29, 16, 54, 2, 14], [24, 40, 29, 46, 42, 19],
  [30, 34, 15, 48, 5, 28], [29, 19, 21, 40, 10, 50], [19, 35, 29, 2, 11, 18], [25, 32, 31, 13, 3, 48],
  [48, 17, 40, 46, 25, 9], [50, 29, 2, 40, 14, 18], [51, 12, 4, 2, 54, 42], [37, 54, 5, 20, 31, 6],
  [43, 49, 27, 3, 54, 41], [41, 25, 32, 54, 48, 10], [34, 36, 13, 11, 39, 4], [49, 40, 36, 5, 18, 17],
  [50, 28, 7, 40, 43, 44], [47, 25, 45, 21, 52, 19], [19, 9, 28, 21, 2, 32], [18, 9, 31, 52, 45, 27],
  [1, 36, 48, 2, 22, 52], [16, 39, 36, 53, 17, 6], [16, 27, 45, 26, 10, 20], [35, 7, 44, 10, 26, 54],
  [19, 8, 46, 16, 34, 49], [35, 49, 2, 22, 13, 17], [30, 10, 27, 43, 6, 41], [27, 35, 52, 24, 40, 25],
  [10, 15, 17, 28, 12, 1], [25, 16, 6, 10, 37, 21], [33, 22, 26, 52, 37, 10], [6, 8, 15, 34, 33, 17],
  [12, 15, 23, 37, 20, 3], [11, 48, 18, 9, 26, 33], [23, 52, 51, 41, 40, 48], [4, 6, 41, 11, 42, 31],
  [48, 50, 47, 53, 10, 54], [47, 53, 51, 28, 12, 38], [27, 22, 43, 9, 47, 34], [19, 43, 31, 33, 16, 2],
  [42, 3, 35, 14, 44, 26], [18, 28, 5, 35, 44, 42], [42, 15, 24, 39, 37, 17], [41, 18, 54, 26, 45, 17],
  [8, 43, 49, 44, 27, 48], [38, 54, 4, 33, 19, 41], [1, 52, 22, 25, 4, 27], [19, 36, 22, 30, 17, 54],
  [53, 6, 14, 31, 50, 23], [12, 20, 18, 9, 13, 49], [30, 40, 28, 26, 47, 54], [20, 15, 6, 43, 8, 34],
];

const ALL_POSSIBLE_NUMBERS = Array.from({ length: 54 }, (_, i) => i + 1);

function calculateNumberStats(data) {
  const frequencies = new Map();
  for (let i = 1; i <= 54; i++) {
    frequencies.set(i, 0);
  }
  data.flat().forEach(num => {
    frequencies.set(num, (frequencies.get(num) || 0) + 1);
  });

  const sortedNumbers = Array.from(frequencies.entries())
    .map(([number, frequency]) => ({ number, frequency }))
    .sort((a, b) => b.frequency - a.frequency || a.number - b.number);

  const mostFrequentNumbers = sortedNumbers.slice(0, 13).map(item => item.number);
  const leastFrequentNumbers = sortedNumbers.slice(-13).map(item => item.number).reverse(); // reverse to get ascending order of number for consistency if needed, though not strictly required for selection

  const remainingNumbers = sortedNumbers
    .slice(13, -13) // Numbers neither most nor least frequent
    .sort((a, b) => a.frequency - b.frequency || a.number - b.number); // Sort these by frequency for median selection

  // For median 8 from the 28 remaining numbers: (28 - 8) / 2 = 10. So, slice from index 10 up to 10+8=18.
  const median8Numbers = remainingNumbers.slice(10, 18).map(item => item.number);

  return { mostFrequentNumbers, leastFrequentNumbers, median8Numbers };
}

function generateSingleRow(
  countFromMost, mostFrequentSource,
  countFromLeast, leastFrequentSource,
  countFromMedian, medianSource,
  countGeneralRandom, totalNumbersInRow = 6
) {
  const row = new Set();

  const pickUniqueRandomFromSource = (source, count) => {
    const shuffledSource = [...source].sort(() => 0.5 - Math.random());
    let pickedCount = 0;
    for (const item of shuffledSource) {
      if (pickedCount === count) break;
      if (!row.has(item)) {
        row.add(item);
        pickedCount++;
      }
    }
  };

  pickUniqueRandomFromSource(mostFrequentSource, countFromMost);
  pickUniqueRandomFromSource(leastFrequentSource, countFromLeast);
  if (medianSource && countFromMedian > 0) { // medianSource might be empty if not applicable
    pickUniqueRandomFromSource(medianSource, countFromMedian);
  }

  // Fill remaining with general random numbers (1-54)
  const availableRandom = ALL_POSSIBLE_NUMBERS.filter(n => !row.has(n));
  const shuffledAvailableRandom = availableRandom.sort(() => 0.5 - Math.random());

  let generalRandomPickedCount = 0;
  for (const item of shuffledAvailableRandom) {
    if (row.size >= totalNumbersInRow || generalRandomPickedCount >= countGeneralRandom) break;
    if (!row.has(item)) { // double check, though filter should handle
      row.add(item);
      generalRandomPickedCount++;
    }
  }

  // If still not enough numbers (e.g. categories exhausted, requested more than available)
  // fill the rest up to totalNumbersInRow from all possible numbers not yet in row
  let i = 0;
  const allShuffled = [...ALL_POSSIBLE_NUMBERS].sort(() => 0.5 - Math.random());
  while (row.size < totalNumbersInRow && i < allShuffled.length) {
    if (!row.has(allShuffled[i])) {
      row.add(allShuffled[i]);
    }
    i++;
  }

  return Array.from(row).sort((a, b) => a - b);
}

export default function Home() {
  const [selectedGame, setSelectedGame] = useState('powerball');
  const [texasLottoTicket, setTexasLottoTicket] = useState([]);

  const games = [
    { id: 'powerball', name: 'Powerball' },
    { id: 'megamillions', name: 'Mega Millions' },
    { id: 'texaslottery', name: 'Texas Lottery' },
  ];

  const handleGameChange = (event) => {
    setSelectedGame(event.target.value);
    if (event.target.value !== 'texaslottery') {
      setTexasLottoTicket([]); // Clear ticket if switching away from Texas Lottery
    }
  };

  const numberStats = useMemo(() => calculateNumberStats(historicalData), [historicalData]);

  const handleGenerateTexasTicket = () => {
    const { mostFrequentNumbers, leastFrequentNumbers, median8Numbers } = numberStats;
    const ticket = [];

    // Rows 1 & 2: 2 frequent, 2 least frequent, 1 median, 1 random
    for (let i = 0; i < 2; i++) {
      ticket.push(generateSingleRow(2, mostFrequentNumbers, 2, leastFrequentNumbers, 1, median8Numbers, 1));
    }
    // Rows 3 & 4: 2 frequent, 3 least frequent, 1 random
    for (let i = 0; i < 2; i++) {
      ticket.push(generateSingleRow(2, mostFrequentNumbers, 3, leastFrequentNumbers, 0, [], 1));
    }
    // Row 5: 1 frequent, 1 least frequent, 4 random
    ticket.push(generateSingleRow(1, mostFrequentNumbers, 1, leastFrequentNumbers, 0, [], 4));

    setTexasLottoTicket(ticket);
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
          {selectedGame === 'texaslottery' ? (
            <>
              <button
                onClick={handleGenerateTexasTicket}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-4"
              >
                Generate Texas Lotto Ticket
              </button>
              {texasLottoTicket.length > 0 ? (
                <div className="space-y-2">
                  {texasLottoTicket.map((row, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded shadow">
                      <TextScramble
                        key={row.join('-') + '-' + index}
                        className='text-center text-lg font-mono tracking-widest text-black'
                        duration={1.2}
                        characterSet='. '
                      >
                        {row.join(' - ')}
                      </TextScramble>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">Click the button to generate your Texas Lotto numbers.</p>
              )}
            </>
          ) : (
            <div className="text-center text-black">
              <p className="text-black">Ticket numbers will appear here.</p>
              <p className="text-black">Selected: {selectedGame}</p>
            </div>
          )}
        </div>
      </main>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; Pearl&apos;s Lotto</p>
      </footer>
    </div>
  );
}
