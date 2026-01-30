import type { Position } from "@/data/fieldData";
import { cellSize } from "@/game/constants";
import { RangeEntity } from "@/game/entities/range/RangeEntity";
import type { UnitEntity } from "@/game/entities/unit/UnitEntity";

import { BattleFieldSceneState } from "./BattleFieldSceneState";
import type { BattleFieldSceneEnv } from "../types";
import { ActState } from "./ActState";
import { FieldState } from "./FieldState";
import { AnimationManager, type Animation } from "../AnimationManager";

export class FocusState extends BattleFieldSceneState {
  focusedUnit: UnitEntity;
  hoveredUnit?: UnitEntity;
  range: RangeEntity;
  animationManager = new AnimationManager();

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
      forceMove: Infinity, // FIXME: debug
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
    super.moveCursor({ position });
    if (this.animationManager.isAnimating) {
      return;
    }
    this.hoveredUnit = this.env.scene.findUnitFromPosition(position);
    this.env.game.handlers.onFocusUnit(this.hoveredUnit ?? this.focusedUnit);
  }

  override selectCell() {
    if (this.animationManager.isAnimating) {
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
      }),
    );
  }

  private moveUnit({
    unit,
    position,
  }: {
    unit: UnitEntity;
    position: Position;
  }) {
    this.env.scene.layer.activeUnit.attach(unit.container);
    this.range.hideRange();

    const route = this.range.routeTo(position);
    const animations: Animation[] = route.map((nextPosition) => {
      const toCoordinates = {
        x: nextPosition.x * cellSize,
        y: nextPosition.y * cellSize,
      };

      return {
        update: (deltaTime: number) => {
          const { component } = this.focusedUnit;
          const distance = {
            x: toCoordinates.x - component.container.x,
            y: toCoordinates.y - component.container.y,
          };
          const movingDistance = deltaTime * 8;
          component.container.x =
            distance.x > 0
              ? Math.min(
                  component.container.x + movingDistance,
                  toCoordinates.x,
                )
              : Math.max(
                  component.container.x - movingDistance,
                  toCoordinates.x,
                );
          component.container.y =
            distance.y > 0
              ? Math.min(
                  component.container.y + movingDistance,
                  toCoordinates.y,
                )
              : Math.max(
                  component.container.y - movingDistance,
                  toCoordinates.y,
                );
        },
        isEnd: () => {
          const { component } = this.focusedUnit;
          return (
            component.container.x === toCoordinates.x &&
            component.container.y === toCoordinates.y
          );
        },
      };
    });
    this.animationManager.add({
      animations,
      onEnd: () => {
        this.env.scene.layer.activeUnit.detach(unit.container);
        this.env.scene.changeState(
          new ActState({
            env: this.env,
            unit,
            position,
          }),
        );
      },
    });
  }

  private cancelFocus() {
    this.env.scene.changeState(
      new FieldState({
        env: this.env,
      }),
    );
  }

  animate(deltaTime: number) {
    this.range.animate(deltaTime);
    this.animationManager.update(deltaTime);
  }
}
