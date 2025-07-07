import { useAtom } from "jotai";
import type { FC } from "react";

import { TopNavigation } from "@/components/TopNavigation";
import { UnitCardList } from "@/components/UnitCardList";
import { deckAtom } from "@/features/deck/deckAtom";

export const Top: FC = () => {
  const [deck] = useAtom(deckAtom);

  return (
    <>
      <header>
        <TopNavigation />
      </header>
      <main className="flex flex-col items-center justify-center gap-4 mt-10">
        <h1 className="text-3xl">YOUR DECK</h1>
        <UnitCardList units={deck} row={3} />
      </main>
    </>
  );
};
