import { atom } from "jotai";

import type { TerrainDatum } from "@/data/terrainData";
import type { UnitDatum } from "@/data/unitData";
import type { UnitController } from "@/game/elements/unit/UnitController";

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

export const focusedUnitAtom = atom<UnitController | undefined>();
export const focusedTerrainAtom = atom<TerrainDatum | undefined>();
