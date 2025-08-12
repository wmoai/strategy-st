import { Application, Container, RenderLayer } from "pixi.js";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";

import type { Animation } from "../animation/Animation";
import { CursorController } from "../cursor/CursorController";
import { FieldComponent } from "../field/FieldComponent";
import { FieldController } from "../field/FieldController";
import type { Position } from "../field/FieldLogic";
import { RangeController } from "../range/RangeController";
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

const cellSize = 40;

export class Game {
  app = new Application();
  state: State = { type: "map" };
  isPlayerOffense = true;
  controllers: {
    field?: FieldController;
    range?: RangeController;
    playerUnits?: UnitController[];
    enemyUnits?: UnitController[];
    cursor?: CursorController;
  } = {};
  containers = {
    field: new Container(),
    range: new Container(),
    unit: new Container(),
    cursor: new Container(),
  };
  activeUnitLayer = new RenderLayer();
  animationQue: Array<Animation | (() => void)> = [];

  constructor() {
    this.app.stage.addChild(
      this.containers.field,
      this.containers.range,
      this.containers.unit,
      this.containers.cursor
    );
  }

  async run({
    canvas,
    canvasWrapper,
    isPlayerOffense,
    sortieUnits,
    onFocusUnit,
    onFocusTerrain,
  }: {
    canvas: HTMLCanvasElement;
    canvasWrapper: HTMLElement;
    isPlayerOffense: boolean;
    sortieUnits: {
      player: UnitDatum[];
      enemy: UnitDatum[];
    };
    onFocusUnit: (unitController: UnitController) => void;
    onFocusTerrain: (terrain: TerrainDatum) => void;
  }) {
    await FieldComponent.preload();
    await UnitComponent.preload();
    await this.app.init({
      canvas,
      resizeTo: canvasWrapper,
      backgroundColor: "#222",
    });
    this.isPlayerOffense = isPlayerOffense;

    const fieldController = FieldController.random({ cellSize });
    this.controllers.field = fieldController;
    this.containers.field.addChild(fieldController.container);

    this.controllers.range = new RangeController({ cellSize });
    this.containers.range.addChild(this.controllers.range.container);

    const playerInitPositions =
      fieldController.initialUnitPositions(isPlayerOffense);
    this.controllers.playerUnits = sortieUnits.player.map((unitData, index) => {
      const position = playerInitPositions[index];
      const unitController = new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: isPlayerOffense,
        position,
      });
      this.containers.unit.addChild(unitController.container);
      return unitController;
    });
    const enemyInitPositions = fieldController.initialUnitPositions(
      !isPlayerOffense
    );
    this.controllers.enemyUnits = sortieUnits.enemy.map((unitData, index) => {
      const position = enemyInitPositions[index];
      const unitController = new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: !isPlayerOffense,
        position,
      });
      this.containers.unit.addChild(unitController.container);
      return unitController;
    });
    this.containers.unit.addChild(this.activeUnitLayer);
    this.controllers.cursor = new CursorController({ cellSize });
    this.controllers.cursor.setPosition({ x: 1, y: 1 });
    this.containers.cursor.addChild(this.controllers.cursor.graphic);

    this.app.stage.x = this.app.screen.width / 2;
    this.app.stage.pivot.x = this.app.stage.width / 2;

    this.controllers.field?.onHover(({ position, terrain }) =>
      this.moveCursor({ position, terrain, onFocusUnit, onFocusTerrain })
    );
    this.controllers.field?.component.onClick(() => this.selectCell());
    this.setTicker();
  }

  private setTicker() {
    let frame = 0;
    this.app.ticker.add((time) => {
      frame += time.deltaTime;
      if (frame > 60) {
        frame -= 60;
      }
      this.controllers.cursor?.animate(frame);
      this.controllers.range?.animate(frame);

      if (this.animationQue.length > 0) {
        const animation = this.animationQue[0];
        if (typeof animation === "function") {
          animation();
          this.animationQue.shift();
        } else {
          animation.update(time.deltaTime);
          if (animation.isFinished()) {
            this.animationQue.shift();
          }
        }
      }
    });
  }

  get canOperate() {
    return this.animationQue.length === 0;
  }

  private findUnitFromPosition({ x, y }: Position) {
    return this.controllers.playerUnits
      ?.concat(this.controllers.enemyUnits ?? [])
      .find((unit) => unit.position.x === x && unit.position.y === y);
  }

  private moveCursor({
    position,
    terrain,
    onFocusUnit,
    onFocusTerrain,
  }: {
    position: Position;
    terrain: TerrainDatum;
    onFocusUnit: (unitController: UnitController) => void;
    onFocusTerrain: (terrain: TerrainDatum) => void;
  }) {
    this.controllers.cursor?.setPosition(position);
    onFocusTerrain(terrain);
    switch (this.state.type) {
      case "map": {
        const hoveredUnit = this.findUnitFromPosition(position);
        this.state.hoveredUnit = hoveredUnit;
        if (hoveredUnit) {
          onFocusUnit(hoveredUnit);
        }
        break;
      }
      case "focus": {
        const hoveredUnit = this.findUnitFromPosition(position);
        this.state.hoveredUnit = hoveredUnit;
        onFocusUnit(hoveredUnit ?? this.state.focusedUnit);
        break;
      }
    }
  }

  private selectCell() {
    if (!this.canOperate) {
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
        const { range: rangeController } = this.controllers;
        const position = this.controllers.cursor?.position;
        if (!rangeController || !position) {
          return;
        }
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
        if (this.isMyUnit(focusedUnit) && rangeController.isMovable(position)) {
          // 移動
          this.moveUnit({ unit: focusedUnit, position });
          return;
        } else {
          // フォーカス解除
          rangeController.removeRange();
          this.state = {
            type: "map",
            hoveredUnit: this.state.hoveredUnit,
          };
          return;
        }
      }
      case "act": {
        const { cursor, range } = this.controllers;
        if (!cursor || !range) {
          return;
        }
        const position = cursor.position;
        if (range.isActable(position) && this.state.target) {
          // 行動確定
        } else if (range.isMovable(position)) {
          // 待機
          this.controllers.range?.removeRange();
          this.state.unit.standBy(this.state.position);
          this.state = {
            type: "map",
          };
        } else {
          // 移動キャンセル
          range.removeRange();
          this.state.unit.reset();
          this.state = {
            type: "map",
          };
        }
      }
    }
  }

  private focusUnit({ unit }: { unit: UnitController }) {
    const fieldData = this.controllers.field?.data;
    if (!fieldData) {
      return;
    }

    this.controllers.range?.createMoveRange({
      field: fieldData,
      unit,
      opponentUnits:
        (this.isPlayerOffense === unit.isOffense
          ? this.controllers.enemyUnits
          : this.controllers.playerUnits) ?? [],
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
    const route = this.controllers.range?.routeTo(position);
    if (!route) {
      return;
    }
    this.activeUnitLayer.attach(unit.container);
    this.animationQue = this.animationQue.concat(
      unit.component.moveAnimations(route),
      () => {
        this.activeUnitLayer.detach(unit.container);
        this.prepareAct({ unit, position });
      }
    );
    this.controllers.range?.removeRange();
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
    const fieldData = this.controllers.field?.data;
    if (!fieldData) {
      return;
    }
    this.controllers.range?.createActRange({
      field: fieldData,
      unit,
      position,
    });
  }

  isMyUnit(unit: UnitController) {
    return this.isPlayerOffense === unit.isOffense;
  }
}
