import { useAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";

import type { Unit } from "@/data/units";

import { deckAtom } from "./deckAtom";
import { saveDeckToStorage } from "./deckLogic";

export const DECK_SIZE = 12;

export const useDeck = () => {
  const [deck, setDeck] = useAtom(deckAtom);
  const [savedDeckIds, setSavedDeckIds] = useState<number[]>(
    deck.map((unit) => unit.id)
  );
  const isDeckEdited = useMemo(
    () =>
      deck.length !== savedDeckIds.length ||
      deck.some((unit, index) => unit.id !== savedDeckIds[index]),
    [deck, savedDeckIds]
  );

  const addUnit = useCallback(
    (unit: Unit) => {
      if (deck.length >= DECK_SIZE) {
        return;
      }
      setDeck([...deck, unit]);
    },
    [deck, setDeck]
  );

  const removeUnit = useCallback(
    (index: number) => {
      setDeck(deck.filter((_, _index) => _index !== index));
    },
    [deck, setDeck]
  );

  const saveDeck = useCallback(() => {
    saveDeckToStorage(deck);
    setSavedDeckIds(deck.map((unit) => unit.id));
  }, [deck]);

  return {
    deck,
    isDeckEdited,
    addUnit,
    removeUnit,
    saveDeck,
  };
};
