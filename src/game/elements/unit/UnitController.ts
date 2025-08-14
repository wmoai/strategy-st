import type { Position } from "@/data/fieldData";
import { findKlass } from "@/data/klassData";
import { findUnitDatum, type UnitDatum, type UnitId } from "@/data/unitData";

import { UnitComponent } from "./UnitComponent";

export type UnitState = {
  position: Position;
  isActed: boolean;
  currentHp: number;
};

export class UnitController {
  readonly data: UnitDatum;
  readonly isOffense: boolean;
  component: UnitComponent;
  private state: UnitState;

  constructor({
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
      position,
      currentHp: data.hp,
      isActed: false,
    };
    this.component = new UnitComponent({ data, isOffense, cellSize });
    this.updateComponent();
  }

  private updateComponent() {
    this.component.update(this.state);
  }

  get container() {
    return this.component.container;
  }

  get isHealer() {
    const klass = findKlass(this.data.klass);
    return klass?.healer === 1;
  }

  get position() {
    return this.state.position;
  }

  get currentHp() {
    return this.state.currentHp;
  }

  get isActed() {
    return this.state.isActed;
  }

  reset() {
    this.updateComponent();
  }

  standBy(position: Position) {
    this.state.position = position;
    this.state.isActed = true;
    this.updateComponent();
  }
}
