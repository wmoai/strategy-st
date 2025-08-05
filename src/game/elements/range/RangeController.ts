import type { FieldDatum } from "@/data/fieldData";

import { RangeComponent } from "./RangeComponent";
import { calculateRange } from "./RangeLogic";
import type { UnitController } from "../unit/UnitController";

export class RangeController {
  component: RangeComponent;

  constructor({ cellSize }: { cellSize: number }) {
    this.component = new RangeComponent({ cellSize });
  }

  get container() {
    return this.component.container;
  }

  createRange({
    field,
    unit,
    opponentUnits,
  }: {
    field: FieldDatum;
    unit: UnitController;
    opponentUnits: UnitController[];
  }) {
    const ranges = calculateRange({
      field,
      noEntries: opponentUnits.map((unit) => ({
        x: unit.state.x,
        y: unit.state.y,
      })),
      unit,
    });
    this.component.set({
      ranges,
      isHealer: unit.isHealer,
    });
  }

  animate(frame: number) {
    if (!this.component) {
      return;
    }
    this.component.container.alpha =
      0.8 + (Math.sin(frame * (Math.PI / 30)) + 1) / 10;
  }
}
