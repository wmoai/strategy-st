import { atom } from "jotai";

import type { TerrainData } from "@/data/terrainData";
import type { UnitData } from "@/data/unitData";
import type { UnitEntity } from "@/game/entities/unit/UnitEntity";
import type { ActionPrediction } from "@/game/scenes/battleFieldScene/types";

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

export const focusedUnitAtom = atom<UnitEntity | undefined>();
export const focusedTerrainAtom = atom<TerrainData | undefined>();
export const actionPredictionAtom = atom<
  | {
      from: ActionPrediction;
      to: ActionPrediction;
    }
  | undefined
>();
