import { clsx } from "clsx";
import type { FC, ReactNode } from "react";
import { tv } from "tailwind-variants";

import { DECK_SIZE } from "@/features/deck/useDeck";

type Props = {
  navigation: ReactNode;
  deckList: ReactNode;
  poolList: ReactNode;
  deckNum: number;
  isDeckEdited: boolean;
  onSave: () => void;
};

export const DeckPage: FC<Props> = ({
  navigation,
  deckList,
  poolList,
  deckNum,
  isDeckEdited,
  onSave,
}) => {
  const isDeckNumInvalid = deckNum !== DECK_SIZE;
  return (
    <div className="flex flex-col h-screen">
      <header>{navigation}</header>
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
                {deckNum}
              </span>
              /{DECK_SIZE}
            </div>
            <button
              disabled={isDeckNumInvalid || !isDeckEdited}
              onClick={onSave}
              className="cursor-pointer text-white bg-blue-400 focus:ring-2 rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SAVE
            </button>
          </header>
          <div className={listWrapper()}>{deckList}</div>
        </section>
        <section
          className={clsx(columnSection({ side: "right" }), "bg-gray-200")}
        >
          <header className={sectionHeader()}>
            <h2 className={sectionHeading()}>POOL</h2>
          </header>
          <div className={listWrapper()}>{poolList}</div>
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
