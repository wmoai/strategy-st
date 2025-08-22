import type { UnitController } from "@/game/elements/unit/UnitController";
import type { Game } from "@/game/main/Game";

import type { BattleFieldScene } from "./BattleFieldScene";

export type Position = {
  x: number;
  y: number;
};

export type BattleFieldSceneEnv = {
  game: Game;
  scene: BattleFieldScene;
};

export type ActionPrediction = {
  unit: UnitController;
  effect: number | null;
  hit: number | null;
  crit: number | null;
};
