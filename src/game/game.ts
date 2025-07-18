import { Application, Container } from "pixi.js";

import type { UnitDatum, UnitId } from "@/data/unitData";

import { FieldModel } from "./elements/field/FieldModel";
import { UnitModel } from "./elements/unit/UnitModel";

export const runGame = async ({
  canvas,
  width,
  height,
  isPlayerOffense,
  sortie,
}: {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  isPlayerOffense: boolean;
  sortie: {
    player: UnitDatum[];
    enemy: UnitDatum[];
  };
}) => {
  const app = new Application();
  await app.init({
    canvas,
    width,
    height,
    backgroundColor: "#222",
  });

  const cellSize = 40;
  const field = await FieldModel.createRandom({ cellSize });

  const container = new Container();
  app.stage.addChild(container);

  container.addChild(field.component.container);

  const playerInitPos = isPlayerOffense
    ? field.offenseInitPositions
    : field.defenseInitPositions;
  const playerUnitModels = await Promise.all(
    sortie.player.map(async (unitData, index) => {
      const position = playerInitPos[index];
      const unitModel = await UnitModel.create({
        unitId: unitData.id,
        cellSize,
        isOffense: isPlayerOffense,
        position,
      });
      container.addChild(unitModel.component.container);
      return unitModel;
    })
  );

  const enemyInitPos = isPlayerOffense
    ? field.defenseInitPositions
    : field.offenseInitPositions;
  const enemyUnitModels = await Promise.all(
    sortie.enemy.map(async (unitData, index) => {
      const position = enemyInitPos[index];
      const unitModel = await UnitModel.create({
        unitId: unitData.id,
        cellSize,
        isOffense: !isPlayerOffense,
        position,
      });
      container.addChild(unitModel.component.container);
      return unitModel;
    })
  );

  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    // container.rotation -= 0.01 * time.deltaTime;
  });
};
