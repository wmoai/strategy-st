import { Application, Container } from "pixi.js";

import type { UnitId } from "@/data/unitData";

import { FieldModel } from "./elements/field/FieldModel";
import { UnitModel } from "./elements/unit/UnitModel";

export const runGame = async ({
  canvas,
  width,
  height,
}: {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
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

  const unit = await UnitModel.create({
    unitId: 2 as UnitId,
    cellSize,
    isOffense: true,
  });
  container.addChild(unit.component.container);

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
