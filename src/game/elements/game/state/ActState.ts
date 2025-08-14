import type { Position } from "@/data/fieldData";

import type { UnitController } from "../../unit/UnitController";
import type { GameEnv } from "../GameEnv";
import { GameState } from "./GameState";
import { MapState } from "./MapState";

export class ActState extends GameState {
  unit: UnitController;
  position: Position;
  target?: UnitController;

  constructor({
    env,
    unit,
    position,
  }: {
    env: GameEnv;
    unit: UnitController;
    position: Position;
  }) {
    super(env);
    this.unit = unit;
    this.position = position;
  }

  start() {
    this.env.controllers.range.createActRange({
      field: this.env.controllers.field.data,
      unit: this.unit,
      position: this.position,
    });
  }

  end() {
    this.env.controllers.range.removeRange();
  }

  override moveCursor({ position }: { position: Position }) {
    super.moveCursor({ position });
  }

  override selectCell() {
    if (this.env.isAnimating) {
      return;
    }
    const position = this.env.controllers.cursor.position;
    if (this.env.controllers.range.isActable(position) && this.target) {
      // 行動確定
    } else if (this.env.controllers.range.isMovable(position)) {
      this.standBy();
    } else {
      this.cancelMove();
    }
  }

  private standBy() {
    this.env.controllers.range.removeRange();
    this.unit.standBy(this.position);
    this.env.changeState(
      new MapState({
        env: this.env,
      })
    );
  }

  private cancelMove() {
    this.env.controllers.range.removeRange();
    this.unit.reset();
    this.env.changeState(
      new MapState({
        env: this.env,
      })
    );
  }
}
