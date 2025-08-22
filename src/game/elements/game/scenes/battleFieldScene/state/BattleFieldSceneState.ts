import type { Position } from "@/data/fieldData";

import type { BattleFieldSceneEnv } from "../types";

export abstract class BattleFieldSceneState {
  protected readonly env: BattleFieldSceneEnv;

  constructor(env: BattleFieldSceneEnv) {
    this.env = env;
  }

  abstract start(): void;
  abstract end(): void;

  moveCursor({ position }: { position: Position }) {
    const terrain = this.env.scene.field.data.getTerrain(position);
    this.env.scene.cursor.setPosition(position);
    this.env.game.handlers.onFocusTerrain(terrain);
  }

  abstract selectCell(): void;
}
