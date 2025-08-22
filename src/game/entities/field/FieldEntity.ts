import { Container } from "pixi.js";

import { FieldData, type Position } from "@/data/fieldData";

import { TerrainSpriteSheet } from "./terrainSpriteSheet";
import { cellSize } from "../../constants";

export class FieldEntity {
  readonly data: FieldData;
  container: Container;

  constructor({ fieldData }: { fieldData: FieldData }) {
    this.data = fieldData;
    this.container = TerrainSpriteSheet.createFieldContainer(fieldData);
    this.container.eventMode = "static";
  }

  static randomField() {
    const fieldData = FieldData.random();
    return new FieldEntity({ fieldData });
  }

  initialUnitPositions(isOffense: boolean) {
    return isOffense
      ? this.data.getOffenseInitialPositions
      : this.data.getDefenseInitialPositions;
  }

  onHover(callback: (args: { position: Position }) => void) {
    this.container.on("globalpointermove", (e) => {
      const localPos = e.getLocalPosition(this.container);
      const actualPos = {
        x: Math.floor(localPos.x / cellSize),
        y: Math.floor(localPos.y / cellSize),
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
