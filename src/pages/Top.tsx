import type { FC } from "react";
import { Link } from "react-router-dom";

import { DeckList } from "@/components/DeckList";

export const Top: FC = () => {
  return (
    <>
      <header>
        <nav className="flex items-center justify-center gap-3 mt-10">
          <Link to="/deck">DECK</Link>
          <Link to="/battle">BATTLE</Link>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center gap-4 mt-10">
        <h1 className="text-4xl">YOUR DECK</h1>
        <DeckList />
      </main>
    </>
  );
};
