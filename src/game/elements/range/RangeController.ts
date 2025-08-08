import type { FieldDatum } from "@/data/fieldData";

import { RangeComponent } from "./RangeComponent";
import { calculateRange, type RangeCell } from "./RangeLogic";
import type { Position } from "../field/FieldLogic";
import type { UnitController } from "../unit/UnitController";

export class RangeController {
  component: RangeComponent;
  private rangeCells: RangeCell[][] | null = null;

  constructor({ cellSize }: { cellSize: number }) {
    this.component = new RangeComponent({ cellSize });
  }

  get container() {
    return this.component.container;
  }

  createMoveRange({
    field,
    unit,
    opponentUnits,
  }: {
    field: FieldDatum;
    unit: UnitController;
    opponentUnits: UnitController[];
  }) {
    this.rangeCells = calculateRange({
      field,
      noEntries: opponentUnits.map((unit) => ({
        x: unit.position.x,
        y: unit.position.y,
      })),
      unit: unit.data,
      position: unit.position,
    });
    this.component.set({
      rangeCells: this.rangeCells,
      isHealer: unit.isHealer,
    });
  }

  createActRange({
    field,
    unit,
    position,
  }: {
    field: FieldDatum;
    unit: UnitController;
    position: Position;
  }) {
    this.rangeCells = calculateRange({
      field,
      unit: unit.data,
      position,
      forceMove: 0,
    });
    this.component.set({
      rangeCells: this.rangeCells,
      isHealer: unit.isHealer,
    });
  }

  isMovable({ x, y }: Position) {
    return this.rangeCells
      ?.flat()
      .some(
        (rangeCell) =>
          rangeCell.position.x === x &&
          rangeCell.position.y === y &&
          rangeCell.movable
      );
  }

  isActable({ x, y }: Position) {
    return this.rangeCells
      ?.flat()
      .some(
        (rangeCell) =>
          rangeCell.position.x === x &&
          rangeCell.position.y === y &&
          rangeCell.actable
      );
  }

  routeTo(to: Position): Position[] {
    if (!this.rangeCells) {
      return [];
    }
    const result: Position[] = [];
    let currentPos = to;
    const flatRanges = this.rangeCells.flat();
    while (true) {
      const current = flatRanges.find(
        (item) =>
          item.position.x === currentPos.x && item.position.y === currentPos.y
      );
      if (!current || !current.movablePrev) {
        break;
      }
      result.push(current.position);
      currentPos = current.movablePrev;
    }
    result.reverse();
    return result;
  }

  removeRange() {
    this.rangeCells = null;
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
