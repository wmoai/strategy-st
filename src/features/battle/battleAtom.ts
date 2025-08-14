import { atom } from "jotai";

import type { TerrainData } from "@/data/terrainData";
import type { UnitData } from "@/data/unitData";
import type { UnitController } from "@/game/elements/unit/UnitController";

export const battleStepAtom = atom<"sortie" | "battle">("sortie");

export const sortieAtom = atom<{
  isOffense: boolean;
  units: {
    player: UnitData[];
    enemy: UnitData[];
  };
}>({
  isOffense: true,
  units: {
    player: [],
    enemy: [],
  },
});

export const focusedUnitAtom = atom<UnitController | undefined>();
export const focusedTerrainAtom = atom<TerrainData | undefined>();
