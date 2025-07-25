import { Application, Container } from "pixi.js";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";

import { CursorModel } from "./elements/cursor/CursorModel";
import { FieldController } from "./elements/field/FieldController";
import { UnitModel } from "./elements/unit/UnitModel";

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
  onHoverUnit: (unitModel: UnitModel) => void;
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
  const playerUnitModels = await Promise.all(
    sortieUnits.player.map(async (unitData, index) => {
      const position = playerInitPos[index];
      const unitModel = await UnitModel.create({
        unitId: unitData.id,
        cellSize,
        isOffense: isPlayerOffense,
        position,
      });
      unitModel.addComponentToContainer(container);
      return unitModel;
    })
  );

  const enemyInitPos = fieldController.initialUnitPositions(!isPlayerOffense);
  const enemyUnitModels = await Promise.all(
    sortieUnits.enemy.map(async (unitData, index) => {
      const position = enemyInitPos[index];
      const unitModel = await UnitModel.create({
        unitId: unitData.id,
        cellSize,
        isOffense: !isPlayerOffense,
        position,
      });
      unitModel.addComponentToContainer(container);
      return unitModel;
    })
  );

  const cursorModel = new CursorModel({ cellSize });
  cursorModel.addComponentToContainer(container);

  container.x = app.screen.width / 2;
  // container.y = app.screen.height/ 2;
  container.pivot.x = container.width / 2;
  // container.pivot.y = container.height / 2;

  fieldController.onHover(({ position, terrain }) => {
    cursorModel.update(position);
    const hoveredUnitModel = playerUnitModels
      .concat(enemyUnitModels)
      .find(
        (unitModel) =>
          unitModel.state.x === position.x && unitModel.state.y === position.y
      );
    if (hoveredUnitModel) {
      onHoverUnit(hoveredUnitModel);
    }
    onHoverTerrain(terrain);
  });

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    // container.rotation -= 0.01 * time.deltaTime;
    cursorModel.animate(time.deltaTime);
  });
};
