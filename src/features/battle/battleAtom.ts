import { atom } from "jotai";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";
import type { UnitModel } from "@/game/elements/unit/UnitModel";

export const battleStepAtom = atom<"sortie" | "battle">("sortie");

export const sortieAtom = atom<{
  isOffense: boolean;
  units: {
    player: UnitDatum[];
    enemy: UnitDatum[];
  };
}>({
  isOffense: true,
  units: {
    player: [],
    enemy: [],
  },
});

export const hoveredUnitAtom = atom<UnitModel | undefined>();
export const hoveredTerrainAtom = atom<TerrainDatum | undefined>();
