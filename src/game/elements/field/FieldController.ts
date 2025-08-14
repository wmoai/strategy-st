import type { FederatedPointerEvent } from "pixi.js";

import { FieldData, type Position } from "@/data/fieldData";

import { FieldComponent } from "./FieldComponent";

export class FieldController {
  readonly data: FieldData;
  private readonly cellSize: number;
  private readonly component: FieldComponent;

  constructor({ data, cellSize }: { data: FieldData; cellSize: number }) {
    this.data = data;
    this.cellSize = cellSize;
    this.component = new FieldComponent({ data, cellSize });
    this.component.setSprites();
  }

  static random({ cellSize }: { cellSize: number }) {
    const fieldData = FieldData.random();
    return new FieldController({ data: fieldData, cellSize });
  }

  get container() {
    return this.component.container;
  }

  initialUnitPositions(isOffense: boolean) {
    return isOffense
      ? this.data.getOffenseInitialPositions
      : this.data.getDefenseInitialPositions;
  }

  onHover(callback: (args: { position: Position }) => void) {
    this.container.on("globalpointermove", (e: FederatedPointerEvent) => {
      const localPos = e.getLocalPosition(this.container);
      const actualPos = {
        x: Math.floor(localPos.x / this.cellSize),
        y: Math.floor(localPos.y / this.cellSize),
      };

      if (!this.data.isActiveCell(actualPos)) {
        return;
      }
      callback({ position: actualPos });
    });
  }

  onClick(callback: () => void) {
    this.container.on("click", callback);
  }
}
