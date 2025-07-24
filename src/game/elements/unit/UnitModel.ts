import type { Container } from "pixi.js";

import { findUnitDatum, type UnitDatum, type UnitId } from "@/data/unitData";

import { UnitComponent } from "./UnitComponent";
import type { Position } from "../field/FieldModel";

export type UnitState = {
  x: number;
  y: number;
  isActed: boolean;
  currentHp: number;
};

export class UnitModel {
  readonly data: UnitDatum;
  readonly isOffense: boolean;
  state: UnitState;
  private component!: UnitComponent;

  private constructor({
    unitId,
    isOffense,
    position,
  }: {
    unitId: UnitId;
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
    const model = new UnitModel({ unitId, isOffense, position });
    model.component = await UnitComponent.create({
      unitId,
      cellSize,
      isOffense,
    });
    model.component.update(model.state);
    return model;
  }

  addComponentToContainer(container: Container) {
    container.addChild(this.component.container);
  }
}
