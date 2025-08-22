import { Container, RenderLayer } from "pixi.js";

import type { Position } from "@/data/fieldData";
import type { UnitData } from "@/data/unitData";
import type { Animation } from "@/game/elements/animation/Animation";
import { CursorEntity } from "@/game/entities/cursor/CursorEntity";
import { FieldEntity } from "@/game/entities/field/FieldEntity";
import { UnitEntity } from "@/game/entities/unit/UnitEntity";
import type { Game } from "@/game/main/Game";

import type { BattleFieldSceneState } from "./state/BattleFieldSceneState";
import { FieldState } from "./state/FieldState";
import type { ActionPrediction } from "./types";

export class BattleFieldScene {
  game: Game;
  isPlayerOffense: boolean;
  container = new Container();
  field: FieldEntity;
  cursor: CursorEntity;
  playerUnits: UnitEntity[];
  enemyUnits: UnitEntity[];
  layer = {
    range: new Container(),
    activeUnit: new RenderLayer(),
  };
  animationQue: Array<{
    animations: Animation[];
    onEnd?: () => void;
  }> = [];
  private state?: BattleFieldSceneState;
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

    const playerInitPositions =
      this.field.initialUnitPositions(isPlayerOffense);
    this.playerUnits = sortieUnits.player.map((unitData, index) => {
      const position = playerInitPositions[index];
      return new UnitEntity({
        unitId: unitData.id,
        isOffense: isPlayerOffense,
        position,
      });
    });

    const enemyInitPositions = this.field.initialUnitPositions(
      !isPlayerOffense
    );
    this.enemyUnits = sortieUnits.enemy.map((unitData, index) => {
      const position = enemyInitPositions[index];
      return new UnitEntity({
        unitId: unitData.id,
        isOffense: !isPlayerOffense,
        position,
      });
    });

    this.cursor = new CursorEntity();

    this.container.addChild(
      this.field.container,
      this.layer.range,
      ...this.playerUnits.map((unit) => unit.container),
      ...this.enemyUnits.map((unit) => unit.container),
      this.cursor.graphic,
      this.layer.activeUnit
    );

    const mapState = new FieldState({ env: { game: this.game, scene: this } });
    mapState.moveCursor({
      position: this.playerUnits[0].position,
    });
    this.changeState(mapState);

    this.field.onHover(({ position }) => this.state?.moveCursor({ position }));
    this.field.onClick(() => {
      this.state?.selectCell();
    });
  }

  animate({ deltaTime, frame }: { deltaTime: number; frame: number }) {
    this.cursor.animate(frame);
    this.state?.animate(frame);
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
    return this.playerUnits
      .concat(this.enemyUnits)
      .find((unit) => unit.position.x === x && unit.position.y === y);
  }

  isMyUnit(unit: UnitEntity) {
    return this.isPlayerOffense === unit.isOffense;
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
      return this.turn === "offense" ? this.playerUnits : this.enemyUnits;
    } else {
      return this.turn === "defense" ? this.playerUnits : this.enemyUnits;
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

  predictAct({ from, to }: { from: UnitEntity; to: UnitEntity }) {
    const actionPrediction = this.getActionPrediction({ from, to });
    this.game.handlers.onPredictAct(actionPrediction);
  }

  clearActionPrediction() {
    this.game.handlers.onPredictAct();
  }
}
