import type { UnitDatum } from "@/data/unitData";

import { CursorController } from "../cursor/CursorController";
import { FieldController } from "../field/FieldController";
import { RangeController } from "../range/RangeController";
import { UnitController } from "../unit/UnitController";

export class GameEnv {
  field: FieldController;
  range: RangeController;
  playerUnits: UnitController[];
  enemyUnits: UnitController[];
  cursor: CursorController;

  constructor({
    isPlayerOffense,
    sortieUnits,
    cellSize,
  }: {
    isPlayerOffense: boolean;
    sortieUnits: {
      player: UnitDatum[];
      enemy: UnitDatum[];
    };
    cellSize: number;
  }) {
    this.field = FieldController.random({ cellSize });
    this.range = new RangeController({ cellSize });

    const playerInitPositions =
      this.field.initialUnitPositions(isPlayerOffense);
    this.playerUnits = sortieUnits.player.map((unitData, index) => {
      const position = playerInitPositions[index];
      const unitController = new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: isPlayerOffense,
        position,
      });
      return unitController;
    });
    const enemyInitPositions = this.field.initialUnitPositions(
      !isPlayerOffense
    );
    this.enemyUnits = sortieUnits.enemy.map((unitData, index) => {
      const position = enemyInitPositions[index];
      const unitController = new UnitController({
        unitId: unitData.id,
        cellSize,
        isOffense: !isPlayerOffense,
        position,
      });
      return unitController;
    });
    this.cursor = new CursorController({ cellSize });
    this.cursor.setPosition({ x: 1, y: 1 });
  }
}
