import { Graphics } from "pixi.js";

import type { Position } from "../field/FieldLogic";

export class CursorController {
  private readonly cellSize: number;
  private _position: Position = { x: 0, y: 0 };
  readonly graphic: Graphics;

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
      .stroke({ width: 2, color: 0x222222 })
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
  }

  get position() {
    return { ...this._position };
  }

  setPosition({ x, y }: Position) {
    this._position = { x, y };
    this.graphic.x = x * this.cellSize + this.cellSize / 2;
    this.graphic.y = y * this.cellSize + this.cellSize / 2 + 1;
  }

  animate(frame: number) {
    const totalFrame = 60;
    const note16 = totalFrame / 16;
    if (frame < note16) {
      this.graphic.scale = 1.1;
    } else if (frame < note16 * 8) {
      this.graphic.scale = 1.2;
    } else if (frame < note16 * 9) {
      this.graphic.scale = 1.1;
    } else {
      this.graphic.scale = 1;
    }
  }
}
