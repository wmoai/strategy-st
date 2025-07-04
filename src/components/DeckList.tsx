import { useAtom } from "jotai";
import type { FC } from "react";

import { deckAtom } from "@/features/deck/deckAtom";

import { UnitCard } from "./UnitCard";

export const DeckList: FC = () => {
  const [deck] = useAtom(deckAtom);

  return (
    <ul className="grid grid-cols-[1fr_1fr_1fr] gap-2">
      {deck.map((unit) => (
        <li key={unit.id}>
          <UnitCard unit={unit} />
        </li>
      ))}
    </ul>
  );
};
