import type { Position } from "@/data/fieldData";
import { RangeEntity } from "@/game/entities/range/RangeEntity";
import type { UnitEntity } from "@/game/entities/unit/UnitEntity";
import { wait } from "@/game/utils/wait";

import { BattleFieldSceneState } from "./BattleFieldSceneState";
import { AnimationManager } from "../AnimationManager";
import type { ActionPrediction, BattleFieldSceneEnv } from "../types";
import { FieldState } from "./FieldState";

export class ActState extends BattleFieldSceneState {
  unit: UnitEntity;
  position: Position;
  target?: UnitEntity;
  range: RangeEntity;
  isActing = false;
  animationManager = new AnimationManager();

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
    if (this.isActing) {
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
    this.isActing = true;
    this.range.hideRange();
    unit.changePosition(this.position);
    const actionPrediction = this.getActionPrediction({
      from: unit,
      to: target,
    });

    // メイン行動
    // TODO: クリティカル判定
    const deltaHp = actionPrediction.from.effect ?? 0;
    this.animationManager.add({
      animations: [
        target.createChangingHpBarAnimation({
          deltaHp: deltaHp,
          duration: 30,
        }),
      ],
      onEnd: () => {
        target.changeHp(target.currentHp + deltaHp);
      },
    });
    if (unit.isHealer) {
      await target.component.animateHeal();
    } else {
      await target.component.animateBurst();
    }
    await wait(100);

    // 反撃
    if (
      // TODO: ユニット生存判定
      !unit.isHealer &&
      !target.isHealer &&
      actionPrediction.to.effect !== null
    ) {
      unit.changeHp(unit.currentHp + (actionPrediction.to.effect ?? 0));
      await unit.component.animateBurst();
      await wait(100);
    }

    // 行動終了
    this.standBy();
    this.isActing = false;
    // TODO: ターン終了判定
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

  tick(deltaTime: number) {
    this.range.animate(deltaTime);
    this.animationManager.update(deltaTime);
  }
}
