import type { FieldData, Position } from "@/data/fieldData";
import { findKlass } from "@/data/klassData";
import type { UnitDatum } from "@/data/unitData";

import type { RangeCell } from "./RangeController";

type CalculatingCell = {
  position: Position;
  minimumStep: number;
  isConfirmed: boolean;
  prevPosition: Position | null;
};

export const calculateShortestPath = ({
  field,
  noEntries = [],
  unit,
  position,
  forceMove,
}: {
  field: FieldData;
  noEntries?: Position[];
  unit: UnitDatum;
  position: Position;
  forceMove?: number;
}) => {
  const klass = findKlass(unit.klass);
  if (!klass) {
    throw new Error("invalid unit data");
  }
  const move = forceMove ?? unit.move;

  const calculatingMap: CalculatingCell[][] = field.getTerrainRows.map(
    (row, y) => {
      return row.map((_, x) => {
        return {
          position: { x, y },
          minimumStep: position.x === x && position.y === y ? 0 : Infinity,
          isConfirmed: false,
          prevPosition: null,
        };
      });
    }
  );

  const result: RangeCell[][] = field.getTerrainRows.map((row, y) =>
    row.map((_, x) => ({
      position: { x, y },
      movable: false,
      actable: false,
      movablePrev: null,
      step: Infinity,
    }))
  );

  // ダイクストラ法
  const dijkstraAlgoLoop = () => {
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
    result[y][x] = {
      ...result[y][x],
      movable: true,
      movablePrev: minimumStepCell.prevPosition,
      step: minimumStepCell.minimumStep,
    };
    // set actable
    for (let range = unit.min_range; range <= unit.max_range; range++) {
      const angleUnit = 90 / range;
      for (let angle = 0; angle < 360; angle += angleUnit) {
        const rangeY = y + ((range * Math.sin(angle * (Math.PI / 180))) | 0);
        const rangeX = x + ((range * Math.cos(angle * (Math.PI / 180))) | 0);
        if (field.isActiveCell({ x: rangeX, y: rangeY })) {
          result[rangeY][rangeX].actable = true;
        }
      }
    }

    [
      { dy: -1, dx: 0 },
      { dy: 0, dx: 1 },
      { dy: 1, dx: 0 },
      { dy: 0, dx: -1 },
    ].forEach(({ dx, dy }) => {
      const forwardPos = {
        x: x + dx,
        y: y + dy,
      };
      const cell = calculatingMap[forwardPos.y][forwardPos.x];
      if (
        !field.isActiveCell(forwardPos) ||
        cell.isConfirmed ||
        noEntries.some(
          (pos) => pos.x === forwardPos.x && pos.y === forwardPos.y
        )
      ) {
        return;
      }
      const forwardTerrain = field.getTerrain(forwardPos);
      const newStep = minimumStepCell.minimumStep + forwardTerrain[klass.move];
      if (cell.minimumStep > newStep) {
        calculatingMap[forwardPos.y][forwardPos.x] = {
          ...cell,
          minimumStep: newStep,
          prevPosition: { y, x },
        };
      }
    });
    dijkstraAlgoLoop();
  };
  dijkstraAlgoLoop();
  return result;
};
