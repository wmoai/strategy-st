import { Application, Container } from "pixi.js";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";

import { CursorController } from "./elements/cursor/CursorController";
import { FieldController } from "./elements/field/FieldController";
import { calculateRange } from "./elements/range/RangeLogic";
import { UnitController } from "./elements/unit/UnitController";

export default async ({
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
}) => {
  const app = new Application();
  await app.init({
    canvas,
    width,
    height,
    backgroundColor: "#222",
  });

  const cellSize = 40;
  const fieldController = await FieldController.random({ cellSize });

  const container = new Container();
  app.stage.addChild(container);

  container.addChild(fieldController.container);

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
      container.addChild(unitController.container);
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
      container.addChild(unitController.container);
      return unitController;
    })
  );

  const cursorController = new CursorController({ cellSize });
  container.addChild(cursorController.graphic);

  container.x = app.screen.width / 2;
  container.pivot.x = container.width / 2;

  let hoveredUnit: UnitController | undefined = undefined;
  fieldController.onHover(({ position, terrain }) => {
    cursorController.update(position);
    hoveredUnit = playerUnits
      .concat(enemyUnits)
      .find(
        (unitModel) =>
          unitModel.state.x === position.x && unitModel.state.y === position.y
      );
    if (hoveredUnit) {
      onHoverUnit(hoveredUnit);
    }
    onHoverTerrain(terrain);
  });
  fieldController.component.onClick(() => {
    if (hoveredUnit) {
      const opponentUnits =
        isPlayerOffense === hoveredUnit.isOffense ? enemyUnits : playerUnits;
      const ranges = calculateRange({
        field: fieldController.data,
        noEntries: opponentUnits.map((unit) => ({
          x: unit.state.x,
          y: unit.state.y,
        })),
        unit: hoveredUnit,
      });
      fieldController.component.renderRange({
        ranges,
        isHealer: hoveredUnit.isHealer,
      });
    }
  });

  let frame = 0;
  app.ticker.add((time) => {
    frame += time.deltaTime;
    if (frame > 60) {
      frame -= 60;
    }
    cursorController.animate(frame);
    fieldController.animate(frame);
  });
};
