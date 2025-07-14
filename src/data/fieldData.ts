import muhiJson from "./json/field/muhi.json";
import persianJson from "./json/field/persian.json";
import sekiJson from "./json/field/seki.json";
import type { TerrainId } from "./terrainData";

type FieldId = number & { readonly __brand: unique symbol };
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

const parseJson = (json: typeof muhiJson): FieldDatum => ({
  ...json,
  id: json.id as FieldId,
  terrain: json.terrain as TerrainId[],
  info: {
    oinit: json.info.oinit as CellId[],
    dinit: json.info.oinit as CellId[],
    base: json.info.oinit as CellId[],
    turn: json.info.turn,
  },
});

export const fieldData: FieldDatum[] = [
  parseJson(muhiJson),
  parseJson(persianJson),
  parseJson(sekiJson),
];

export const findFieldDatum = (id: number) =>
  fieldData.find((field) => field.id === id);
