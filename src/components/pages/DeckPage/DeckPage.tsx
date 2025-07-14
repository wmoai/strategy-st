import { clsx } from "clsx";
import type { FC } from "react";
import { tv } from "tailwind-variants";

import { TopNavigation } from "@/components/parts/TopNavigation";
import { UnitCardList } from "@/components/parts/UnitCardList";
import { unitData } from "@/data/unitData";
import { DECK_SIZE, useDeck } from "@/features/deck/useDeck";

export const DeckPage: FC = () => {
  const { temporaryDeck, isDeckChanged, addUnit, removeUnit, saveDeck } =
    useDeck();
  const isDeckNumInvalid = temporaryDeck.length !== DECK_SIZE;

  return (
    <div className="flex flex-col h-screen">
      <header>
        <TopNavigation />
      </header>
      <main className="grid grid-cols-2 mt-10 text-center overflow-hidden">
        <section
          className={clsx(columnSectionTv({ side: "left" }), "bg-white")}
        >
          <header
            className={clsx(
              sectionHeaderTv(),
              "flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
            )}
          >
            <h2 className={sectionHeadingTv()}>YOUR DECK</h2>
            <div className="w-11 text-end">
              <span className={currentDeckNumTv({ invalid: isDeckNumInvalid })}>
                {temporaryDeck.length}
              </span>
              /{DECK_SIZE}
            </div>
            <button
              type="button"
              disabled={isDeckNumInvalid || !isDeckChanged}
              onClick={() => saveDeck()}
              className="cursor-pointer text-white bg-blue-500 rounded-lg px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SAVE
            </button>
          </header>
          <div className={listWrapperTv()}>
            <UnitCardList
              units={temporaryDeck}
              onClickUnit={(_, index) => removeUnit(index)}
            />
          </div>
        </section>
        <section
          className={clsx(columnSectionTv({ side: "right" }), "bg-gray-200")}
        >
          <header className={sectionHeaderTv()}>
            <h2 className={sectionHeadingTv()}>POOL</h2>
          </header>
          <div className={listWrapperTv()}>
            <UnitCardList
              units={unitData}
              onClickUnit={(unit) => addUnit(unit)}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

const columnSectionTv = tv({
  base: "overflow-auto pb-20",
  variants: {
    side: {
      left: "justify-self-end",
      right: "justify-self-start",
    },
  },
});
const sectionHeaderTv = tv({
  base: "sticky top-0 py-5 bg-inherit",
});
const sectionHeadingTv = tv({
  base: "text-4xl",
});
const listWrapperTv = tv({
  base: "justify-self-center",
});
const currentDeckNumTv = tv({
  base: "text-xl font-bold",
  variants: {
    invalid: {
      true: "text-red-600",
    },
  },
});
