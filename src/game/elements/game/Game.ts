import { Application, Container } from "pixi.js";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";

import { CursorController } from "../cursor/CursorController";
import { FieldComponent } from "../field/FieldComponent";
import { FieldController } from "../field/FieldController";
import type { Position } from "../field/FieldLogic";
import { RangeController } from "../range/RangeController";
import { UnitComponent } from "../unit/UnitComponent";
import { UnitController } from "../unit/UnitController";

type State =
  | {
      type: "map";
      hoveredUnit?: UnitController;
    }
  | {
      type: "move";
      hoveredUnit?: UnitController;
      unit: UnitController;
    }
  | {
      type: "act";
      unit: UnitController;
      target?: UnitController;
    };

const cellSize = 40;

export class Game {
  app = new Application();
  state: State = { type: "map" };
  controllers: {
    field?: FieldController;
    range?: RangeController;
    playerUnits?: UnitController[];
    enemyUnits?: UnitController[];
    cursor?: CursorController;
  } = {};
  layer = {
    field: new Container(),
    range: new Container(),
    unit: new Container(),
    cursor: new Container(),
  };

  async run({
    canvas,
    width,
    height,
    isPlayerOffense,
    sortieUnits,
    onFocusUnit,
    onHoverTerrain,
  }: {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    isPlayerOffense: boolean;
    sortieUnits: {
      player: UnitDatum[];
      enemy: UnitDatum[];
    };
    onFocusUnit: (unitController: UnitController) => void;
    onHoverTerrain: (terrain: TerrainDatum) => void;
  }) {
    await FieldComponent.preload();
    await UnitComponent.preload();
    await this.app.init({
      canvas,
      width,
      height,
      backgroundColor: "#222",
    });

    const container = new Container();
    container.addChild(this.layer.field);
    container.addChild(this.layer.range);
    container.addChild(this.layer.unit);
    container.addChild(this.layer.cursor);
    this.app.stage.addChild(container);

    const fieldController = FieldController.random({ cellSize });
    this.controllers.field = fieldController;
    this.layer.field.addChild(fieldController.container);

    this.controllers.range = new RangeController({ cellSize });
    this.layer.range.addChild(this.controllers.range.container);

    const playerInitPositions =
      fieldController.initialUnitPositions(isPlayerOffense);
    this.controllers.playerUnits = sortieUnits.player.map((unitData, index) => {
      const position = playerInitPositions[index];
      const unitController = new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: isPlayerOffense,
        position,
      });
      this.layer.unit.addChild(unitController.container);
      return unitController;
    });
    const enemyInitPositions = fieldController.initialUnitPositions(
      !isPlayerOffense
    );
    this.controllers.enemyUnits = sortieUnits.enemy.map((unitData, index) => {
      const position = enemyInitPositions[index];
      const unitController = new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: !isPlayerOffense,
        position,
      });
      this.layer.unit.addChild(unitController.container);
      return unitController;
    });
    this.controllers.cursor = new CursorController({ cellSize });
    this.layer.cursor.addChild(this.controllers.cursor.graphic);

    container.x = this.app.screen.width / 2;
    container.pivot.x = container.width / 2;

    fieldController.onHover(({ position, terrain }) => {
      this.controllers.cursor?.update(position);
      onHoverTerrain(terrain);
      switch (this.state.type) {
        case "map": {
          const hoveredUnit = this.findUnitFromPosition(position);
          if (hoveredUnit) {
            this.state.hoveredUnit = hoveredUnit;
            onFocusUnit(this.state.hoveredUnit);
          }
          break;
        }
        case "move": {
          const hoveredUnit = this.findUnitFromPosition(position);
          if (hoveredUnit) {
            this.state.hoveredUnit = hoveredUnit;
            onFocusUnit(this.state.hoveredUnit);
          } else if (this.state.hoveredUnit) {
            this.state.hoveredUnit = undefined;
            onFocusUnit(this.state.unit);
          }
          break;
        }
      }
    });
    fieldController.component.onClick(() => {
      switch (this.state.type) {
        case "map": {
          if (!this.state.hoveredUnit) {
            return;
          }
          this.controllers.range?.createRange({
            field: fieldController.data,
            unit: this.state.hoveredUnit,
            opponentUnits:
              (isPlayerOffense === this.state.hoveredUnit.isOffense
                ? this.controllers.enemyUnits
                : this.controllers.playerUnits) ?? [],
          });
          this.state = {
            type: "move",
            unit: this.state.hoveredUnit,
          };
          break;
        }
      }
    });

    let frame = 0;
    this.app.ticker.add((time) => {
      frame += time.deltaTime;
      if (frame > 60) {
        frame -= 60;
      }
      this.controllers.cursor?.animate(frame);
      this.controllers.range?.animate(frame);
    });
  }

  findUnitFromPosition({ x, y }: Position) {
    return this.controllers.playerUnits
      ?.concat(this.controllers.enemyUnits ?? [])
      .find((unitModel) => unitModel.state.x === x && unitModel.state.y === y);
  }
}
