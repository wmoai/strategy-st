import { useAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";

import type { UnitDatum } from "@/data/unitData";

import { deckAtom } from "./deckAtom";
import { saveDeckToStorage } from "./deckLogic";

export const DECK_SIZE = 12;

export const useDeck = () => {
  const [deck, setDeck] = useAtom(deckAtom);
  const [temporaryDeck, setTemporaryDeck] = useState(deck);

  const isDeckChanged = useMemo(
    () =>
      deck.length !== temporaryDeck.length ||
      deck.some((unit, index) => unit.id !== temporaryDeck[index].id),
    [deck, temporaryDeck]
  );

  const addUnit = useCallback(
    (unit: UnitDatum) => {
      if (temporaryDeck.length >= DECK_SIZE) {
        return;
      }
      setTemporaryDeck([...temporaryDeck, unit]);
    },
    [temporaryDeck]
  );

  const removeUnit = useCallback(
    (index: number) => {
      setTemporaryDeck(temporaryDeck.filter((_, _index) => _index !== index));
    },
    [temporaryDeck]
  );

  const saveDeck = useCallback(() => {
    setDeck(temporaryDeck);
    saveDeckToStorage(temporaryDeck);
  }, [setDeck, temporaryDeck]);

  return {
    temporaryDeck,
    isDeckChanged,
    addUnit,
    removeUnit,
    saveDeck,
  };
};
