import { RenderLayer } from "pixi.js";

import type { Position } from "@/data/fieldData";
import type { TerrainData } from "@/data/terrainData";
import type { UnitData } from "@/data/unitData";

import { CursorController } from "../cursor/CursorController";
import { FieldController } from "../field/FieldController";
import { RangeController } from "../range/RangeController";
import { UnitController } from "../unit/UnitController";
import type { GameState } from "./state/GameState";
import { MapState } from "./state/MapState";
import type { Animation } from "../animation/Animation";

const cellSize = 40;

export type Handlers = {
  onFocusUnit: (unitController: UnitController) => void;
  onFocusTerrain: (terrain: TerrainData) => void;
  onPredictAct: (args?: {
    from: ActionPrediction;
    to: ActionPrediction;
  }) => void;
};

export type ActionPrediction = {
  unit: UnitController;
  effect: number | null;
  hit: number | null;
  crit: number | null;
};

export class GameEnv {
  isPlayerOffense: boolean;
  controllers: {
    field: FieldController;
    range: RangeController;
    playerUnits: UnitController[];
    enemyUnits: UnitController[];
    cursor: CursorController;
  };
  handlers: Handlers;
  animationQue: Array<{
    animations: Animation[];
    onEnd?: () => void;
  }> = [];
  layer = {
    activeUnit: new RenderLayer(),
  };
  private state?: GameState;
  turn: "offense" | "defense" = "defense";

  constructor({
    isPlayerOffense,
    sortieUnits,
    handlers,
  }: {
    isPlayerOffense: boolean;
    sortieUnits: {
      player: UnitData[];
      enemy: UnitData[];
    };
    handlers: Handlers;
  }) {
    this.isPlayerOffense = isPlayerOffense;
    this.handlers = handlers;

    const fieldController = FieldController.random({ cellSize });
    const rangeController = new RangeController({ cellSize });

    const playerInitPositions =
      fieldController.initialUnitPositions(isPlayerOffense);
    const playerUnitControllers = sortieUnits.player.map((unitData, index) => {
      const position = playerInitPositions[index];
      return new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: isPlayerOffense,
        position,
      });
    });

    const enemyInitPositions = fieldController.initialUnitPositions(
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
      field: fieldController,
      range: rangeController,
      playerUnits: playerUnitControllers,
      enemyUnits: enemyUnitControllers,
      cursor: cursorController,
    };

    const mapState = new MapState({ env: this });
    mapState.moveCursor({
      position: this.controllers.playerUnits[0].position,
    });
    this.changeState(mapState);

    this.controllers.field.onHover(({ position }) =>
      this.state?.moveCursor({ position })
    );
    this.controllers.field.onClick(() => {
      this.state?.selectCell();
    });
  }

  animate(deltaTime: number) {
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
      field: this.controllers.field.data,
      unit,
      opponentUnits:
        this.isPlayerOffense === unit.isOffense
          ? this.controllers.enemyUnits
          : this.controllers.playerUnits,
    });
  }

  changeState(nextState: GameState) {
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
    const fromTerrain = this.controllers.field.data.getTerrain(from.position);
    const toTerrain = this.controllers.field.data.getTerrain(to.position);

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
    this.handlers.onPredictAct(this.getActionPrediction({ from, to }));
  }

  clearActionPrediction() {
    this.handlers.onPredictAct();
  }
}
