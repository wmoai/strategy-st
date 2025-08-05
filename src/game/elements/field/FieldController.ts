import { fieldData, type FieldDatum } from "@/data/fieldData";
import { terrainDataMap, type TerrainDatum } from "@/data/terrainData";

import { FieldComponent } from "./FieldComponent";
import { FieldLogic, type Position } from "./FieldLogic";

export class FieldController {
  readonly data: FieldDatum;
  readonly component: FieldComponent;
  private readonly logic: FieldLogic;

  private state: {
    hoveredPosition: Position | null;
  };

  constructor({ data, cellSize }: { data: FieldDatum; cellSize: number }) {
    this.data = data;
    this.component = new FieldComponent({ data, cellSize });
    this.logic = new FieldLogic({ data });
    this.state = {
      hoveredPosition: null,
    };
    this.component.setSprites();
  }

  static random({ cellSize }: { cellSize: number }) {
    const fieldDatum = fieldData[Math.floor(Math.random() * fieldData.length)];
    return new FieldController({ data: fieldDatum, cellSize });
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
    this.component.onHover(({ position }) => {
      if (!this.logic.isActiveCell(position)) {
        return;
      }
      if (
        position.x !== this.state.hoveredPosition?.x ||
        position.y !== this.state.hoveredPosition.y
      ) {
        callback({
          position,
          terrain: terrainDataMap[this.logic.terrainId(position)],
        });
      }
      this.state.hoveredPosition = position;
    });
  }
}
