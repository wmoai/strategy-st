import { Container, Graphics } from "pixi.js";

import type { RangeCell } from "./RangeLogic";

export class RangeComponent {
  private readonly cellSize: number;
  container = new Container();
  private innerContainer = new Container();

  constructor({ cellSize }: { cellSize: number }) {
    this.cellSize = cellSize;
  }

  set({
    rangeCells,
    isHealer,
  }: {
    rangeCells: RangeCell[][];
    isHealer: boolean;
  }) {
    this.reset();
    rangeCells.forEach((row, y) =>
      row.forEach((rangeCell, x) => {
        if (rangeCell.movable || rangeCell.actable) {
          const color = rangeCell.movable
            ? 0x98fb98
            : isHealer
            ? 0x87ceeb
            : 0xffd700;
          const highlight = new Graphics()
            .rect(
              x * this.cellSize,
              y * this.cellSize,
              this.cellSize,
              this.cellSize
            )
            .fill({ color, alpha: 0.65 })
            .stroke({ color });
          this.innerContainer.addChild(highlight);
        }
      })
    );
    this.innerContainer.cacheAsTexture(true);
    this.container.addChild(this.innerContainer);
  }

  reset() {
    this.innerContainer.destroy();
    this.innerContainer = new Container();
  }
}
