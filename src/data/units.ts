import json from "./json/unit.json";

export type Unit = {
  name: string;
  id: number;
  hp: number;
  str: number;
  dff: number;
  fth: number;
  skl: number;
  move: number;
  min_range: number;
  max_range: number;
  cost: number;
  klass: number;
};

export const units: Unit[] = json;

export const findUnit = (id: number) => units.find((unit) => unit.id === id);
