import type { Position } from "@/data/fieldData";
import { RangeEntity } from "@/game/entities/range/RangeEntity";
import type { UnitEntity } from "@/game/entities/unit/UnitEntity";

import { BattleFieldSceneState } from "./BattleFieldSceneState";
import type { BattleFieldSceneEnv } from "../types";
import { ActState } from "./ActState";
import { FieldState } from "./FieldState";

export class FocusState extends BattleFieldSceneState {
  focusedUnit: UnitEntity;
  hoveredUnit?: UnitEntity;
  range: RangeEntity;

  constructor({
    env,
    focusedUnit,
    hoveredUnit,
  }: {
    env: BattleFieldSceneEnv;
    focusedUnit: UnitEntity;
    hoveredUnit?: UnitEntity;
  }) {
    super(env);
    this.focusedUnit = focusedUnit;
    this.hoveredUnit = hoveredUnit;

    const opponentUnits =
      env.scene.isPlayerOffense === focusedUnit.isOffense
        ? env.scene.enemyUnits
        : env.scene.playerUnits;
    const noEntries = opponentUnits.map((unit) => ({
      x: unit.position.x,
      y: unit.position.y,
    }));
    this.range = new RangeEntity({
      unitData: focusedUnit.data,
      isHealer: focusedUnit.isHealer,
      position: focusedUnit.position,
      fieldData: env.scene.field.data,
      noEntries,
      forceMove: Infinity, // debug
    });
  }

  start() {
    this.range.showRange();
    this.env.scene.layer.range.addChild(this.range.container);
  }

  end() {
    this.env.scene.layer.range.removeChild(this.range.container);
  }

  override moveCursor({ position }: { position: Position }) {
    if (this.env.scene.isAnimating) {
      return;
    }
    super.moveCursor({ position });
    this.hoveredUnit = this.env.scene.findUnitFromPosition(position);
    this.env.game.handlers.onFocusUnit(this.hoveredUnit ?? this.focusedUnit);
  }

  override selectCell() {
    if (this.env.scene.isAnimating) {
      return;
    }
    const position = this.env.scene.cursor.position;
    const { focusedUnit, hoveredUnit } = this;

    if (hoveredUnit && hoveredUnit !== focusedUnit && !hoveredUnit.isActed) {
      this.changeFocusUnit(hoveredUnit);
    } else if (
      this.env.scene.isMyUnit(focusedUnit) &&
      this.range.isMovable(position)
    ) {
      this.moveUnit({ unit: focusedUnit, position });
    } else {
      this.cancelFocus();
    }
  }

  private changeFocusUnit(unit: UnitEntity) {
    this.env.scene.changeState(
      new FocusState({
        env: this.env,
        focusedUnit: unit,
      })
    );
  }

  private moveUnit({
    unit,
    position,
  }: {
    unit: UnitEntity;
    position: Position;
  }) {
    const route = this.range.routeTo(position);
    this.env.scene.layer.activeUnit.attach(unit.container);
    this.env.scene.animationQue.push({
      animations: unit.createMoveAnimations(route),
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
    this.range.hideRange();
  }

  private cancelFocus() {
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
      })
    );
  }

  animate(frame: number) {
    this.range.animate(frame);
  }
}
