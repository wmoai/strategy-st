import type { FieldData, Position } from "@/data/fieldData";
import { findKlass } from "@/data/klassData";
import type { UnitData } from "@/data/unitData";

import type { RangeCell } from "./types";

type CalculatingCell = {
  position: Position;
  minimumStep: number;
  isConfirmed: boolean;
  prevPosition: Position | null;
};

export const calculateShortestPath = ({
  fieldData,
  noEntries = [],
  unitData,
  position,
  forceMove,
}: {
  fieldData: FieldData;
  noEntries?: Position[];
  unitData: UnitData;
  position: Position;
  forceMove?: number;
}): RangeCell[][] => {
  const klass = findKlass(unitData.klass);
  if (!klass) {
    throw new Error("invalid unit data");
  }
  const move = forceMove ?? unitData.move;

  const calculatingMap: CalculatingCell[][] = fieldData.getTerrainRows.map(
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

  const result: RangeCell[][] = fieldData.getTerrainRows.map((row, y) =>
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
    const minimumStepCell = calculatingMap.reduce((result, row, y) => {
      row.forEach((cell, x) => {
        if (cell.isConfirmed || !fieldData.isActiveCell({ x, y })) {
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
    for (let range = unitData.min_range; range <= unitData.max_range; range++) {
      const angleUnit = 90 / range;
      for (let angle = 0; angle < 360; angle += angleUnit) {
        const rangeY = y + ((range * Math.sin(angle * (Math.PI / 180))) | 0);
        const rangeX = x + ((range * Math.cos(angle * (Math.PI / 180))) | 0);
        if (fieldData.isActiveCell({ x: rangeX, y: rangeY })) {
          result[rangeY][rangeX].actable = true;
        }
      }
    }

    if (fieldData.isActiveCell({ x, y })) {
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
          !fieldData.isActiveCell(forwardPos) ||
          cell.isConfirmed ||
          noEntries.some(
            (pos) => pos.x === forwardPos.x && pos.y === forwardPos.y
          )
        ) {
          return;
        }
        const forwardTerrain = fieldData.getTerrain(forwardPos);
        const newStep =
          minimumStepCell.minimumStep + forwardTerrain[klass.move];
        if (cell.minimumStep > newStep) {
          calculatingMap[forwardPos.y][forwardPos.x] = {
            ...cell,
            minimumStep: newStep,
            prevPosition: { y, x },
          };
        }
      });
    }
    dijkstraAlgoLoop();
  };
  dijkstraAlgoLoop();
  return result;
};
