import { findUnitDatum, type UnitDatum, type UnitId } from "@/data/unitData";

import { UnitComponent } from "./UnitComponent";
import type { Position } from "../field/FieldModel";

export type UnitState = {
  x: number;
  y: number;
  isActed: boolean;
  currentHp: number;
};

type ConstructorParams = {
  unitId: UnitId;
  cellSize: number;
  isOffense: boolean;
  position: Position;
};

export class UnitModel {
  private readonly data: UnitDatum;
  readonly cellSize: number;
  readonly isOffense: boolean;
  state: UnitState;
  component!: UnitComponent;

  private constructor({
    unitId,
    cellSize,
    isOffense,
    position,
  }: ConstructorParams) {
    const data = findUnitDatum(unitId);
    if (!data) {
      throw new Error("invalid unitId");
    }
    this.data = data;
    this.cellSize = cellSize;
    this.isOffense = isOffense;
    this.state = {
      ...position,
      currentHp: data.hp,
      isActed: false,
    };
  }

  static async create(args: ConstructorParams) {
    const model = new UnitModel(args);
    model.component = await UnitComponent.create(args);
    model.component.update(model.state);
    return model;
  }
}
