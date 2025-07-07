import { atom } from "jotai";

import {
  getRandomDeck,
  loadDeckFromStorage,
  saveDeckToStorage,
} from "./deckLogic";

export const deckAtom = atom(() => {
  const savedDeck = loadDeckFromStorage();
  if (savedDeck) {
    return savedDeck;
  }
  const newDeck = getRandomDeck();
  saveDeckToStorage(newDeck);
  return newDeck;
});
