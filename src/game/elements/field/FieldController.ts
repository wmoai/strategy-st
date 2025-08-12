import { fieldData, type FieldDatum } from "@/data/fieldData";

import { FieldComponent } from "./FieldComponent";
import { FieldLogic } from "./FieldLogic";

export class FieldController {
  readonly data: FieldDatum;
  readonly component: FieldComponent;
  readonly logic: FieldLogic;

  constructor({ data, cellSize }: { data: FieldDatum; cellSize: number }) {
    this.data = data;
    this.component = new FieldComponent({ data, cellSize });
    this.logic = new FieldLogic({ data });
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
}
