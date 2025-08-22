import { atom } from "jotai";

import type { TerrainData } from "@/data/terrainData";
import type { UnitData } from "@/data/unitData";
import type { ActionPrediction } from "@/game/elements/game/GameEnv";
import { UnitController } from "@/game/elements/unit/UnitController";

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
export const actionPredictionAtom = atom<
  | {
      from: ActionPrediction;
      to: ActionPrediction;
    }
  | undefined
>();
