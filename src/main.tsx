import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import { BattlePage } from "./components/pages/BattlePage";
import { DeckPage } from "./components/pages/DeckPage";
import { TopPage } from "./components/pages/TopPage";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/deck" element={<DeckPage />} />
        <Route path="/battle" element={<BattlePage />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
