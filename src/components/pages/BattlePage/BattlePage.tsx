import { useState, type FC } from "react";

import { Sortie } from "./Sortie";

export const BattlePage: FC = () => {
  const [step] = useState<"sortie" | "battle">("sortie");

  return step === "sortie" ? <Sortie onReady={() => {}} /> : <div>battle</div>;
};
