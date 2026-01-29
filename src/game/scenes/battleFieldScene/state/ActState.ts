import type { Position } from "@/data/fieldData";
import { RangeEntity } from "@/game/entities/range/RangeEntity";
import type { UnitEntity } from "@/game/entities/unit/UnitEntity";
import { wait } from "@/game/utils/wait";

import { BattleFieldSceneState } from "./BattleFieldSceneState";
import type { ActionPrediction, BattleFieldSceneEnv } from "../types";
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
        this.predictAct({ from: this.unit, to: hoveredUnit });
      } else {
        this.env.game.handlers.onFocusUnit(hoveredUnit);
        this.env.game.handlers.onPredictAct(); // 行動結果予測をクリア
      }
    }
  }

  override selectCell() {
    if (this.env.scene.isAnimating) {
      return;
    }
    const position = this.env.scene.cursor.position;
    if (this.range.isActable(position) && this.target) {
      this.act();
    } else if (this.range.isMovable(position)) {
      this.standBy();
    } else {
      this.cancelMove();
    }
  }

  private async act() {
    const { unit, target } = this;
    if (!target) {
      return;
    }
    this.range.hideRange();
    unit.changePosition(this.position);
    const actionPrediction = this.getActionPrediction({
      from: unit,
      to: target,
    });
    target.changeHp(target.currentHp + (actionPrediction.from.effect ?? 0));
    if (unit.isHealer) {
      target.component.animateHeal();
    } else {
      target.component.animateBurst();
    }
    await wait(800);
    if (
      unit.isHealer ||
      target.isHealer ||
      actionPrediction.to.effect === null
    ) {
      return;
    }
    unit.changeHp(unit.currentHp + (actionPrediction.to.effect ?? 0));
    unit.component.animateBurst();
    await wait(800);
    this.unit.standBy(this.position);
    // TODO: change state
  }

  private standBy() {
    this.unit.standBy(this.position);
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
      }),
    );
  }

  private cancelMove() {
    this.unit.resetToState();
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
        hoveredUnit: this.unit,
      }),
    );
  }

  predictAct({ from, to }: { from: UnitEntity; to: UnitEntity }) {
    const actionPrediction = this.getActionPrediction({ from, to });
    this.env.game.handlers.onPredictAct(actionPrediction);
  }

  private getActionPrediction({
    from,
    to,
  }: {
    from: UnitEntity;
    to: UnitEntity;
  }): {
    from: ActionPrediction;
    to: ActionPrediction;
  } {
    if (from.isHealer) {
      return {
        from: {
          unit: from,
          effect: from.data.str,
          hit: 100,
          crit: null,
        },
        to: {
          unit: to,
          effect: null,
          hit: null,
          crit: null,
        },
      };
    }
    const fromTerrain = this.env.scene.field.data.getTerrain(from.position);
    const toTerrain = this.env.scene.field.data.getTerrain(to.position);
    const distance =
      Math.abs(this.position.x - to.position.x) +
      Math.abs(this.position.y - to.position.y);
    const canReachRange =
      distance <= to.data.max_range && distance >= to.data.min_range;

    return {
      from: {
        unit: from,
        effect: -from.getActionEffectValueTo(to.data),
        hit: from.getHitRate({ target: to.data, terrain: toTerrain }),
        crit: from.getCritRate(),
      },
      to:
        to.isHealer || !canReachRange
          ? {
              unit: to,
              effect: null,
              hit: null,
              crit: null,
            }
          : {
              unit: to,
              effect: -to.getActionEffectValueTo(from.data),
              hit: to.getHitRate({ target: from.data, terrain: fromTerrain }),
              crit: to.getCritRate(),
            },
    };
  }

  animate(frame: number) {
    this.range.animate(frame);
  }
}
