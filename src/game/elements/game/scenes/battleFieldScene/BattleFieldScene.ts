import { Container, RenderLayer } from "pixi.js";

import type { Position } from "@/data/fieldData";
import type { UnitData } from "@/data/unitData";
import { cellSize } from "@/game/constants";
import type { Animation } from "@/game/elements/animation/Animation";
import { CursorController } from "@/game/elements/cursor/CursorController";
import { RangeController } from "@/game/elements/range/RangeController";
import { UnitController } from "@/game/elements/unit/UnitController";
import { FieldEntity } from "@/game/entities/field/FieldEntity";
import type { Game } from "@/game/main/Game";

import type { BattleFieldSceneState } from "./state/BattleFieldSceneState";
import { FieldState } from "./state/FieldState";
import type { ActionPrediction } from "./types";

export class BattleFieldScene {
  game: Game;
  isPlayerOffense: boolean;
  controllers: {
    range: RangeController;
    playerUnits: UnitController[];
    enemyUnits: UnitController[];
    cursor: CursorController;
  };
  container = new Container();
  field: FieldEntity;
  layer = {
    activeUnit: new RenderLayer(),
  };
  animationQue: Array<{
    animations: Animation[];
    onEnd?: () => void;
  }> = [];
  private state?: BattleFieldSceneState;
  // FIXME: 怪しい
  turn: "offense" | "defense" = "defense";

  constructor({
    game,
    isPlayerOffense,
    sortieUnits,
  }: {
    game: Game;
    isPlayerOffense: boolean;
    sortieUnits: {
      player: UnitData[];
      enemy: UnitData[];
    };
  }) {
    this.game = game;
    this.isPlayerOffense = isPlayerOffense;

    this.field = FieldEntity.randomField();
    const rangeController = new RangeController({ cellSize });

    const playerInitPositions =
      this.field.initialUnitPositions(isPlayerOffense);
    const playerUnitControllers = sortieUnits.player.map((unitData, index) => {
      const position = playerInitPositions[index];
      return new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: isPlayerOffense,
        position,
      });
    });

    const enemyInitPositions = this.field.initialUnitPositions(
      !isPlayerOffense
    );
    const enemyUnitControllers = sortieUnits.enemy.map((unitData, index) => {
      const position = enemyInitPositions[index];
      return new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: !isPlayerOffense,
        position,
      });
    });

    const cursorController = new CursorController({ cellSize });

    this.controllers = {
      range: rangeController,
      playerUnits: playerUnitControllers,
      enemyUnits: enemyUnitControllers,
      cursor: cursorController,
    };

    this.container.addChild(
      this.field.container,
      this.controllers.range.container,
      ...this.controllers.playerUnits.map((unit) => unit.container),
      ...this.controllers.enemyUnits.map((unit) => unit.container),
      this.controllers.cursor.graphic,
      this.layer.activeUnit
    );

    const mapState = new FieldState({ env: { game: this.game, scene: this } });
    mapState.moveCursor({
      position: this.controllers.playerUnits[0].position,
    });
    this.changeState(mapState);

    this.field.onHover(({ position }) => this.state?.moveCursor({ position }));
    this.field.onClick(() => {
      this.state?.selectCell();
    });
  }

  animate({ deltaTime, frame }: { deltaTime: number; frame: number }) {
    this.controllers.cursor.animate(frame);
    this.controllers.range.animate(frame);

    this.animateByQue(deltaTime);
  }

  private animateByQue(deltaTime: number) {
    if (this.animationQue.length === 0) {
      return;
    }
    const { animations, onEnd } = this.animationQue[0];
    const animation = animations[0];
    if (animation) {
      animation.update(deltaTime);
      if (animation.isFinished()) {
        animations.shift();
      }
    } else {
      onEnd?.();
      this.animationQue.shift();
    }
  }

  get isAnimating() {
    return this.animationQue.length > 0;
  }

  findUnitFromPosition({ x, y }: Position) {
    return this.controllers.playerUnits
      .concat(this.controllers.enemyUnits)
      .find((unit) => unit.position.x === x && unit.position.y === y);
  }

  isMyUnit(unit: UnitController) {
    return this.isPlayerOffense === unit.isOffense;
  }

  showUnitRange({ unit }: { unit: UnitController }) {
    this.controllers.range.createMoveRange({
      field: this.field.data,
      unit,
      opponentUnits:
        this.isPlayerOffense === unit.isOffense
          ? this.controllers.enemyUnits
          : this.controllers.playerUnits,
    });
  }

  changeState(nextState: BattleFieldSceneState) {
    this.state?.end();
    this.state = nextState;
    this.state.start();
  }

  get isMyTurn() {
    return (
      (this.isPlayerOffense && this.turn === "offense") ||
      (!this.isPlayerOffense && this.turn === "defense")
    );
  }

  get turnUnits() {
    if (this.isPlayerOffense) {
      return this.turn === "offense"
        ? this.controllers.playerUnits
        : this.controllers.enemyUnits;
    } else {
      return this.turn === "defense"
        ? this.controllers.playerUnits
        : this.controllers.enemyUnits;
    }
  }

  updateTurn() {
    if (this.turnUnits.every((unit) => unit.isActed)) {
      this.turn = this.turn === "offense" ? "defense" : "offense";
    }
  }

  private getActionPrediction({
    from,
    to,
  }: {
    from: UnitController;
    to: UnitController;
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
    const fromTerrain = this.field.data.getTerrain(from.position);
    const toTerrain = this.field.data.getTerrain(to.position);

    return {
      from: {
        unit: from,
        effect: -from.getActionEffectValueTo(to.data),
        hit: from.getHitRate({ target: to.data, terrain: toTerrain }),
        crit: from.getCritRate(),
      },
      to: {
        unit: to,
        effect: -to.getActionEffectValueTo(from.data),
        hit: to.getHitRate({ target: from.data, terrain: fromTerrain }),
        crit: to.getCritRate(),
      },
    };
  }

  predictAct({ from, to }: { from: UnitController; to: UnitController }) {
    this.game.handlers.onPredictAct(this.getActionPrediction({ from, to }));
  }

  clearActionPrediction() {
    this.game.handlers.onPredictAct();
  }
}
