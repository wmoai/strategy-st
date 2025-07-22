import { atom } from "jotai";

import type { UnitDatum } from "@/data/unitData";

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

export const hoveredUnitAtom = atom<UnitDatum | undefined>();
export const hoveredTerrainAtom = atom<UnitDatum | undefined>();
