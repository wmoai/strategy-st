import type { FC } from "react";
import { Link } from "react-router-dom";

export const TopNavigation: FC = () => {
  return (
    <nav className="flex items-center justify-center gap-4 mt-10 text-2xl">
      <Link to="/">TOP</Link>
      <Link to="/deck">DECK</Link>
      <Link to="/battle">BATTLE</Link>
    </nav>
  );
};
