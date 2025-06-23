import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Top } from "./pages/Top/Top.tsx";
import { Deck } from "./pages/Deck/Deck.tsx";
import { Match } from "./pages/Deck/Match/Match.tsx";

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
