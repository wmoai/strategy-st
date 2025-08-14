import type { Position } from "@/data/fieldData";

import type { GameEnv } from "../GameEnv";

export abstract class GameState {
  protected readonly env: GameEnv;

  constructor(env: GameEnv) {
    this.env = env;
  }

  abstract start(): void;
  abstract end(): void;

  moveCursor({ position }: { position: Position }) {
    const terrain = this.env.controllers.field.data.getTerrain(position);
    this.env.controllers.cursor.setPosition(position);
    this.env.handlers.onFocusTerrain(terrain);
  }

  abstract selectCell(): void;
}
