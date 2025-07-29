import type { FieldDatum } from "@/data/fieldData";
import { findKlass } from "@/data/klassData";

import { FieldLogic, type Position } from "../field/FieldLogic";
import type { UnitController } from "../unit/UnitController";

export type RangeCell = {
  position: Position;
  movable: boolean;
  actable: boolean;
  movablePrev: Position | null;
};

export const calculateRange = ({
  field,
  noEntries,
  unit,
}: {
  field: FieldDatum;
  noEntries: Position[];
  unit: UnitController;
}) => {
  const klass = findKlass(unit.data.klass);
  if (!klass) {
    throw new Error("invalid unit data");
  }
  const { move } = unit.data;
  const fieldLogic = new FieldLogic({ data: field });

  const calculatingMap: CalculatingCell[][] = fieldLogic.terrainRows.map(
    (row, y) => {
      return row.map((_, x) => {
        return {
          position: { x, y },
          minimumStep: unit.state.x === x && unit.state.y === y ? 0 : Infinity,
          isConfirmed: false,
          prevPosition: null,
        };
      });
    }
  );

  const result: RangeCell[][] = fieldLogic.terrainRows.map((row, y) =>
    row.map((_, x) => ({
      position: { x, y },
      movable: false,
      actable: false,
      movablePrev: null,
    }))
  );

  const loop = () => {
    const minimumStepCell = calculatingMap.reduce((result, row) => {
      row.forEach((cell) => {
        if (cell.isConfirmed) {
          return;
        }
        if (!result || result.minimumStep > cell.minimumStep) {
          result = cell;
        }
      });
      return result;
    }, null as CalculatingCell | null);

    if (!minimumStepCell || minimumStepCell.minimumStep > move) {
      return;
    }
    const {
      position: { x, y },
    } = minimumStepCell;
    calculatingMap[y][x].isConfirmed = true;
    // set movable
    result[y][x].movable = true;
    result[y][x].movablePrev = minimumStepCell.prevPosition;
    // set actable
    for (
      let range = unit.data.min_range;
      range <= unit.data.max_range;
      range++
    ) {
      const angleUnit = 90 / range;
      for (let angle = 0; angle < 360; angle += angleUnit) {
        const rangeY = y + ((range * Math.sin(angle * (Math.PI / 180))) | 0);
        const rangeX = x + ((range * Math.cos(angle * (Math.PI / 180))) | 0);
        if (fieldLogic.isActiveCell({ x: rangeX, y: rangeY })) {
          result[rangeY][rangeX].actable = true;
        }
      }
    }

    [
      { y: -1, x: 0 },
      { y: 0, x: 1 },
      { y: 1, x: 0 },
      { y: 0, x: -1 },
    ].forEach((deltaPos) => {
      const forwardPos = {
        x: x + deltaPos.x,
        y: y + deltaPos.y,
      };
      const cell = calculatingMap[forwardPos.y][forwardPos.x];
      if (
        !fieldLogic.isActiveCell(forwardPos) ||
        cell.isConfirmed ||
        noEntries.some(
          (pos) => pos.x === forwardPos.x && pos.y === forwardPos.y
        )
      ) {
        return;
      }
      const forwardTerrain = fieldLogic.terrain(forwardPos);
      const newStep = minimumStepCell.minimumStep + forwardTerrain[klass.move];
      if (cell.minimumStep > newStep) {
        calculatingMap[forwardPos.y][forwardPos.x] = {
          ...cell,
          minimumStep: newStep,
          prevPosition: { y, x },
        };
      }
    });
    loop();
  };
  loop();
  return result;
};

type CalculatingCell = {
  position: Position;
  minimumStep: number;
  isConfirmed: boolean;
  prevPosition: Position | null;
};
