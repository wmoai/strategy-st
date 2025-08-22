import { Container, Graphics } from "pixi.js";

import { cellSize } from "@/game/constants";

import type { RangeCell } from "./types";

export class RangeComponent {
  container: Container;

  constructor({
    rangeCells,
    isHealer,
  }: {
    rangeCells: RangeCell[][];
    isHealer: boolean;
  }) {
    this.container = new Container();

    rangeCells.forEach((row, y) =>
      row.forEach((rangeCell, x) => {
        if (rangeCell.movable || rangeCell.actable) {
          const color = rangeCell.movable
            ? 0x98fb98
            : isHealer
            ? 0x87ceeb
            : 0xffd700;
          const highlight = new Graphics()
            .rect(x * cellSize, y * cellSize, cellSize, cellSize)
            .fill({ color, alpha: 0.65 })
            .stroke({ color });
          this.container.addChild(highlight);
        }
      })
    );
    this.container.cacheAsTexture(true);
  }
}
