import { atomWithDefault } from "jotai/utils";

import {
  getRandomDeck,
  loadDeckFromStorage,
  saveDeckToStorage,
} from "./deckLogic";

export const deckAtom = atomWithDefault(() => {
  const savedDeck = loadDeckFromStorage();
  if (savedDeck) {
    return savedDeck;
  }
  const newDeck = getRandomDeck();
  saveDeckToStorage(newDeck);
  return newDeck;
});
