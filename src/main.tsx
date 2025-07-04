import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import { Deck } from "./pages/Deck/Deck.tsx";
import { Match } from "./pages/Deck/Match/Match.tsx";
import { Top } from "./pages/Top/Top.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/deck" element={<Deck />} />
        <Route path="/match" element={<Match />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
