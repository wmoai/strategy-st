import { Application, Container } from "pixi.js";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";

import { CursorController } from "./elements/cursor/CursorController";
import { FieldController } from "./elements/field/FieldController";
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

  const playerInitPos = fieldController.initialUnitPositions(isPlayerOffense);
  const playerUnits = await Promise.all(
    sortieUnits.player.map(async (unitData, index) => {
      const position = playerInitPos[index];
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

  const enemyInitPos = fieldController.initialUnitPositions(!isPlayerOffense);
  const enemyUnits = await Promise.all(
    sortieUnits.enemy.map(async (unitData, index) => {
      const position = enemyInitPos[index];
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

  fieldController.onHover(({ position, terrain }) => {
    cursorController.update(position);
    const hoveredUnit = playerUnits
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

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    // container.rotation -= 0.01 * time.deltaTime;
    cursorController.animate(time.deltaTime);
  });
};
