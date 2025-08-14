import json from "./json/terrain.json";

export type TerrainId = number & { readonly _brand: unique symbol };

export type TerrainData = {
  id: TerrainId;
  name: string;
  avoid: number;
  foot: number;
  horse: number;
  hover: number;
  fly: number;
};

const terrains = json as TerrainData[];

export const terrainIds = terrains.map((terrain) => terrain.id);

export const terrainDataMap: Record<TerrainId, TerrainData> =
  Object.fromEntries(terrains.map((terrain) => [terrain.id, terrain]));
