// games/snake/src/components/SnakeGame.tsx
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { GameContainer } from '@games/shared';
import { soundManager } from '@games/shared';
import { Position, Obstacle, Portal, Direction, GameConfig, GameMode, GRID_SIZE, CELL_SIZE, GAME_SPEED } from '@/types/game';

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [config, setConfig] = useState<GameConfig>({
    mode: 'classic',
    speed: GAME_SPEED,
    hasObstacles: false,
    hasPortals: false,
    gridSize: GRID_SIZE,
  });

  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<Position>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [gameLoop, setGameLoop] = useState<NodeJS.Timeout | null>(null);

  // Load persisted scores on mount
  useEffect(() => {
    try {
      const savedHigh = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
      if (!isNaN(savedHigh)) setHighScore(savedHigh);
      const savedBoard = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
      if (Array.isArray(savedBoard)) setLeaderboard(savedBoard);
    } catch {}
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    // Set up initial snake
    const initialSnake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ];

    setSnake(initialSnake);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setFood(generateFood(initialSnake));

    if (config.hasObstacles) {
      setObstacles(generateObstacles(initialSnake));
    }

    if (config.hasPortals) {
      setPortals(generatePortals());
    }

    soundManager.playMusic('background');
  }, [config.hasObstacles, config.hasPortals]);

  // Generate random position
  const getRandomPosition = (exclude: Position[] = []): Position => {
    let position: Position;
    do {
      position = {
        x: Math.floor(Math.random() * config.gridSize),
        y: Math.floor(Math.random() * config.gridSize),
      };
    } while (
      exclude.some(pos => pos.x === position.x && pos.y === position.y)
    );
    return position;
  };

  // Generate food at random position
  const generateFood = (exclude: Position[]): Position => {
    return getRandomPosition(exclude);
  };

  // Generate obstacles
  const generateObstacles = (exclude: Position[]): Obstacle[] => {
    const obstacles: Obstacle[] = [];
    const obstacleCount = Math.floor((config.gridSize * config.gridSize) * 0.1); // 10% of grid

    for (let i = 0; i < obstacleCount; i++) {
      obstacles.push(getRandomPosition([...exclude, ...obstacles]));
    }

    return obstacles;
  };

  // Generate portal pairs
  const generatePortals = (): Portal[] => {
    const portalCount = 2; // Number of portal pairs
    const portals: Portal[] = [];
    const usedPositions: Position[] = [];

    for (let i = 0; i < portalCount; i++) {
      const entry = getRandomPosition(usedPositions);
      usedPositions.push(entry);

      const exit = getRandomPosition([...usedPositions]);
      usedPositions.push(exit);

      portals.push({ entry, exit });
    }

    return portals;
  };

  // Check collision
  const checkCollision = (position: Position, checkWalls = true): boolean => {
    // Check walls
    if (checkWalls && (
      position.x < 0 ||
      position.x >= config.gridSize ||
      position.y < 0 ||
      position.y >= config.gridSize
    )) {
      return true;
    }

    // Check self collision
    if (snake.some((segment, index) =>
      index > 0 && segment.x === position.x && segment.y === position.y
    )) {
      return true;
    }

    // Check obstacle collision
    if (config.hasObstacles && obstacles.some(obs =>
      obs.x === position.x && obs.y === position.y
    )) {
      return true;
    }

    return false;
  };

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted) {
      if (e.code === 'Space') {
        setGameStarted(true);
        initGame();
      }
      return;
    }

    if (e.code === 'Space') {
      setIsPaused(prev => !prev);
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setNextDirection('UP');
        break;
      case 'ArrowDown':
        if (direction !== 'UP') setNextDirection('DOWN');
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setNextDirection('LEFT');
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT') setNextDirection('RIGHT');
        break;
    }
  }, [direction, gameStarted, initGame]);

  // Game loop
  const gameLoopCallback = useCallback(() => {
    if (isPaused || !gameStarted) return;

    setDirection(nextDirection);

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };

      // Move head
      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check for portal
      if (config.hasPortals) {
        const portal = portals.find(p =>
          p.entry.x === head.x && p.entry.y === head.y
        );

        if (portal) {
          soundManager.playSound('portal');
          head.x = portal.exit.x;
          head.y = portal.exit.y;
        }
      }

      // Check for collision
      if (checkCollision(head)) {
        soundManager.playSound('gameOver');
        soundManager.stopCurrentMusic();
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        soundManager.playSound('eat');
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });

        // Generate new food
        setFood(generateFood([...newSnake, ...obstacles]));

        // Increase speed every 50 points
        if (score > 0 && score % 50 === 0) {
          setConfig(prev => ({
            ...prev,
            speed: Math.max(50, prev.speed - 10)
          }));
        }
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, nextDirection, isPaused, gameStarted, food, obstacles, portals, score, highScore]);

  // Set up game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const loop = setInterval(gameLoopCallback, config.speed);
      setGameLoop(loop);
      return () => clearInterval(loop);
    }
  }, [gameLoopCallback, gameStarted, gameOver, config.speed]);

  // Handle keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    for (let i = 0; i <= config.gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, config.gridSize * CELL_SIZE);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(config.gridSize * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw obstacles
    if (config.hasObstacles) {
      ctx.fillStyle = '#6b7280';
      obstacles.forEach(obstacle => {
        ctx.fillRect(
          obstacle.x * CELL_SIZE,
          obstacle.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
      });
    }

    // Draw portals
    if (config.hasPortals) {
      portals.forEach(portal => {
        // Entry portal (blue)
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.beginPath();
        ctx.arc(
          portal.entry.x * CELL_SIZE + CELL_SIZE / 2,
          portal.entry.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Exit portal (purple)
        ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.beginPath();
        ctx.arc(
          portal.exit.x * CELL_SIZE + CELL_SIZE / 2,
          portal.exit.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    }

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      // Head is a different color
      if (index === 0) {
        ctx.fillStyle = '#2563eb'; // Head color
      } else {
        // Gradient from head to tail
        const gradient = ctx.createLinearGradient(
          segment.x * CELL_SIZE,
          segment.y * CELL_SIZE,
          (segment.x + 1) * CELL_SIZE,
          (segment.y + 1) * CELL_SIZE
        );
        const alpha = 1 - (index / snake.length) * 0.8;
        gradient.addColorStop(0, `rgba(34, 197, 94, ${alpha})`);
        gradient.addColorStop(1, `rgba(22, 163, 74, ${alpha})`);
        ctx.fillStyle = gradient;
      }

      // Draw rounded rectangle for each segment
      const size = CELL_SIZE - 2;
      const x = segment.x * CELL_SIZE + 1;
      const y = segment.y * CELL_SIZE + 1;
      const radius = 3;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + size - radius, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
      ctx.lineTo(x + size, y + size - radius);
      ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
      ctx.lineTo(x + radius, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    });

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = '16px Arial';
      ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);
    } else if (!gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Snake Game', canvas.width / 2, canvas.height / 2 - 50);
      ctx.font = '16px Arial';
      ctx.fillText('Use arrow keys to move', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 30);
    } else if (isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
      ctx.font = '16px Arial';
      ctx.fillText('Press Space to Resume', canvas.width / 2, canvas.height / 2 + 30);
    }
  }, [snake, food, gameOver, isPaused, gameStarted, score, obstacles, portals, config]);

  // Handle game over
  useEffect(() => {
    if (gameOver) {
      soundManager.playSound('gameOver');
      soundManager.stopCurrentMusic();
      if (gameLoop) {
        clearInterval(gameLoop);
      }
      // Dispatch a public gameover event for external integrations (e.g., STOMP score submit)
      try {
        window.dispatchEvent(new CustomEvent('snake:gameover', { detail: { score } }));
      } catch {}
      // Update local high score and leaderboard
      try {
        // Save high score
        localStorage.setItem('snakeHighScore', String(highScore));
        // Update leaderboard with current score
        const existing = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
        const next = Array.isArray(existing) ? existing : [];
        next.push(score);
        const top = next.filter(n => typeof n === 'number' && !isNaN(n)).sort((a, b) => b - a).slice(0, 10);
        localStorage.setItem('snakeLeaderboard', JSON.stringify(top));
        setLeaderboard(top);
        try { window.dispatchEvent(new Event('snake:leaderboardUpdated')); } catch {}
      } catch {}
    }
  }, [gameOver, gameLoop, highScore, score]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (gameLoop) {
        clearInterval(gameLoop);
      }
      soundManager.stopCurrentMusic();
    };
  }, [gameLoop]);

  // Handle difficulty changes via a custom DOM event dispatched by the page wrapper UI
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { difficulty?: 'easy' | 'normal' | 'hard' } | undefined;
      const difficulty = detail?.difficulty ?? 'normal';
      // Map difficulty to speed and grid size
      const baseSpeed = GAME_SPEED; // lower is faster
      const baseGrid = GRID_SIZE;
      let nextSpeed = baseSpeed;
      let nextGrid = baseGrid;
      switch (difficulty) {
        case 'easy':
          nextSpeed = Math.min(300, baseSpeed + 50);
          nextGrid = Math.max(12, baseGrid - 4);
          break;
        case 'hard':
          nextSpeed = Math.max(60, baseSpeed - 50);
          nextGrid = Math.min(32, baseGrid + 4);
          break;
        default:
          nextSpeed = baseSpeed;
          nextGrid = baseGrid;
      }
      setConfig(prev => ({ ...prev, speed: nextSpeed, gridSize: nextGrid }));
      try {
        localStorage.setItem('snakeDifficulty', difficulty);
      } catch {}
    };

    window.addEventListener('snake:setDifficulty', handler as EventListener);

    // Apply saved or default difficulty on mount
    try {
      const saved = (localStorage.getItem('snakeDifficulty') as 'easy' | 'normal' | 'hard' | null) || 'normal';
      window.dispatchEvent(new CustomEvent('snake:setDifficulty', { detail: { difficulty: saved } }));
    } catch {
      window.dispatchEvent(new CustomEvent('snake:setDifficulty', { detail: { difficulty: 'normal' } }));
    }

    return () => {
      window.removeEventListener('snake:setDifficulty', handler as EventListener);
    };
  }, []);

  // Handle game mode changes
  const handleModeChange = (mode: GameMode) => {
    setConfig(prev => {
      const newConfig = { ...prev, mode };

      switch (mode) {
        case 'obstacles':
          newConfig.hasObstacles = true;
          newConfig.hasPortals = false;
          break;
        case 'portal':
          newConfig.hasPortals = true;
          newConfig.hasObstacles = false;
          break;
        case 'speed':
          newConfig.speed = GAME_SPEED / 2;
          newConfig.hasObstacles = false;
          newConfig.hasPortals = false;
          break;
        default: // classic
          newConfig.hasObstacles = false;
          newConfig.hasPortals = false;
          newConfig.speed = GAME_SPEED;
      }

      return newConfig;
    });
  };

  return (
    <GameContainer
      title="Snake Game"
      description={`Eat the food to grow. Avoid walls and yourself! Score: ${score} | High Score: ${highScore}`}
    >
      <div className="p-4">
        {/* Game Mode Selector */}
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {(['classic', 'obstacles', 'portal', 'speed'] as GameMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-3 py-1 rounded-md ${
                config.mode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={config.gridSize * CELL_SIZE}
            height={config.gridSize * CELL_SIZE}
            className="bg-white rounded-lg shadow-md"
          />
        </div>

        {/* Controls Info */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Use arrow keys to move | Space to {isPaused ? 'resume' : 'pause'}</p>
        </div>

        {/* Game Stats */}
        <div className="mt-4 flex justify-between text-sm">
          <div>Score: <span className="font-bold">{score}</span></div>
          <div>High Score: <span className="font-bold">{highScore}</span></div>
          <div>Speed: <span className="font-bold">
            {config.mode === 'speed' ? 'Fast' : 'Normal'}
          </span></div>
        </div>
      </div>
    </GameContainer>
  );
};

export default SnakeGame;
