import { atom } from "jotai";

import type { UnitDatum } from "@/data/unitData";

type BattleAtom = {
  step: "sortie" | "battle";
  isOffense: boolean;
  sortie: {
    player: UnitDatum[];
    enemy: UnitDatum[];
  };
};

export const battleAtom = atom<BattleAtom>({
  step: "sortie",
  isOffense: true,
  sortie: {
    player: [],
    enemy: [],
  },
});
