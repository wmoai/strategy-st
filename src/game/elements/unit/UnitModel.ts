import { findUnitDatum, type UnitDatum, type UnitId } from "@/data/unitData";

import { UnitComponent } from "./UnitComponent";

export type UnitState = {
  isActed: boolean;
  currentHp: number;
};

type ConstructorParams = {
  unitId: UnitId;
  cellSize: number;
  isOffense: boolean;
};

export class UnitModel {
  private readonly data: UnitDatum;
  readonly cellSize: number;
  readonly isOffense: boolean;
  state: UnitState;
  component!: UnitComponent;

  private constructor({ unitId, cellSize, isOffense }: ConstructorParams) {
    const data = findUnitDatum(unitId);
    if (!data) {
      throw new Error("invalid unitId");
    }
    this.data = data;
    this.cellSize = cellSize;
    this.isOffense = isOffense;
    this.state = {
      isActed: false,
      currentHp: data.hp,
    };
  }

  static async create(args: ConstructorParams) {
    const model = new UnitModel(args);
    model.component = await UnitComponent.create(args);
    model.component.update(model.state);
    return model;
  }
}
