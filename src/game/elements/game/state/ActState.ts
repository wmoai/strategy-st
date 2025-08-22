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
    this.env.handlers.onPredictAct();
  }

  override moveCursor({ position }: { position: Position }) {
    super.moveCursor({ position });
    const hoveredUnit = this.env.findUnitFromPosition(position);
    if (hoveredUnit) {
      const actable = this.unit.isHealer
        ? this.unit.isOffense === hoveredUnit.isOffense
        : this.unit.isOffense !== hoveredUnit.isOffense;
      if (actable && this.env.controllers.range.isActable(position)) {
        this.target = hoveredUnit;
        this.env.predictAct({ from: this.unit, to: hoveredUnit });
      } else {
        this.env.handlers.onFocusUnit(hoveredUnit);
        this.env.clearActionPrediction();
      }
    }
  }

  override selectCell() {
    if (this.env.isAnimating) {
      return;
    }
    const position = this.env.controllers.cursor.position;
    if (this.env.controllers.range.isActable(position) && this.target) {
      this.act(this.target);
    } else if (this.env.controllers.range.isMovable(position)) {
      this.standBy();
    } else {
      this.cancelMove();
    }
  }

  private act(target: UnitController) {}

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
        hoveredUnit: this.unit,
      })
    );
  }
}
