import { Application, Container } from "pixi.js";

import type { UnitDatum } from "@/data/unitData";

import { CursorModel } from "./elements/cursor/CursorModel";
import { FieldModel } from "./elements/field/FieldModel";
import { UnitModel } from "./elements/unit/UnitModel";

export default async ({
  canvas,
  width,
  height,
  isPlayerOffense,
  sortieUnits,
  onHoverUnit,
}: {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  isPlayerOffense: boolean;
  sortieUnits: {
    player: UnitDatum[];
    enemy: UnitDatum[];
  };
  onHoverUnit: (unit: UnitDatum) => void;
}) => {
  const app = new Application();
  await app.init({
    canvas,
    width,
    height,
    backgroundColor: "#222",
  });

  const cellSize = 40;
  const fieldModel = await FieldModel.createRandom({ cellSize });

  const container = new Container();
  app.stage.addChild(container);

  fieldModel.addComponentToContainer(container);

  const playerInitPos = isPlayerOffense
    ? fieldModel.offenseInitPositions
    : fieldModel.defenseInitPositions;
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

  const enemyInitPos = isPlayerOffense
    ? fieldModel.defenseInitPositions
    : fieldModel.offenseInitPositions;
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
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  fieldModel.onHover((pos) => {
    cursorModel.update(pos);
    const hoveredUnit = playerUnitModels
      .concat(enemyUnitModels)
      .find((unitModel) => {
        return unitModel.state.x === pos.x && unitModel.state.y === pos.y;
      });
    if (hoveredUnit) {
      onHoverUnit(hoveredUnit.data);
    }
  });

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    // container.rotation -= 0.01 * time.deltaTime;
    cursorModel.animate(time.deltaTime);
  });
};
