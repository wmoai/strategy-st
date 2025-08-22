import { Application } from "pixi.js";

import type { TerrainData } from "@/data/terrainData";
import type { UnitData } from "@/data/unitData";

import type { UnitEntity } from "../entities/unit/UnitEntity";
import { BattleFieldScene } from "../scenes/battleFieldScene/BattleFieldScene";
import type { ActionPrediction } from "../scenes/battleFieldScene/types";
import { AssetLoader } from "../utils/AssetLoader";

type Handlers = {
  onFocusUnit: (unitController: UnitEntity) => void;
  onFocusTerrain: (terrain: TerrainData) => void;
  onPredictAct: (args?: {
    from: ActionPrediction;
    to: ActionPrediction;
  }) => void;
};

type Constructor = {
  isPlayerOffense: boolean;
  sortieUnits: {
    player: UnitData[];
    enemy: UnitData[];
  };
  handlers: Handlers;
};

export class Game {
  private readonly app = new Application();
  readonly handlers: Handlers;
  scene: BattleFieldScene;

  private constructor({ isPlayerOffense, sortieUnits, handlers }: Constructor) {
    this.handlers = handlers;
    this.scene = new BattleFieldScene({
      game: this,
      isPlayerOffense,
      sortieUnits,
    });
    this.app.stage = this.scene.container;
    this.app.stage.pivot.x = this.app.stage.width / 2;
  }

  static async create(args: Constructor) {
    await AssetLoader.loadInitialAssets();
    return new Game(args);
  }

  async start({
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
    this.app.stage.x = this.app.screen.width / 2;
    this.setAnimationTicker();
  }

  private setAnimationTicker() {
    let frame = 0;
    this.app.ticker.add((time) => {
      frame += time.deltaTime;
      if (frame > 60) {
        frame -= 60;
      }
      this.scene.animate({ deltaTime: time.deltaTime, frame });
    });
  }
}
