import { Container, Graphics } from "pixi.js";

import type { Position } from "../field/FieldModel";

export class CursorModel {
  private readonly cellSize: number;
  private readonly graphic: Graphics;
  private time: number = 0;

  constructor({ cellSize }: { cellSize: number }) {
    this.cellSize = cellSize;

    const left = 0;
    const top = 0;
    const length = cellSize / 3;
    const thickness = cellSize / 12;

    this.graphic = new Graphics()
      .rect(left, top, length, thickness)
      .rect(left, top, thickness, length)
      .rect(cellSize - length, top, length, thickness)
      .rect(cellSize - thickness, top, thickness, length)
      .rect(left, cellSize - length, thickness, length)
      .rect(left, cellSize - thickness, length, thickness)
      .rect(cellSize - thickness, cellSize - length, thickness, length)
      .rect(cellSize - length, cellSize - thickness, length, thickness)
      .fill(0xffffff);
    this.graphic.pivot.x = cellSize / 2;
    this.graphic.pivot.y = cellSize / 2;

    this.update({ x: 0, y: 0 });
  }

  update({ x, y }: Position) {
    this.graphic.x = x * this.cellSize + this.cellSize / 2;
    this.graphic.y = y * this.cellSize + this.cellSize / 2;
  }

  addComponentToContainer(container: Container) {
    container.addChild(this.graphic);
  }

  animate(deltaTime: number) {
    this.time += deltaTime;
    const totalLength = 64;
    const unit = totalLength / 16;
    if (this.time > totalLength) {
      this.time -= totalLength;
    }
    if (this.time < unit) {
      this.graphic.scale = 1.05;
    } else if (this.time < unit * 8) {
      this.graphic.scale = 1.1;
    } else if (this.time < unit * 9) {
      this.graphic.scale = 1.05;
    } else {
      this.graphic.scale = 1;
    }
  }
}
