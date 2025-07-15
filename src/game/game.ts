import { Application, Container } from "pixi.js";

import { createFieldContainer } from "./components/terrain";
import { FieldModel } from "./models/FieldModel";

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
  app.init({
    canvas,
    width,
    height,
    backgroundColor: "#222",
  });

  const cellSize = 40;
  const field = FieldModel.random();

  const container = new Container();
  container.addChild(await createFieldContainer({ field, cellSize }));
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  app.stage.addChild(container);

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    // container.rotation -= 0.01 * time.deltaTime;
  });
};
