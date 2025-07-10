import { useAtomValue } from "jotai";
import type { FC } from "react";

import { deckAtom } from "@/features/deck/deckAtom";

import { TopNavigation } from "../parts/TopNavigation";
import { UnitCardList } from "../parts/UnitCardList";

export const TopPage: FC = () => {
  const deck = useAtomValue(deckAtom);

  return (
    <>
      <header>
        <TopNavigation />
      </header>
      <main className="flex flex-col items-center justify-center gap-4 mt-10">
        <h1 className="text-3xl">YOUR DECK</h1>
        <UnitCardList units={deck} />
      </main>
    </>
  );
};
