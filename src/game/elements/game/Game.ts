import { Application, Container } from "pixi.js";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";

import { CursorController } from "../cursor/CursorController";
import { FieldController } from "../field/FieldController";
import { RangeController } from "../range/RangeController";
import { UnitController } from "../unit/UnitController";

type State =
  | {
      type: "map";
      hoveredUnit?: UnitController;
    }
  | {
      type: "move";
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
    onHoverUnit,
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
    onHoverUnit: (unitController: UnitController) => void;
    onHoverTerrain: (terrain: TerrainDatum) => void;
  }) {
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

    const fieldController = await FieldController.random({ cellSize });
    this.layer.field.addChild(fieldController.container);

    const rangeController = new RangeController({ cellSize });
    this.layer.range.addChild(rangeController.container);

    const playerInitPositions =
      fieldController.initialUnitPositions(isPlayerOffense);
    const playerUnits = await Promise.all(
      sortieUnits.player.map(async (unitData, index) => {
        const position = playerInitPositions[index];
        const unitController = await UnitController.create({
          unitId: unitData.id,
          cellSize,
          isOffense: isPlayerOffense,
          position,
        });
        this.layer.unit.addChild(unitController.container);
        return unitController;
      })
    );

    const enemyInitPositions = fieldController.initialUnitPositions(
      !isPlayerOffense
    );
    const enemyUnits = await Promise.all(
      sortieUnits.enemy.map(async (unitData, index) => {
        const position = enemyInitPositions[index];
        const unitController = await UnitController.create({
          unitId: unitData.id,
          cellSize,
          isOffense: !isPlayerOffense,
          position,
        });
        this.layer.unit.addChild(unitController.container);
        return unitController;
      })
    );

    const cursorController = new CursorController({ cellSize });
    this.layer.cursor.addChild(cursorController.graphic);

    container.x = this.app.screen.width / 2;
    container.pivot.x = container.width / 2;

    // let hoveredUnit: UnitController | undefined = undefined;
    fieldController.onHover(({ position, terrain }) => {
      cursorController.update(position);
      if (this.state.type === "map") {
        this.state.hoveredUnit = playerUnits
          .concat(enemyUnits)
          .find(
            (unitModel) =>
              unitModel.state.x === position.x &&
              unitModel.state.y === position.y
          );
        if (this.state.hoveredUnit) {
          onHoverUnit(this.state.hoveredUnit);
        }
      }
      onHoverTerrain(terrain);
    });
    fieldController.component.onClick(() => {
      if (this.state.type === "map" && this.state.hoveredUnit) {
        rangeController.createRange({
          field: fieldController.data,
          unit: this.state.hoveredUnit,
          opponentUnits:
            isPlayerOffense === this.state.hoveredUnit.isOffense
              ? enemyUnits
              : playerUnits,
        });
        this.state = {
          type: "move",
          unit: this.state.hoveredUnit,
        };
      }
    });

    let frame = 0;
    this.app.ticker.add((time) => {
      frame += time.deltaTime;
      if (frame > 60) {
        frame -= 60;
      }
      cursorController.animate(frame);
      rangeController.animate(frame);
    });
  }
}
