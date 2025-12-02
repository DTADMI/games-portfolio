// games/memory/src/components/MemoryGame.tsx
import React, { useCallback, useEffect, useState } from "react";
import { GameContainer, soundManager } from "@games/shared";

interface Card {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_PAIRS = 8; // 16 cards total
const CARD_VALUES = Array.from({ length: CARD_PAIRS }, (_, i) => i + 1);

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Initialize game
  const initializeGame = useCallback(() => {
    // Load sounds
    soundManager.preloadSound("cardFlip", "/sounds/card-flip.mp3");
    soundManager.preloadSound("match", "/sounds/match.mp3");
    soundManager.preloadSound("win", "/sounds/win.mp3");
    soundManager.preloadSound("background", "/sounds/memory-bg.mp3", true);

    // Calculate number of pairs based on difficulty
    const pairs = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 12;
    const values = CARD_VALUES.slice(0, pairs);
    const cardValues = [...values, ...values]; // Duplicate for pairs

    const shuffled = cardValues
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setGameOver(false);
    soundManager.playMusic("background");
  }, [difficulty]);

  // Check for matches
  useEffect(() => {
    if (flippedIndices.length === 2) {
      setIsProcessing(true);
      const [firstIndex, secondIndex] = flippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.value === secondCard.value) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card, idx) =>
            idx === firstIndex || idx === secondIndex ? { ...card, isMatched: true } : card,
          ),
        );
        soundManager.playSound("match");
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card, idx) =>
              idx === firstIndex || idx === secondIndex ? { ...card, isFlipped: false } : card,
            ),
          );
        }, 1000);
      }

      setMoves((prev) => prev + 1);
      setFlippedIndices([]);
      setTimeout(() => setIsProcessing(false), 1000);
    }
  }, [flippedIndices, cards]);

  // Check for game over
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameOver(true);
      soundManager.playSound("win");
      soundManager.stopMusic();
    }
  }, [cards]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (
      isProcessing ||
      gameOver ||
      flippedIndices.includes(index) ||
      cards[index].isMatched ||
      flippedIndices.length >= 2
    ) {
      return;
    }

    soundManager.playSound("cardFlip");

    setCards((prev) =>
      prev.map((card, idx) => (idx === index ? { ...card, isFlipped: true } : card)),
    );

    setFlippedIndices((prev) => [...prev, index]);
  };

  // Initialize game on mount and when difficulty changes
  useEffect(() => {
    initializeGame();
    return () => {
      soundManager.stopMusic();
    };
  }, [initializeGame]);

  // Calculate score
  const score = cards.filter((card) => card.isMatched).length / 2;

  return (
    <GameContainer
      title="Memory Card Game"
      description={`Match all the pairs in as few moves as possible! Score: ${score} / ${CARD_PAIRS}`}
    >
      <div className="p-4">
        {/* Difficulty Selector */}
        <div className="mb-6 text-center">
          <label className="mr-2 text-gray-700 dark:text-gray-300">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
            className="px-3 py-1 border rounded-md"
            disabled={moves > 0}
          >
            <option value="easy">Easy (6 pairs)</option>
            <option value="medium">Medium (8 pairs)</option>
            <option value="hard">Hard (12 pairs)</option>
          </select>
        </div>

        {/* Game Board */}
        <div
          className={`grid gap-3 ${
            difficulty === "easy"
              ? "grid-cols-3"
              : difficulty === "medium"
                ? "grid-cols-4"
                : "grid-cols-6"
          }`}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-3xl font-bold
                cursor-pointer transition-all duration-300 transform
                ${card.isFlipped || card.isMatched ? "bg-white" : "bg-blue-600 hover:bg-blue-700"}
                ${card.isMatched ? "opacity-75" : ""}
                ${card.isFlipped ? "rotate-y-180" : ""}
              `}
              style={{
                transform: card.isFlipped || card.isMatched ? "rotateY(180deg)" : "rotateY(0)",
                backfaceVisibility: "hidden",
              }}
            >
              <div
                className={`
                  w-full h-full flex items-center justify-center
                  ${card.isFlipped || card.isMatched ? "opacity-100" : "opacity-0"}
                `}
                style={{ transform: "rotateY(180deg)" }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Game Info */}
        <div className="mt-6 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Moves: {moves} | Matches: {score} / {CARD_PAIRS}
          </p>

          {gameOver && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                Congratulations! You won in {moves} moves!
              </h3>
              <button
                onClick={initializeGame}
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};

export default MemoryGame;
