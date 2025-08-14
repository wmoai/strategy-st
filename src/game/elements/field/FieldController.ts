import { FieldData } from "@/data/fieldData";

import { FieldComponent } from "./FieldComponent";

export class FieldController {
  readonly data: FieldData;
  readonly component: FieldComponent;

  constructor({ data, cellSize }: { data: FieldData; cellSize: number }) {
    this.data = data;
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
}
