import { useAtom } from "jotai";
import type { FC } from "react";
import { Link } from "react-router-dom";

import { deckAtom } from "@/features/deck/deckAtom";

export const Top: FC = () => {
  const [deck] = useAtom(deckAtom);
  return (
    <>
      <header>
        <nav className="flex items-center justify-center gap-3 mt-10">
          <Link to="/deck">DECK</Link>
          <Link to="/match">BATTLE</Link>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center gap-4 mt-10">
        <h1 className="text-4xl">YOUR DECK</h1>
        <ul className="grid grid-cols-[1fr_1fr_1fr] gap-2">
          {deck.map((unit) => (
            <li key={unit.id}>{unit.name}</li>
          ))}
        </ul>
      </main>
    </>
  );
};
