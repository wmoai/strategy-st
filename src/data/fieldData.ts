import muhiJson from "./json/field/muhi.json";
import persianJson from "./json/field/persian.json";
import sekiJson from "./json/field/seki.json";
import type { TerrainId } from "./terrainData";

export type FieldId = number & { readonly __brand: unique symbol };
export type CellId = number & { readonly __brand: unique symbol };

export type FieldDatum = {
  id: FieldId;
  width: number;
  height: number;
  terrain: TerrainId[];
  info: {
    oinit: CellId[];
    dinit: CellId[];
    base: CellId[];
    turn: number[];
  };
};

const parseJson = (json: unknown): FieldDatum => json as FieldDatum;

export const fieldData: FieldDatum[] = [
  parseJson(muhiJson),
  parseJson(persianJson),
  parseJson(sekiJson),
];

export const findFieldDatum = (id: number) =>
  fieldData.find((field) => field.id === id);
