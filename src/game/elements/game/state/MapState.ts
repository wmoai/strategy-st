import type { Position } from "@/data/fieldData";

import type { UnitController } from "../../unit/UnitController";
import type { GameEnv } from "../GameEnv";
import { FocusState } from "./FocusState";
import { GameState } from "./GameState";

export class MapState extends GameState {
  hoveredUnit?: UnitController;

  constructor({
    env,
    hoveredUnit,
  }: {
    env: GameEnv;
    hoveredUnit?: UnitController;
  }) {
    super(env);
    this.hoveredUnit = hoveredUnit;
  }

  start() {
    if (this.hoveredUnit) {
      this.env.handlers.onFocusUnit(this.hoveredUnit);
    }
    this.moveCursor({ position: this.env.controllers.cursor.position });
  }

  end() {}

  override moveCursor({ position }: { position: Position }) {
    super.moveCursor({ position });
    this.hoveredUnit = this.env.findUnitFromPosition(position);
    if (this.hoveredUnit) {
      this.env.handlers.onFocusUnit(this.hoveredUnit);
    }
  }

  override selectCell() {
    if (this.env.isAnimating) {
      return;
    }
    const unit = this.hoveredUnit;
    if (unit && !unit.isActed) {
      this.focusUnit(unit);
    }
  }

  private focusUnit(unit: UnitController) {
    if (!this.env.isMyTurn) {
      return;
    }
    this.env.changeState(
      new FocusState({
        env: this.env,
        focusedUnit: unit,
        hoveredUnit: this.hoveredUnit,
      })
    );
  }
}
