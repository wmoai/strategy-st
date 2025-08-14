import json from "./json/unit.json";
import type { KlassId } from "./klassData";

export type UnitId = number & { readonly __brand: unique symbol };

export type UnitData = {
  id: UnitId;
  name: string;
  hp: number;
  str: number;
  dff: number;
  fth: number;
  skl: number;
  move: number;
  min_range: number;
  max_range: number;
  cost: number;
  klass: KlassId;
};

export const units: UnitData[] = json.map((item) => item as UnitData);

export const findUnitData = (id: UnitId) =>
  units.find((unit) => unit.id === id);
