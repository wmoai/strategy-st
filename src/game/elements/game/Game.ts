import { Application } from "pixi.js";

import type { TerrainData } from "@/data/terrainData";
import type { UnitData } from "@/data/unitData";

import { GameEnv } from "./GameEnv";
import { FieldComponent } from "../field/FieldComponent";
import { UnitComponent } from "../unit/UnitComponent";
import { UnitController } from "../unit/UnitController";

type Constructor = {
  isPlayerOffense: boolean;
  sortieUnits: {
    player: UnitData[];
    enemy: UnitData[];
  };
  onFocusUnit: (unitController: UnitController) => void;
  onFocusTerrain: (terrain: TerrainData) => void;
};

export class Game {
  app = new Application();
  env: GameEnv;

  private constructor({
    isPlayerOffense,
    sortieUnits,
    onFocusUnit,
    onFocusTerrain,
  }: Constructor) {
    this.env = new GameEnv({
      isPlayerOffense,
      sortieUnits,
      handlers: {
        onFocusUnit,
        onFocusTerrain,
      },
    });
  }

  static async create(args: Constructor) {
    await FieldComponent.preload();
    await UnitComponent.preload();
    return new Game(args);
  }

  async run({
    canvas,
    canvasWrapper,
  }: {
    canvas: HTMLCanvasElement;
    canvasWrapper: HTMLElement;
  }) {
    await this.app.init({
      canvas,
      resizeTo: canvasWrapper,
      backgroundColor: "#222",
    });

    this.app.stage.addChild(
      this.env.controllers.field.container,
      this.env.controllers.range.container,
      ...this.env.controllers.playerUnits.map((unit) => unit.container),
      ...this.env.controllers.enemyUnits.map((unit) => unit.container),
      this.env.controllers.cursor.graphic,
      this.env.layer.activeUnit
    );

    this.app.stage.x = this.app.screen.width / 2;
    this.app.stage.pivot.x = this.app.stage.width / 2;

    this.setTicker();
  }

  private setTicker() {
    let frame = 0;
    this.app.ticker.add((time) => {
      frame += time.deltaTime;
      if (frame > 60) {
        frame -= 60;
      }
      this.env.controllers.cursor.animate(frame);
      this.env.controllers.range.animate(frame);

      this.env.animate(time.deltaTime);
    });
  }
}
