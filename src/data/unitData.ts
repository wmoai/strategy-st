import json from "./json/unit.json";
import type { KlassId } from "./klassData";

export type UnitId = number & { readonly __brand: unique symbol };

export class UnitData {
  readonly id: UnitId;
  readonly name: string;
  readonly hp: number;
  readonly str: number;
  readonly dff: number;
  readonly fth: number;
  readonly skl: number;
  readonly move: number;
  readonly min_range: number;
  readonly max_range: number;
  readonly cost: number;
  readonly klass: KlassId;

  constructor(args: {
    id: number;
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
    klass: number;
  }) {
    this.id = args.id as UnitId;
    this.name = args.name;
    this.hp = args.hp;
    this.str = args.str;
    this.dff = args.dff;
    this.fth = args.fth;
    this.skl = args.skl;
    this.move = args.move;
    this.min_range = args.min_range;
    this.max_range = args.max_range;
    this.cost = args.cost;
    this.klass = args.klass as KlassId;
  }
}

export const units: UnitData[] = json.map((item) => new UnitData(item));

export const findUnitData = (id: UnitId) =>
  units.find((unit) => unit.id === id);
