import type { Position } from "@/data/fieldData";
import type { UnitController } from "@/game/elements/unit/UnitController";

import { BattleFieldSceneState } from "./BattleFieldSceneState";
import type { BattleFieldSceneEnv } from "../types";
import { FieldState } from "./FieldState";

export class ActState extends BattleFieldSceneState {
  unit: UnitController;
  position: Position;
  target?: UnitController;

  constructor({
    env,
    unit,
    position,
  }: {
    env: BattleFieldSceneEnv;
    unit: UnitController;
    position: Position;
  }) {
    super(env);
    this.unit = unit;
    this.position = position;
  }

  start() {
    this.env.scene.controllers.range.createActRange({
      field: this.env.scene.controllers.field.data,
      unit: this.unit,
      position: this.position,
    });
  }

  end() {
    this.env.scene.controllers.range.removeRange();
    this.env.game.handlers.onPredictAct();
  }

  override moveCursor({ position }: { position: Position }) {
    super.moveCursor({ position });
    const hoveredUnit = this.env.scene.findUnitFromPosition(position);
    if (hoveredUnit) {
      const actable = this.unit.isHealer
        ? this.unit.isOffense === hoveredUnit.isOffense
        : this.unit.isOffense !== hoveredUnit.isOffense;
      if (actable && this.env.scene.controllers.range.isActable(position)) {
        this.target = hoveredUnit;
        this.env.scene.predictAct({ from: this.unit, to: hoveredUnit });
      } else {
        this.env.game.handlers.onFocusUnit(hoveredUnit);
        this.env.scene.clearActionPrediction();
      }
    }
  }

  override selectCell() {
    if (this.env.scene.isAnimating) {
      return;
    }
    const position = this.env.scene.controllers.cursor.position;
    if (this.env.scene.controllers.range.isActable(position) && this.target) {
      this.act(this.target);
    } else if (this.env.scene.controllers.range.isMovable(position)) {
      this.standBy();
    } else {
      this.cancelMove();
    }
  }

  private act(target: UnitController) {}

  private standBy() {
    this.env.scene.controllers.range.removeRange();
    this.unit.standBy(this.position);
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
      })
    );
  }

  private cancelMove() {
    this.env.scene.controllers.range.removeRange();
    this.unit.reset();
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
        hoveredUnit: this.unit,
      })
    );
  }
}
