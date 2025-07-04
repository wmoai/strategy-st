import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import { Battle } from "./pages/Battle.tsx";
import { Deck } from "./pages/Deck.tsx";
import { Top } from "./pages/Top.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/deck" element={<Deck />} />
        <Route path="/battle" element={<Battle />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
