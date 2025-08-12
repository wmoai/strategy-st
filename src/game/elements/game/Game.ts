import { Application, RenderLayer } from "pixi.js";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";

import { GameEnv } from "./GameEnv";
import type { Animation } from "../animation/Animation";
import { FieldComponent } from "../field/FieldComponent";
import type { Position } from "../field/FieldLogic";
import { UnitComponent } from "../unit/UnitComponent";
import { UnitController } from "../unit/UnitController";

type State =
  | {
      type: "map";
      hoveredUnit?: UnitController;
    }
  | {
      type: "focus";
      focusedUnit: UnitController;
      hoveredUnit?: UnitController;
    }
  | {
      type: "act";
      unit: UnitController;
      position: Position;
      target?: UnitController;
    };

type Constructor = {
  isPlayerOffense: boolean;
  sortieUnits: {
    player: UnitDatum[];
    enemy: UnitDatum[];
  };
  onFocusUnit: (unitController: UnitController) => void;
  onFocusTerrain: (terrain: TerrainDatum) => void;
};

export class Game {
  app = new Application();
  env: GameEnv;
  state: State = { type: "map" };
  isPlayerOffense: boolean;
  layer = {
    activeUnit: new RenderLayer(),
  };
  animationQue: Array<{
    animations: Animation[];
    onEnd?: () => void;
  }> = [];
  handlers: {
    onFocusUnit: (unitController: UnitController) => void;
    onFocusTerrain: (terrain: TerrainDatum) => void;
  };

  private constructor({
    isPlayerOffense,
    sortieUnits,
    onFocusUnit,
    onFocusTerrain,
  }: Constructor) {
    this.isPlayerOffense = isPlayerOffense;
    this.env = new GameEnv({ isPlayerOffense, sortieUnits });
    this.handlers = {
      onFocusUnit,
      onFocusTerrain,
    };
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
      this.env.field.container,
      this.env.range.container,
      ...this.env.playerUnits.map((unit) => unit.container),
      ...this.env.enemyUnits.map((unit) => unit.container),
      this.env.cursor.graphic,
      this.layer.activeUnit
    );
    this.moveCursor({ position: this.env.playerUnits[0].position });

    this.app.stage.x = this.app.screen.width / 2;
    this.app.stage.pivot.x = this.app.stage.width / 2;

    this.env.field.component.onHover(({ position }) =>
      this.moveCursor({ position })
    );
    this.env.field.component.onClick(() => this.selectCell());
    this.setTicker();
  }

  private setTicker() {
    let frame = 0;
    this.app.ticker.add((time) => {
      frame += time.deltaTime;
      if (frame > 60) {
        frame -= 60;
      }
      this.env.cursor.animate(frame);
      this.env.range.animate(frame);

      if (this.animationQue.length > 0) {
        const { animations, onEnd } = this.animationQue[0];
        const animation = animations[0];
        if (animation) {
          animation.update(time.deltaTime);
          if (animation.isFinished()) {
            animations.shift();
          }
        } else {
          onEnd?.();
          this.animationQue.shift();
        }
      }
    });
  }

  get isWaiting() {
    return this.animationQue.length > 0;
  }

  private findUnitFromPosition({ x, y }: Position) {
    return this.env.playerUnits
      .concat(this.env.enemyUnits)
      .find((unit) => unit.position.x === x && unit.position.y === y);
  }

  isMyUnit(unit: UnitController) {
    return this.isPlayerOffense === unit.isOffense;
  }

  private moveCursor({ position }: { position: Position }) {
    const terrain = this.env.field.logic.terrain(position);
    this.env.cursor.setPosition(position);
    this.handlers.onFocusTerrain(terrain);
    switch (this.state.type) {
      case "map": {
        const hoveredUnit = this.findUnitFromPosition(position);
        this.state.hoveredUnit = hoveredUnit;
        if (hoveredUnit) {
          this.handlers.onFocusUnit(hoveredUnit);
        }
        break;
      }
      case "focus": {
        const hoveredUnit = this.findUnitFromPosition(position);
        this.state.hoveredUnit = hoveredUnit;
        this.handlers.onFocusUnit(hoveredUnit ?? this.state.focusedUnit);
        break;
      }
    }
  }

  private selectCell() {
    if (this.isWaiting) {
      return;
    }
    switch (this.state.type) {
      case "map": {
        const unit = this.state.hoveredUnit;
        if (!unit || unit.isActed) {
          return;
        }
        this.focusUnit({ unit });
        return;
      }
      case "focus": {
        const position = this.env.cursor.position;
        const { focusedUnit, hoveredUnit } = this.state;
        if (
          hoveredUnit &&
          hoveredUnit !== focusedUnit &&
          !hoveredUnit.isActed
        ) {
          // フォーカス対称変更
          this.focusUnit({ unit: hoveredUnit });
          return;
        }
        if (this.isMyUnit(focusedUnit) && this.env.range.isMovable(position)) {
          // 移動
          this.moveUnit({ unit: focusedUnit, position });
          return;
        } else {
          // フォーカス解除
          this.env.range.removeRange();
          this.state = {
            type: "map",
            hoveredUnit: this.state.hoveredUnit,
          };
          return;
        }
      }
      case "act": {
        const position = this.env.cursor.position;
        if (this.env.range.isActable(position) && this.state.target) {
          // 行動確定
        } else if (this.env.range.isMovable(position)) {
          // 待機
          this.env.range.removeRange();
          this.state.unit.standBy(this.state.position);
          this.state = {
            type: "map",
          };
        } else {
          // 移動キャンセル
          this.env.range.removeRange();
          this.state.unit.reset();
          this.state = {
            type: "map",
          };
        }
      }
    }
  }

  private focusUnit({ unit }: { unit: UnitController }) {
    this.env.range.createMoveRange({
      field: this.env.field.data,
      unit,
      opponentUnits:
        this.isPlayerOffense === unit.isOffense
          ? this.env.enemyUnits
          : this.env.playerUnits,
    });
    this.state = {
      type: "focus",
      focusedUnit: unit,
    };
  }

  private moveUnit({
    unit,
    position,
  }: {
    unit: UnitController;
    position: Position;
  }) {
    const route = this.env.range.routeTo(position);
    this.layer.activeUnit.attach(unit.container);
    this.animationQue.push({
      animations: unit.component.moveAnimations(route),
      onEnd: () => {
        this.layer.activeUnit.detach(unit.container);
        this.prepareAct({ unit, position });
      },
    });
    this.env.range.removeRange();
  }

  private prepareAct({
    unit,
    position,
  }: {
    unit: UnitController;
    position: Position;
  }) {
    this.state = {
      type: "act",
      position,
      unit,
    };
    this.env.range.createActRange({
      field: this.env.field.data,
      unit,
      position,
    });
  }
}
