import { type FC } from "react";

import { DeckPage } from "@/components/pages/DeckPage";
import { TopNavigation } from "@/components/parts/TopNavigation";
import { UnitCardList } from "@/components/parts/UnitCardList";
import { units } from "@/data/units";
import { useDeck } from "@/features/deck/useDeck";

export const Deck: FC = () => {
  const { deck, isDeckEdited, addUnit, removeUnit, saveDeck } = useDeck();
  return (
    <DeckPage
      navigation={<TopNavigation />}
      deckList={
        <UnitCardList
          units={deck}
          onClickUnit={(_, index) => removeUnit(index)}
        />
      }
      poolList={
        <UnitCardList units={units} onClickUnit={(unit) => addUnit(unit)} />
      }
      deckNum={deck.length}
      isDeckEdited={isDeckEdited}
      onSave={saveDeck}
    />
  );
};
