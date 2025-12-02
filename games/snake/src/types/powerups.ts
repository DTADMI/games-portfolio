// games/snake/src/types/powerups.ts
import { Position } from "./game";

export type PowerUpType = "speed" | "slow" | "grow" | "shrink" | "invincible";

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Position;
  activeUntil?: number;
}

// In your game state
export interface GameState {
  // ... existing state ...
  powerUps: PowerUp[];
  activePowerUps: Record<string, PowerUp>;
  // ... rest of the state
}
