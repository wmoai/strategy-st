import { fieldData, type FieldDatum } from "@/data/fieldData";
import { terrainDataMap, type TerrainDatum } from "@/data/terrainData";

import { FieldComponent } from "./FieldComponent";
import { FieldLogic, type Position } from "./FieldLogic";

export class FieldController {
  private readonly cellSize: number;
  private readonly component: FieldComponent;
  private readonly logic: FieldLogic;

  private hoveredPosition?: Position;

  private constructor({
    data,
    cellSize,
  }: {
    data: FieldDatum;
    cellSize: number;
  }) {
    this.cellSize = cellSize;
    this.component = new FieldComponent({ data });
    this.logic = new FieldLogic({ data });
  }

  static async random({ cellSize }: { cellSize: number }) {
    const fieldDatum = fieldData[Math.floor(Math.random() * fieldData.length)];
    const instance = new FieldController({ data: fieldDatum, cellSize });
    await instance.component.setSprites({ cellSize });
    return instance;
  }

  get container() {
    return this.component.container;
  }

  initialUnitPositions(isOffense: boolean) {
    return isOffense
      ? this.logic.offenseInitialPositions
      : this.logic.defenseInitialPositions;
  }

  onHover(
    callback: ({
      position,
      terrain,
    }: {
      position: Position;
      terrain: TerrainDatum;
    }) => void
  ) {
    const { container } = this.component;
    container.on("globalpointermove", (e) => {
      const localPos = e.getLocalPosition(container);
      const newHoveredPos = {
        x: Math.floor(localPos.x / this.cellSize),
        y: Math.floor(localPos.y / this.cellSize),
      };
      if (!this.logic.isActiveCell(newHoveredPos)) {
        return;
      }
      if (
        newHoveredPos.x !== this.hoveredPosition?.x ||
        newHoveredPos.y !== this.hoveredPosition.y
      ) {
        callback({
          position: newHoveredPos,
          terrain:
            terrainDataMap[
              this.logic.terrainId({ x: newHoveredPos.x, y: newHoveredPos.y })
            ],
        });
      }
      this.hoveredPosition = newHoveredPos;
    });
  }
}
