import { useAtomValue } from "jotai";
import { type FC } from "react";

import { battleAtom } from "@/features/battle/battleAtom";

import { Battle } from "./Battle";
import { Sortie } from "./Sortie";

export const BattlePage: FC = () => {
  const { step } = useAtomValue(battleAtom);

  return step === "sortie" ? <Sortie /> : <Battle />;
};
