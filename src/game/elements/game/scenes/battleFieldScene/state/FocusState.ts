import type { Position } from "@/data/fieldData";
import type { UnitController } from "@/game/elements/unit/UnitController";

import { BattleFieldSceneState } from "./BattleFieldSceneState";
import type { BattleFieldSceneEnv } from "../types";
import { ActState } from "./ActState";
import { FieldState } from "./FieldState";

export class FocusState extends BattleFieldSceneState {
  focusedUnit: UnitController;
  hoveredUnit?: UnitController;

  constructor({
    env,
    focusedUnit,
    hoveredUnit,
  }: {
    env: BattleFieldSceneEnv;
    focusedUnit: UnitController;
    hoveredUnit?: UnitController;
  }) {
    super(env);
    this.focusedUnit = focusedUnit;
    this.hoveredUnit = hoveredUnit;
  }

  start() {
    this.env.scene.showUnitRange({ unit: this.focusedUnit });
  }

  end() {
    this.env.scene.controllers.range.removeRange();
  }

  override moveCursor({ position }: { position: Position }) {
    super.moveCursor({ position });
    this.hoveredUnit = this.env.scene.findUnitFromPosition(position);
    this.env.game.handlers.onFocusUnit(this.hoveredUnit ?? this.focusedUnit);
  }

  override selectCell() {
    if (this.env.scene.isAnimating) {
      return;
    }
    const position = this.env.scene.controllers.cursor.position;
    const { focusedUnit, hoveredUnit } = this;

    if (hoveredUnit && hoveredUnit !== focusedUnit && !hoveredUnit.isActed) {
      this.changeFocusUnit(hoveredUnit);
    } else if (
      this.env.scene.isMyUnit(focusedUnit) &&
      this.env.scene.controllers.range.isMovable(position)
    ) {
      this.moveUnit({ unit: focusedUnit, position });
    } else {
      this.cancelFocus();
    }
  }

  private changeFocusUnit(unit: UnitController) {
    this.focusedUnit = unit;
    this.env.scene.showUnitRange({ unit });
  }

  private moveUnit({
    unit,
    position,
  }: {
    unit: UnitController;
    position: Position;
  }) {
    const route = this.env.scene.controllers.range.routeTo(position);
    this.env.scene.layer.activeUnit.attach(unit.container);
    this.env.scene.animationQue.push({
      animations: unit.component.moveAnimations(route),
      onEnd: () => {
        this.env.scene.layer.activeUnit.detach(unit.container);
        this.env.scene.changeState(
          new ActState({
            env: this.env,
            unit,
            position,
          })
        );
      },
    });
    this.env.scene.controllers.range.removeRange();
  }

  private cancelFocus() {
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
      })
    );
  }
}
