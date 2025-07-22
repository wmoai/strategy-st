import { useAtomValue } from "jotai";
import { type FC } from "react";

import { battleStepAtom } from "@/features/battle/battleAtom";

import { Battle } from "./Battle";
import { Sortie } from "./Sortie";

export const BattlePage: FC = () => {
  const battleStep = useAtomValue(battleStepAtom);

  return battleStep === "sortie" ? <Sortie /> : <Battle />;
};
