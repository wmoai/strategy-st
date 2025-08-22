import type { Position } from "@/data/fieldData";
import type { UnitController } from "@/game/elements/unit/UnitController";

import { BattleFieldSceneState } from "./BattleFieldSceneState";
import type { BattleFieldSceneEnv } from "../types";
import { FocusState } from "./FocusState";

export class FieldState extends BattleFieldSceneState {
  hoveredUnit?: UnitController;

  constructor({
    env,
    hoveredUnit,
  }: {
    env: BattleFieldSceneEnv;
    hoveredUnit?: UnitController;
  }) {
    super(env);
    this.hoveredUnit = hoveredUnit;
  }

  start() {
    if (this.hoveredUnit) {
      this.env.game.handlers.onFocusUnit(this.hoveredUnit);
    }
    this.moveCursor({ position: this.env.scene.controllers.cursor.position });
  }

  end() {}

  override moveCursor({ position }: { position: Position }) {
    super.moveCursor({ position });
    this.hoveredUnit = this.env.scene.findUnitFromPosition(position);
    if (this.hoveredUnit) {
      this.env.game.handlers.onFocusUnit(this.hoveredUnit);
    }
  }

  override selectCell() {
    if (this.env.scene.isAnimating) {
      return;
    }
    const unit = this.hoveredUnit;
    if (unit && !unit.isActed) {
      this.focusUnit(unit);
    }
  }

  private focusUnit(unit: UnitController) {
    if (!this.env.scene.isMyTurn) {
      return;
    }
    this.env.scene.changeState(
      new FocusState({
        env: this.env,
        focusedUnit: unit,
        hoveredUnit: this.hoveredUnit,
      })
    );
  }
}
