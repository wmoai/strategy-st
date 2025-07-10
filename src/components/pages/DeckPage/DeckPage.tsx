import { clsx } from "clsx";
import type { FC } from "react";
import { tv } from "tailwind-variants";

import { TopNavigation } from "@/components/parts/TopNavigation";
import { UnitCardList } from "@/components/parts/UnitCardList";
import { units } from "@/data/units";
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
        <section className={clsx(columnSection({ side: "left" }), "bg-white")}>
          <header
            className={clsx(
              sectionHeader(),
              "flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
            )}
          >
            <h2 className={sectionHeading()}>YOUR DECK</h2>
            <div className="w-11 text-end">
              <span className={currentDeckNum({ invalid: isDeckNumInvalid })}>
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
          <div className={listWrapper()}>
            <UnitCardList
              units={temporaryDeck}
              onClickUnit={(_, index) => removeUnit(index)}
            />
          </div>
        </section>
        <section
          className={clsx(columnSection({ side: "right" }), "bg-gray-200")}
        >
          <header className={sectionHeader()}>
            <h2 className={sectionHeading()}>POOL</h2>
          </header>
          <div className={listWrapper()}>
            <UnitCardList units={units} onClickUnit={(unit) => addUnit(unit)} />
          </div>
        </section>
      </main>
    </div>
  );
};

const columnSection = tv({
  base: "overflow-auto pb-20",
  variants: {
    side: {
      left: "justify-self-end",
      right: "justify-self-start",
    },
  },
});
const sectionHeader = tv({
  base: "sticky top-0 py-5 bg-inherit",
});
const sectionHeading = tv({
  base: "text-4xl",
});
const listWrapper = tv({
  base: "justify-self-center",
});
const currentDeckNum = tv({
  base: "text-xl font-bold",
  variants: {
    invalid: {
      true: "text-red-600",
    },
  },
});
