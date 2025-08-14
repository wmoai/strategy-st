import type { Position } from "@/data/fieldData";

import { GameState } from "./GameState";
import type { UnitController } from "../../unit/UnitController";
import type { GameEnv } from "../GameEnv";
import { ActState } from "./ActState";
import { MapState } from "./MapState";

export class FocusState extends GameState {
  focusedUnit: UnitController;
  hoveredUnit?: UnitController;

  constructor({
    env,
    focusedUnit,
    hoveredUnit,
  }: {
    env: GameEnv;
    focusedUnit: UnitController;
    hoveredUnit?: UnitController;
  }) {
    super(env);
    this.focusedUnit = focusedUnit;
    this.hoveredUnit = hoveredUnit;
  }

  start() {
    this.env.showUnitRange({ unit: this.focusedUnit });
  }

  end() {
    this.env.controllers.range.removeRange();
  }

  override moveCursor({ position }: { position: Position }) {
    super.moveCursor({ position });
    this.hoveredUnit = this.env.findUnitFromPosition(position);
    this.env.handlers.onFocusUnit(this.hoveredUnit ?? this.focusedUnit);
  }

  override selectCell() {
    if (this.env.isAnimating) {
      return;
    }
    const position = this.env.controllers.cursor.position;
    const { focusedUnit, hoveredUnit } = this;
    if (hoveredUnit && hoveredUnit !== focusedUnit && !hoveredUnit.isActed) {
      // フォーカス対称変更
      this.focusedUnit = hoveredUnit;
      this.env.showUnitRange({ unit: hoveredUnit });
    } else if (
      this.env.isMyUnit(focusedUnit) &&
      this.env.controllers.range.isMovable(position)
    ) {
      // 移動
      this.moveUnit({ unit: focusedUnit, position });
    } else {
      // フォーカス解除
      this.env.changeState(
        new MapState({
          env: this.env,
          hoveredUnit: this.hoveredUnit,
        })
      );
    }
  }

  private moveUnit({
    unit,
    position,
  }: {
    unit: UnitController;
    position: Position;
  }) {
    const route = this.env.controllers.range.routeTo(position);
    this.env.layer.activeUnit.attach(unit.container);
    this.env.animationQue.push({
      animations: unit.component.moveAnimations(route),
      onEnd: () => {
        this.env.layer.activeUnit.detach(unit.container);
        this.env.changeState(
          new ActState({
            env: this.env,
            unit,
            position,
          })
        );
      },
    });
    this.env.controllers.range.removeRange();
  }
}
