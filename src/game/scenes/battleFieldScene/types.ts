import type { UnitEntity } from "@/game/entities/unit/UnitEntity";
import type { Game } from "@/game/main/Game";

import type { BattleFieldScene } from "./BattleFieldScene";

export type BattleFieldSceneEnv = {
  game: Game;
  scene: BattleFieldScene;
};

export type ActionPrediction = {
  unit: UnitEntity;
  effect: number | null;
  hit: number | null;
  crit: number | null;
};
