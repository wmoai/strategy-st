import { atom } from "jotai";

import { getRandomDeck } from "./deckLogic";

export const deckAtom = atom(getRandomDeck());
