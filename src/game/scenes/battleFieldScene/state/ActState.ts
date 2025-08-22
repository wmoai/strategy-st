import type { Position } from "@/data/fieldData";
import { RangeEntity } from "@/game/entities/range/RangeEntity";
import type { UnitEntity } from "@/game/entities/unit/UnitEntity";

import { BattleFieldSceneState } from "./BattleFieldSceneState";
import type { BattleFieldSceneEnv } from "../types";
import { FieldState } from "./FieldState";

export class ActState extends BattleFieldSceneState {
  unit: UnitEntity;
  position: Position;
  target?: UnitEntity;
  range: RangeEntity;

  constructor({
    env,
    unit,
    position,
  }: {
    env: BattleFieldSceneEnv;
    unit: UnitEntity;
    position: Position;
  }) {
    super(env);
    this.unit = unit;
    this.position = position;

    this.range = new RangeEntity({
      unitData: unit.data,
      isHealer: unit.isHealer,
      position,
      fieldData: env.scene.field.data,
      forceMove: 0,
    });
  }

  start() {
    this.range.showRange();
    this.env.scene.layer.range.addChild(this.range.container);
  }

  end() {
    this.env.scene.layer.range.removeChild(this.range.container);
    this.env.game.handlers.onPredictAct();
  }

  override moveCursor({ position }: { position: Position }) {
    super.moveCursor({ position });
    const hoveredUnit = this.env.scene.findUnitFromPosition(position);
    if (hoveredUnit) {
      const actable = this.unit.isHealer
        ? this.unit.isOffense === hoveredUnit.isOffense
        : this.unit.isOffense !== hoveredUnit.isOffense;
      if (actable && this.range.isActable(position)) {
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
    const position = this.env.scene.cursor.position;
    if (this.range.isActable(position) && this.target) {
      this.act(this.target);
    } else if (this.range.isMovable(position)) {
      this.standBy();
    } else {
      this.cancelMove();
    }
  }

  private act(target: UnitEntity) {
    console.log(target);
  }

  private standBy() {
    this.unit.standBy(this.position);
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
      })
    );
  }

  private cancelMove() {
    this.unit.resetToState();
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
        hoveredUnit: this.unit,
      })
    );
  }

  animate(frame: number) {
    this.range.animate(frame);
  }
}
