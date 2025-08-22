import { Application } from "pixi.js";

import type { TerrainData } from "@/data/terrainData";
import type { UnitData } from "@/data/unitData";

import { FieldComponent } from "../elements/field/FieldComponent";
import type { ActionPrediction } from "../elements/game/GameEnv";
import { BattleFieldScene } from "../elements/game/scenes/battleFieldScene/BattleFieldScene";
import { UnitComponent } from "../elements/unit/UnitComponent";
import type { UnitController } from "../elements/unit/UnitController";
import { AssetLoader } from "../utils/AssetLoader";

type Handlers = {
  onFocusUnit: (unitController: UnitController) => void;
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
  // private readonly env: GameEnv;
  readonly handlers: Handlers;
  scene: BattleFieldScene;

  private constructor({ isPlayerOffense, sortieUnits, handlers }: Constructor) {
    this.handlers = handlers;
    // this.env = new GameEnv({
    //   isPlayerOffense,
    //   sortieUnits,
    //   handlers,
    // });
    // this.app.stage.addChild(
    //   this.env.controllers.field.container,
    //   this.env.controllers.range.container,
    //   ...this.env.controllers.playerUnits.map((unit) => unit.container),
    //   ...this.env.controllers.enemyUnits.map((unit) => unit.container),
    //   this.env.controllers.cursor.graphic,
    //   this.env.layer.activeUnit
    // );
    this.scene = new BattleFieldScene({
      game: this,
      isPlayerOffense,
      sortieUnits,
    });
    this.app.stage.addChild(this.scene.container);
    this.app.stage.pivot.x = this.app.stage.width / 2;
  }

  static async create(args: Constructor) {
    // FIXME: delete ========
    await UnitComponent.preload();
    await FieldComponent.preload();
    // ======================
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
