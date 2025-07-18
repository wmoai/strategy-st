import { Container, Graphics } from "pixi.js";

import type { Position } from "../field/FieldModel";

export class CursorModel {
  private readonly cellSize: number;
  private readonly graphic: Graphics;

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
}
