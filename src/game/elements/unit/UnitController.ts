import { findKlass } from "@/data/klassData";
import { findUnitDatum, type UnitDatum, type UnitId } from "@/data/unitData";

import { UnitComponent } from "./UnitComponent";
import type { Position } from "../field/FieldLogic";

export type UnitState = {
  x: number;
  y: number;
  isActed: boolean;
  currentHp: number;
};

export class UnitController {
  readonly data: UnitDatum;
  readonly isOffense: boolean;
  private component: UnitComponent;

  state: UnitState;

  private constructor({
    unitId,
    cellSize,
    isOffense,
    position,
  }: {
    unitId: UnitId;
    cellSize: number;
    isOffense: boolean;
    position: Position;
  }) {
    const data = findUnitDatum(unitId);
    if (!data) {
      throw new Error("invalid unitId");
    }
    this.data = data;
    this.isOffense = isOffense;
    this.state = {
      ...position,
      currentHp: data.hp,
      isActed: false,
    };
    this.component = new UnitComponent({ data, isOffense, cellSize });
  }

  static async create({
    unitId,
    cellSize,
    isOffense,
    position,
  }: {
    unitId: UnitId;
    cellSize: number;
    isOffense: boolean;
    position: Position;
  }) {
    await UnitComponent.loadUnitTextures();
    const instance = new UnitController({
      unitId,
      cellSize,
      isOffense,
      position,
    });
    instance.component.update(instance.state);
    return instance;
  }

  get container() {
    return this.component.container;
  }

  get isHealer() {
    const klass = findKlass(this.data.klass);
    return klass?.healer === 1;
  }
}
