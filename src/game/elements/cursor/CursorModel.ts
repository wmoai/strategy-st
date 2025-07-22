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
      .moveTo(left, length)
      .lineTo(thickness, length)
      .moveTo(thickness, thickness)
      .lineTo(length, thickness)
      .moveTo(cellSize - length, thickness)
      .lineTo(cellSize - thickness, thickness)
      .moveTo(cellSize - thickness, length)
      .lineTo(cellSize, length)
      .moveTo(left, cellSize)
      .lineTo(length, cellSize)
      .moveTo(cellSize - length, cellSize)
      .lineTo(cellSize, cellSize)
      .stroke({ width: 2, color: 0x333333 })
      .rect(left, top, length, thickness)
      .rect(left, top, thickness, length)
      .rect(cellSize - length, top, length, thickness)
      .rect(cellSize - thickness, top, thickness, length)
      .rect(left, cellSize - length, thickness, length)
      .rect(left, cellSize - thickness, length, thickness)
      .rect(cellSize - thickness, cellSize - length, thickness, length)
      .rect(cellSize - length, cellSize - thickness, length, thickness)
      .fill(0xeeeeee);
    this.graphic.pivot.x = cellSize / 2;
    this.graphic.pivot.y = cellSize / 2;

    this.update({ x: 1, y: 1 });
  }

  update({ x, y }: Position) {
    this.graphic.x = x * this.cellSize + this.cellSize / 2;
    this.graphic.y = y * this.cellSize + this.cellSize / 2 - 1;
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
