import { useAtomValue } from "jotai";
import type { FC } from "react";

import { TopPage } from "@/components/pages/TopPage";
import { TopNavigation } from "@/components/parts/TopNavigation";
import { UnitCardList } from "@/components/parts/UnitCardList";
import { deckAtom } from "@/features/deck/deckAtom";

export const Top: FC = () => {
  const deck = useAtomValue(deckAtom);

  return (
    <TopPage
      navigation={<TopNavigation />}
      deckList={<UnitCardList units={deck} />}
    />
  );
};
