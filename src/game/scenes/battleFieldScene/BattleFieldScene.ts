import { Container, RenderLayer } from "pixi.js";

import type { Position } from "@/data/fieldData";
import type { UnitData } from "@/data/unitData";
import { CursorEntity } from "@/game/entities/cursor/CursorEntity";
import { FieldEntity } from "@/game/entities/field/FieldEntity";
import { UnitEntity } from "@/game/entities/unit/UnitEntity";
import type { Game } from "@/game/main/Game";

import type { BattleFieldSceneState } from "./state/BattleFieldSceneState";
import { FieldState } from "./state/FieldState";

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

    const enemyInitPositions =
      this.field.initialUnitPositions(!isPlayerOffense);
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
      this.layer.activeUnit,
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

  animate(deltaTime: number) {
    this.cursor.animate(deltaTime);
    this.state?.animate(deltaTime);
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
}
