import json from "./json/terrain.json";

export type TerrainId = number & { readonly _brand: unique symbol };

export type TerrainDatum = {
  id: TerrainId;
  name: string;
  avoid: number;
  foot: number;
  horse: number;
  hover: number;
  fly: number;
};

const data = json as TerrainDatum[];

export const terrainIds = data.map((terrain) => terrain.id);

export const terrainDataMap: Record<TerrainId, TerrainDatum> =
  Object.fromEntries(data.map((terrain) => [terrain.id, terrain]));
