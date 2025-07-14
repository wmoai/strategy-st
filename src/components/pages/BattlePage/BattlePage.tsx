import { useState, type FC } from "react";

import { Battle } from "./Battle";
import { Sortie } from "./Sortie";

export const BattlePage: FC = () => {
  const [step, setStep] = useState<"sortie" | "battle">("sortie");

  return step === "sortie" ? (
    <Sortie
      onReady={() => {
        setStep("battle");
      }}
    />
  ) : (
    <Battle />
  );
};
