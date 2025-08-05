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
      unit: UnitController;
      hoveredUnit?: UnitController;
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
  isPlayerOffense = true;
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

  constructor() {
    const container = new Container();
    container.addChild(this.layer.field);
    container.addChild(this.layer.range);
    container.addChild(this.layer.unit);
    container.addChild(this.layer.cursor);
    this.app.stage.addChild(container);
  }

  async run({
    canvas,
    width,
    height,
    isPlayerOffense,
    sortieUnits,
    onFocusUnit,
    onFocusTerrain,
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
    onFocusTerrain: (terrain: TerrainDatum) => void;
  }) {
    await FieldComponent.preload();
    await UnitComponent.preload();
    await this.app.init({
      canvas,
      width,
      height,
      backgroundColor: "#222",
    });
    this.isPlayerOffense = isPlayerOffense;

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

    this.app.stage.x = this.app.screen.width / 2;
    this.app.stage.pivot.x = this.app.stage.width / 2;

    this.setHoverHandler({ onFocusUnit, onFocusTerrain });
    this.setClickHandler();
    this.setTicker();
  }

  private setHoverHandler({
    onFocusUnit,
    onFocusTerrain,
  }: {
    onFocusUnit: (unitController: UnitController) => void;
    onFocusTerrain: (terrain: TerrainDatum) => void;
  }) {
    this.controllers.field?.onHover(({ position, terrain }) => {
      this.controllers.cursor?.update(position);
      onFocusTerrain(terrain);
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
  }

  private setClickHandler() {
    this.controllers.field?.component.onClick(() => {
      const { field: fieldController } = this.controllers;
      if (!fieldController) {
        return;
      }
      switch (this.state.type) {
        case "map": {
          if (!this.state.hoveredUnit) {
            return;
          }
          this.controllers.range?.createRange({
            field: fieldController.data,
            unit: this.state.hoveredUnit,
            opponentUnits:
              (this.isPlayerOffense === this.state.hoveredUnit.isOffense
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
  }

  private setTicker() {
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

  private findUnitFromPosition({ x, y }: Position) {
    return this.controllers.playerUnits
      ?.concat(this.controllers.enemyUnits ?? [])
      .find((unitModel) => unitModel.state.x === x && unitModel.state.y === y);
  }
}
