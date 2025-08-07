import type { FieldDatum } from "@/data/fieldData";

import { RangeComponent } from "./RangeComponent";
import { calculateRange, type RangeCell } from "./RangeLogic";
import type { Position } from "../field/FieldLogic";
import type { UnitController } from "../unit/UnitController";

export class RangeController {
  component: RangeComponent;
  private ranges: RangeCell[][] | null = null;

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
    this.ranges = calculateRange({
      field,
      noEntries: opponentUnits.map((unit) => ({
        x: unit.state.x,
        y: unit.state.y,
      })),
      unit,
    });
    this.component.set({
      ranges: this.ranges,
      isHealer: unit.isHealer,
    });
  }

  isMovable({ x, y }: Position) {
    return this.ranges
      ?.flat()
      .some(
        (range) =>
          range.position.x === x && range.position.y === y && range.movable
      );
  }

  isActable({ x, y }: Position) {
    return this.ranges
      ?.flat()
      .some(
        (range) =>
          range.position.x === x && range.position.y === y && range.actable
      );
  }

  removeRange() {
    this.ranges = null;
    this.component.reset();
  }

  animate(frame: number) {
    if (!this.component) {
      return;
    }
    this.component.container.alpha =
      0.8 + (Math.sin(frame * (Math.PI / 30)) + 1) / 10;
  }
}
