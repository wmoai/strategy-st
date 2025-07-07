import { useAtom } from "jotai";
import type { FC } from "react";

import { TopNavigation } from "@/components/TopNavigation";
import { UnitCardList } from "@/components/UnitCardList";
import { units } from "@/data/units";
import { deckAtom } from "@/features/deck/deckAtom";

export const Deck: FC = () => {
  const [deck] = useAtom(deckAtom);
  return (
    <div className="flex flex-col h-screen">
      <header>
        <TopNavigation />
      </header>
      <main className="grid grid-cols-2 mt-10 text-center overflow-hidden [&>section]:overflow-auto [&>section]:pb-20 [&_h2]:text-4xl [&_h2]:py-5">
        <section>
          <h2>YOUR DECK</h2>
          <div className="justify-self-center">
            <UnitCardList units={deck} row={3} />
          </div>
        </section>
        <section className="bg-gray-200">
          <h2 className="sticky top-0 bg-inherit">POOL</h2>
          <div className="justify-self-center">
            <UnitCardList units={units} row={3} />
          </div>
        </section>
      </main>
    </div>
  );
};
