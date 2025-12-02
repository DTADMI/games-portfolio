// games/breakout/src/components/BreakoutGame.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameContainer, soundManager } from "@games/shared";

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
  speed: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  health: number;
}

type PowerUpType = "expand" | "shrink" | "slow" | "fast" | "multiball" | "laser" | "extraLife";

interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerUpType;
  dy: number;
  active: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 30;
const POWER_UP_SIZE = 20;
const POWER_UP_SPEED = 2;

const COLORS = ["#FF5252", "#FFD740", "#69F0AE", "#40C4FF", "#E040FB"];

export const BreakoutGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  // Game objects
  const [ball, setBall] = useState<Ball>({
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    radius: BALL_RADIUS,
    speed: 4,
  });

  const [paddle, setPaddle] = useState<Paddle>({
    x: 0,
    y: 0,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 0,
    speed: 8,
  });

  const [bricks, setBricks] = useState<Brick[][]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<
    Record<string, { type: PowerUpType; endTime: number }>
  >({});
  const [balls, setBalls] = useState<Ball[]>([]);

  // Initialize game
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Reset ball
    setBall({
      x: canvasWidth / 2,
      y: canvasHeight - 30,
      dx: 4,
      dy: -4,
      radius: BALL_RADIUS,
      speed: 4,
    });

    // Reset paddle
    setPaddle((prev) => ({
      ...prev,
      x: (canvasWidth - PADDLE_WIDTH) / 2,
      y: canvasHeight - PADDLE_HEIGHT - 10,
      dx: 0,
      width: PADDLE_WIDTH,
      speed: 8,
    }));

    // Reset power-ups and active power-ups
    setPowerUps([]);
    setActivePowerUps({});
    setBalls([]);

    // Generate bricks
    const newBricks: Brick[][] = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
        const colorIndex = Math.floor(Math.random() * COLORS.length);
        const points = (BRICK_ROW_COUNT - r) * 10 * level;

        newBricks[c][r] = {
          x: brickX,
          y: brickY,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: COLORS[colorIndex],
          points,
          health: 1,
        };
      }
    }
    setBricks(newBricks);

    // Play background music
    soundManager.playMusic("background");
  }, [level]);

  // Start a new game
  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setGameStarted(true);
    initGame();
  }, [initGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) {
        if (e.code === "Space") {
          startGame();
        }
        return;
      }

      if (e.code === "Space") {
        setIsPaused((prev) => !prev);
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "a") {
        setPaddle((prev) => ({ ...prev, dx: -prev.speed }));
      } else if (e.key === "ArrowRight" || e.key === "d") {
        setPaddle((prev) => ({ ...prev, dx: prev.speed }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        (e.key === "ArrowLeft" || e.key === "a" || e.key === "ArrowRight" || e.key === "d") &&
        paddle.dx !== 0
      ) {
        setPaddle((prev) => ({ ...prev, dx: 0 }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameStarted, paddle.dx, startGame]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw game objects
      drawPaddle(ctx);
      drawBall(ctx);
      drawBricks(ctx);
      drawPowerUps(ctx);
      drawBalls(ctx);
      drawHUD(ctx);

      // Update game state
      updatePaddle();
      updateBall();
      updatePowerUps();
      updateBalls();
      checkCollisions();

      // Continue animation
      if (!gameOver && !isPaused) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
    // The animation loop deliberately uses stable closures for performance; adding
    // all helpers as deps would restart the loop unnecessarily.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameOver, isPaused, bricks, powerUps, activePowerUps, balls]);

  // Draw paddle
  const drawPaddle = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, [paddle.height / 2]);
    ctx.fillStyle = "#3498db";
    ctx.fill();
    ctx.closePath();
  };

  // Draw ball
  const drawBall = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.closePath();
  };

  // Draw additional balls for multiball power-up
  const drawBalls = (ctx: CanvasRenderingContext2D) => {
    balls.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#e74c3c";
      ctx.fill();
      ctx.closePath();
    });
  };

  // Draw bricks
  const drawBricks = (ctx: CanvasRenderingContext2D) => {
    bricks.forEach((column) => {
      column.forEach((brick) => {
        if (brick.health > 0) {
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, brick.width, brick.height, [4]);
          ctx.fillStyle = brick.color;
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.stroke();
          ctx.closePath();

          // Draw brick health
          if (brick.health > 1) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              brick.health.toString(),
              brick.x + brick.width / 2,
              brick.y + brick.height / 2,
            );
          }
        }
      });
    });
  };

  // Draw power-ups
  const drawPowerUps = (ctx: CanvasRenderingContext2D) => {
    powerUps.forEach((powerUp) => {
      if (powerUp.active) {
        ctx.save();

        // Draw different shapes based on power-up type
        switch (powerUp.type) {
          case "expand":
            ctx.fillStyle = "#2ecc71";
            break;
          case "shrink":
            ctx.fillStyle = "#e74c3c";
            break;
          case "slow":
            ctx.fillStyle = "#3498db";
            break;
          case "fast":
            ctx.fillStyle = "#f1c40f";
            break;
          case "multiball":
            ctx.fillStyle = "#9b59b6";
            break;
          case "laser":
            ctx.fillStyle = "#e67e22";
            break;
          case "extraLife":
            ctx.fillStyle = "#e84393";
            break;
        }

        // Draw power-up icon
        ctx.beginPath();
        ctx.arc(
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
          powerUp.width / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.closePath();

        // Draw power-up letter
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          powerUp.type.charAt(0).toUpperCase(),
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
        );

        ctx.restore();
      }
    });
  };

  // Draw HUD (score, lives, level)
  const drawHUD = (ctx: CanvasRenderingContext2D) => {
    // Score
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Score: ${score}`, 10, 10);

    // High score
    ctx.textAlign = "center";
    ctx.fillText(`High Score: ${highScore}`, canvasRef.current!.width / 2, 10);

    // Lives
    ctx.textAlign = "right";
    ctx.fillText(`Lives: ${lives}`, canvasRef.current!.width - 10, 10);

    // Level
    ctx.textAlign = "center";
    ctx.fillText(`Level: ${level}`, canvasRef.current!.width / 2, 30);

    // Active power-ups
    let powerUpX = 10;
    Object.entries(activePowerUps).forEach(([type, { endTime }]) => {
      const timeLeft = Math.ceil((endTime - Date.now()) / 1000);
      if (timeLeft > 0) {
        ctx.fillStyle = "#7f8c8d";
        ctx.fillRect(powerUpX, canvasRef.current!.height - 25, 60, 20);

        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${type}: ${timeLeft}s`, powerUpX + 30, canvasRef.current!.height - 15);

        powerUpX += 70;
      }
    });

    // Game over or level complete message
    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      ctx.fillStyle = "#fff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Game Over", canvasRef.current!.width / 2, canvasRef.current!.height / 2 - 50);

      ctx.font = "24px Arial";
      ctx.fillText(
        `Final Score: ${score}`,
        canvasRef.current!.width / 2,
        canvasRef.current!.height / 2 + 10,
      );

      ctx.font = "20px Arial";
      ctx.fillText(
        "Press Space to Play Again",
        canvasRef.current!.width / 2,
        canvasRef.current!.height / 2 + 60,
      );
    } else if (showLevelComplete) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      ctx.fillStyle = "#fff";
      ctx.font = "36px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Level Complete!",
        canvasRef.current!.width / 2,
        canvasRef.current!.height / 2 - 30,
      );

      ctx.font = "20px Arial";
      ctx.fillText(
        "Get ready for the next level...",
        canvasRef.current!.width / 2,
        canvasRef.current!.height / 2 + 20,
      );
    } else if (!gameStarted) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      ctx.fillStyle = "#fff";
      ctx.font = "36px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Breakout", canvasRef.current!.width / 2, canvasRef.current!.height / 2 - 60);

      ctx.font = "20px Arial";
      ctx.fillText(
        "Use arrow keys or A/D to move",
        canvasRef.current!.width / 2,
        canvasRef.current!.height / 2,
      );
      ctx.fillText(
        "Press Space to Start",
        canvasRef.current!.width / 2,
        canvasRef.current!.height / 2 + 40,
      );
    } else if (isPaused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      ctx.fillStyle = "#fff";
      ctx.font = "36px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Paused", canvasRef.current!.width / 2, canvasRef.current!.height / 2);

      ctx.font = "20px Arial";
      ctx.fillText(
        "Press Space to Resume",
        canvasRef.current!.width / 2,
        canvasRef.current!.height / 2 + 50,
      );
    }
  };

  // Update paddle position
  const updatePaddle = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Move paddle
    let newX = paddle.x + paddle.dx;

    // Keep paddle in bounds
    if (newX < 0) {
      newX = 0;
    } else if (newX + paddle.width > canvas.width) {
      newX = canvas.width - paddle.width;
    }

    setPaddle((prev) => ({ ...prev, x: newX }));
  };

  // Update ball position
  const updateBall = () => {
    if (!gameStarted || isPaused) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Move ball
    let newX = ball.x + ball.dx;
    let newY = ball.y + ball.dy;
    let newDx = ball.dx;
    let newDy = ball.dy;

    // Wall collision (left/right)
    if (newX + ball.radius > canvas.width || newX - ball.radius < 0) {
      newDx = -newDx;
      soundManager.playSound("wall");
    }

    // Wall collision (top)
    if (newY - ball.radius < 0) {
      newDy = -newDy;
      soundManager.playSound("wall");
    }

    // Paddle collision
    if (
      newY + ball.radius > paddle.y &&
      newY - ball.radius < paddle.y + paddle.height &&
      newX + ball.radius > paddle.x &&
      newX - ball.radius < paddle.x + paddle.width
    ) {
      // Calculate angle based on where ball hits paddle
      const hitPos = (newX - paddle.x) / paddle.width;
      const angle = (hitPos * Math.PI) / 3; // 0 to 60 degrees

      // Calculate new direction
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      newDx = speed * Math.sin(angle) * (hitPos < 0.5 ? -1 : 1);
      newDy = -speed * Math.cos(angle);

      soundManager.playSound("paddle");
    }

    // Bottom wall (lose life)
    if (newY + ball.radius > canvas.height) {
      soundManager.playSound("loseLife");

      if (lives <= 1) {
        // Game over
        setGameOver(true);
        soundManager.playSound("gameOver");
        soundManager.stopMusic();
      } else {
        // Reset ball position
        newX = canvas.width / 2;
        newY = canvas.height - 30;
        newDx = 4 * (Math.random() > 0.5 ? 1 : -1);
        newDy = -4;

        setLives((prev) => prev - 1);
        setGameStarted(false); // Wait for user to serve
      }
    }

    setBall((prev) => ({
      ...prev,
      x: newX,
      y: newY,
      dx: newDx,
      dy: newDy,
    }));
  };

  // Update power-ups
  const updatePowerUps = () => {
    if (!gameStarted || isPaused) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setPowerUps((prevPowerUps) => {
      const updatedPowerUps = prevPowerUps
        .map((powerUp) => {
          if (!powerUp.active) {
            return powerUp;
          }

          // Move power-up down
          const newY = powerUp.y + POWER_UP_SPEED;

          // Check if power-up is caught by paddle
          if (
            newY + powerUp.height > paddle.y &&
            newY < paddle.y + paddle.height &&
            powerUp.x + powerUp.width > paddle.x &&
            powerUp.x < paddle.x + paddle.width
          ) {
            // Apply power-up effect
            applyPowerUp(powerUp.type);
            return null; // Remove power-up
          }

          // Remove if out of bounds
          if (newY > canvas.height) {
            return null;
          }

          return { ...powerUp, y: newY };
        })
        .filter(Boolean) as PowerUp[];

      return updatedPowerUps;
    });

    // Update active power-ups
    const now = Date.now();
    const updatedActivePowerUps = { ...activePowerUps };
    let powerUpExpired = false;

    Object.entries(activePowerUps).forEach(([type, { endTime }]) => {
      if (now >= endTime) {
        // Power-up expired
        removePowerUp(type as PowerUpType);
        delete updatedActivePowerUps[type];
        powerUpExpired = true;
      }
    });

    if (powerUpExpired) {
      setActivePowerUps(updatedActivePowerUps);
    }
  };

  // Update additional balls for multiball power-up
  const updateBalls = () => {
    if (!gameStarted || isPaused || balls.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setBalls((prevBalls) => {
      const updatedBalls = prevBalls
        .map((ball) => {
          let { x, y, dx, dy, radius } = ball;

          // Move ball
          x += dx;
          y += dy;

          // Wall collision (left/right)
          if (x + radius > canvas.width || x - radius < 0) {
            dx = -dx;
            soundManager.playSound("wall");
          }

          // Wall collision (top)
          if (y - radius < 0) {
            dy = -dy;
            soundManager.playSound("wall");
          }

          // Paddle collision
          if (
            y + radius > paddle.y &&
            y - radius < paddle.y + paddle.height &&
            x + radius > paddle.x &&
            x - radius < paddle.x + paddle.width
          ) {
            // Calculate angle based on where ball hits paddle
            const hitPos = (x - paddle.x) / paddle.width;
            const angle = (hitPos * Math.PI) / 3; // 0 to 60 degrees

            // Calculate new direction
            const speed = Math.sqrt(dx * dx + dy * dy);
            dx = speed * Math.sin(angle) * (hitPos < 0.5 ? -1 : 1);
            dy = -speed * Math.cos(angle);

            soundManager.playSound("paddle");
          }

          // Bottom wall (remove ball)
          if (y + radius > canvas.height) {
            return null;
          }

          return { ...ball, x, y, dx, dy };
        })
        .filter(Boolean) as Ball[];

      return updatedBalls;
    });
  };

  // Check for collisions between ball and bricks
  const checkCollisions = () => {
    if (!gameStarted || isPaused) {
      return;
    }

    // Check ball-brick collisions
    let bricksDestroyed = 0;
    let newBricks = [...bricks];
    let newScore = score;
    let newPowerUps = [...powerUps];
    let brickHit = false;

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brick = newBricks[c][r];
        if (brick.health <= 0) {
          continue;
        }

        // Check collision with main ball
        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height
        ) {
          // Determine which side was hit
          const ballCenterX = ball.x;
          const ballCenterY = ball.y;
          const _brickCenterX = brick.x + brick.width / 2;
          const _brickCenterY = brick.y + brick.height / 2;

          // Calculate overlap on each axis
          const overlapX = Math.min(
            Math.abs(ballCenterX - brick.x - brick.width),
            Math.abs(ballCenterX - brick.x),
          );
          const overlapY = Math.min(
            Math.abs(ballCenterY - brick.y - brick.height),
            Math.abs(ballCenterY - brick.y),
          );

          // Determine which axis has the smallest overlap (that's the side that was hit)
          if (overlapX < overlapY) {
            ball.dx = -ball.dx;
          } else {
            ball.dy = -ball.dy;
          }

          // Reduce brick health
          newBricks[c][r] = {
            ...brick,
            health: brick.health - 1,
          };

          // Add score if brick is destroyed
          if (newBricks[c][r].health <= 0) {
            newScore += brick.points;
            bricksDestroyed++;
            soundManager.playSound("brickBreak");

            // Random chance to drop power-up
            if (Math.random() < 0.2) {
              // 20% chance
              const powerUpTypes: PowerUpType[] = [
                "expand",
                "shrink",
                "slow",
                "fast",
                "multiball",
                "laser",
                "extraLife",
              ];
              const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

              newPowerUps.push({
                x: brick.x + brick.width / 2 - POWER_UP_SIZE / 2,
                y: brick.y,
                width: POWER_UP_SIZE,
                height: POWER_UP_SIZE,
                type: randomType,
                dy: POWER_UP_SPEED,
                active: true,
              });
            }
          } else {
            soundManager.playSound("brickHit");
          }

          brickHit = true;
          break;
        }

        // Check collision with additional balls
        for (let i = 0; i < balls.length; i++) {
          const b = balls[i];
          if (
            b.x + b.radius > brick.x &&
            b.x - b.radius < brick.x + brick.width &&
            b.y + b.radius > brick.y &&
            b.y - b.radius < brick.y + brick.height
          ) {
            // Similar collision response as main ball
            const ballCenterX = b.x;
            const ballCenterY = b.y;
            const _brickCenterX = brick.x + brick.width / 2;
            const _brickCenterY = brick.y + brick.height / 2;

            const overlapX = Math.min(
              Math.abs(ballCenterX - brick.x - brick.width),
              Math.abs(ballCenterX - brick.x),
            );
            const overlapY = Math.min(
              Math.abs(ballCenterY - brick.y - brick.height),
              Math.abs(ballCenterY - brick.y),
            );

            if (overlapX < overlapY) {
              b.dx = -b.dx;
            } else {
              b.dy = -b.dy;
            }

            // Reduce brick health
            newBricks[c][r] = {
              ...brick,
              health: brick.health - 1,
            };

            // Add score if brick is destroyed
            if (newBricks[c][r].health <= 0) {
              newScore += brick.points;
              bricksDestroyed++;
              soundManager.playSound("brickBreak");

              // Random chance to drop power-up
              if (Math.random() < 0.2) {
                // 20% chance
                const powerUpTypes: PowerUpType[] = [
                  "expand",
                  "shrink",
                  "slow",
                  "fast",
                  "multiball",
                  "laser",
                  "extraLife",
                ];
                const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

                newPowerUps.push({
                  x: brick.x + brick.width / 2 - POWER_UP_SIZE / 2,
                  y: brick.y,
                  width: POWER_UP_SIZE,
                  height: POWER_UP_SIZE,
                  type: randomType,
                  dy: POWER_UP_SPEED,
                  active: true,
                });
              }
            } else {
              soundManager.playSound("brickHit");
            }

            brickHit = true;
            break;
          }
        }

        if (brickHit) {
          break;
        }
      }
      if (brickHit) {
        break;
      }
    }

    // Update state
    if (bricksDestroyed > 0) {
      setScore(newScore);
      setBricks(newBricks);
      setPowerUps(newPowerUps);

      // Check if level is complete
      const levelComplete = newBricks.every((column) => column.every((brick) => brick.health <= 0));

      if (levelComplete) {
        soundManager.playSound("levelComplete");
        setShowLevelComplete(true);
        setTimeout(() => {
          setShowLevelComplete(false);
          setLevel((prev) => prev + 1);
          initGame();
        }, 2000);
      }
    }
  };

  // Apply power-up effect
  const applyPowerUp = (type: PowerUpType) => {
    soundManager.playSound("powerUp");

    const now = Date.now();
    const duration = 10000; // 10 seconds

    switch (type) {
      case "expand":
        setPaddle((prev) => ({
          ...prev,
          width: Math.min(prev.width * 1.5, 200), // Max width 200px
        }));
        break;

      case "shrink":
        setPaddle((prev) => ({
          ...prev,
          width: Math.max(prev.width * 0.7, 50), // Min width 50px
        }));
        break;

      case "slow":
        setBall((prev) => ({
          ...prev,
          dx: prev.dx * 0.7,
          dy: prev.dy * 0.7,
          speed: prev.speed * 0.7,
        }));
        break;

      case "fast":
        setBall((prev) => ({
          ...prev,
          dx: prev.dx * 1.3,
          dy: prev.dy * 1.3,
          speed: prev.speed * 1.3,
        }));
        break;

      case "multiball": {
        // Add two new balls
        const newBalls = [
          { ...ball, dx: -ball.dx, dy: -ball.dy },
          { ...ball, dx: ball.dx * 0.7, dy: -ball.dy * 0.7 },
        ];
        setBalls((prev) => [...prev, ...newBalls]);
        break;
      }

      case "laser":
        // TODO: Implement laser power-up
        break;

      case "extraLife":
        setLives((prev) => Math.min(prev + 1, 5)); // Max 5 lives
        break;
    }

    // Add to active power-ups if it's a temporary effect
    if (type !== "extraLife" && type !== "multiball") {
      setActivePowerUps((prev) => ({
        ...prev,
        [type]: { type, endTime: now + duration },
      }));
    }
  };

  // Remove power-up effect
  const removePowerUp = (type: PowerUpType) => {
    switch (type) {
      case "expand":
      case "shrink":
        // Reset paddle width
        setPaddle((prev) => ({
          ...prev,
          width: PADDLE_WIDTH,
        }));
        break;

      case "slow":
      case "fast":
        // Reset ball speed
        setBall((prev) => ({
          ...prev,
          speed: 4,
          dx: prev.dx > 0 ? 4 : -4,
          dy: prev.dy > 0 ? 4 : -4,
        }));
        break;

      case "laser":
        // TODO: Remove laser power-up
        break;
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const container = canvas.parentElement;
      if (!container) {
        return;
      }

      // Maintain aspect ratio
      const containerWidth = container.clientWidth;
      const scale = Math.min(containerWidth / CANVAS_WIDTH, 1);

      canvas.style.width = `${CANVAS_WIDTH * scale}px`;
      canvas.style.height = `${CANVAS_HEIGHT * scale}px`;

      // Set actual canvas size (handles high DPI displays)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = CANVAS_WIDTH * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initGame();

    // Preload sounds
    soundManager.preloadSound("paddle", "/sounds/paddle.mp3");
    soundManager.preloadSound("brickHit", "/sounds/brick-hit.mp3");
    soundManager.preloadSound("brickBreak", "/sounds/brick-break.mp3");
    soundManager.preloadSound("wall", "/sounds/wall.mp3");
    soundManager.preloadSound("loseLife", "/sounds/lose-life.mp3");
    soundManager.preloadSound("gameOver", "/sounds/game-over.mp3");
    soundManager.preloadSound("levelComplete", "/sounds/level-complete.mp3");
    soundManager.preloadSound("powerUp", "/sounds/power-up.mp3");
    soundManager.preloadSound("background", "/sounds/breakout-bg.mp3", true);

    return () => {
      soundManager.stopMusic();
    };
  }, [initGame]);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      // Could save to localStorage here
    }
  }, [score, highScore]);

  return (
    <GameContainer
      title="Breakout"
      description="Break all the bricks with the ball and don't let it fall!"
    >
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="bg-white rounded-lg shadow-lg"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ maxWidth: "100%", height: "auto" }}
          tabIndex={0} // Make canvas focusable for keyboard events
        />
      </div>

      <div className="mt-4 text-center">
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-xl font-bold">{score}</div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-500">High Score</div>
            <div className="text-xl font-bold">{highScore}</div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-500">Lives</div>
            <div className="text-xl font-bold">{"❤️".repeat(lives)}</div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-500">Level</div>
            <div className="text-xl font-bold">{level}</div>
          </div>
        </div>

        {!gameStarted && !gameOver && (
          <button
            onClick={startGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {gameOver ? "Play Again" : "Start Game"}
          </button>
        )}

        {gameStarted && (
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="ml-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">How to Play</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>
            • Use <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> to move the paddle
          </li>
          <li>
            • Press <kbd>Space</kbd> to start/pause the game
          </li>
          <li>• Break all bricks to advance to the next level</li>
          <li>• Collect power-ups for special abilities</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">Power-Ups</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <div className="font-medium text-blue-700 dark:text-blue-300">Expand</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Wider paddle</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
            <div className="font-medium text-red-700 dark:text-red-300">Shrink</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Smaller paddle</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
            <div className="font-medium text-yellow-700 dark:text-yellow-300">Slow</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Slower ball</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
            <div className="font-medium text-purple-700 dark:text-purple-300">Multiball</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Extra balls</div>
          </div>
        </div>
      </div>
    </GameContainer>
  );
};

export default BreakoutGame;
