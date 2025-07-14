import { Application } from "pixi.js";

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
  });

  const field = FieldModel.random();
  app.stage.addChild(await createFieldContainer(field));

  /*
  const container = new Container();
  app.stage.addChild(container);

  const originalTexture = await Assets.load("/strategy/terrain.png");
  const tileSize = 40;
  const terrain = new Map<number, Texture[][]>();
  for (let i = 0; i < originalTexture.width / tileSize; i++) {
    const set = [];
    for (let j = 0; j < 5; j++) {
      const cell = [];
      for (let t = 0; t < 2; t++) {
        for (let l = 0; l < 2; l++) {
          const texture = new Texture({
            source: originalTexture,
            frame: new Rectangle(
              tileSize * i + (tileSize / 2) * l,
              tileSize * j + (tileSize / 2) * t,
              tileSize / 2,
              tileSize / 2
            ),
          });
          cell.push(texture);
        }
      }
      set.push(cell);
    }
    terrain.set(i + 1, set);
  }

  // Create a 5x5 grid of bunnies in the container
  for (let i = 0; i < 25; i++) {
    const bunny = new Sprite((terrain.get(2) as Texture[][])[0][0]);

    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }

  // Move the container to the center
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Center the bunny sprites in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  */

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    // container.rotation -= 0.01 * time.deltaTime;
  });
};
