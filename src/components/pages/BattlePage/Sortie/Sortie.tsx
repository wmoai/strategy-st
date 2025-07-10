import { useAtomValue } from "jotai";
import { useMemo, useState, type FC } from "react";
import { tv } from "tailwind-variants";

import { units, type Unit } from "@/data/units";
import { deckAtom } from "@/features/deck/deckAtom";
import { getRandomUnits } from "@/features/deck/deckLogic";

import { SortieUnitCard } from "./SortieUnitCard";

const COST_LIMIT = 24;

type Props = {
  onReady: (args: { playerUnits: Unit[]; enemyUnits: Unit[] }) => void;
};

export const Sortie: FC<Props> = ({ onReady }) => {
  const deck = useAtomValue(deckAtom);
  const isOffense = useMemo(() => Math.random() >= 0.5, []);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const currentCost = useMemo(() => {
    return selectedIndexes.reduce<number>((totalCost, selectedIndex) => {
      return totalCost + deck[selectedIndex].cost;
    }, 0);
  }, [deck, selectedIndexes]);
  const enemies = useMemo(() => {
    const common = units.filter((unit) => unit.cost === 3);
    const veteran = units.filter((unit) => unit.cost === 4);
    const hero = units.filter((unit) => unit.cost === 5);
    return ([] as Unit[]).concat(
      getRandomUnits(common, 3),
      getRandomUnits(veteran, 2),
      getRandomUnits(hero, 1)
    );
  }, []);

  const isCostInvalid = currentCost == 0 || currentCost > COST_LIMIT;

  const playerSideArticle = sideArticleTv({
    side: isOffense ? "offense" : "defense",
    isCostInvalid,
  });
  const enemySideArticle = sideArticleTv({
    side: isOffense ? "defense" : "offense",
  });

  return (
    <>
      <h1 className="my-8 text-3xl font-bold text-center">出撃ユニット選択</h1>
      <div className="flex gap-6 justify-center">
        <article className={playerSideArticle.base()}>
          <header className={playerSideArticle.header()}>
            <h2 className={playerSideArticle.heading()}>自軍</h2>
            <div className={playerSideArticle.sideLabel()}>
              {isOffense ? "攻撃" : "防御"}
            </div>
          </header>
          <ul className={playerSideArticle.list()}>
            {deck.map((unit, index) => {
              const isSelected = selectedIndexes.includes(index);
              return (
                <li key={`${index}-${unit.id}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndexes((current) => {
                        if (isSelected) {
                          return current.filter((_index) => _index !== index);
                        }
                        return current.concat(index);
                      });
                    }}
                    aria-pressed={isSelected}
                  >
                    <SortieUnitCard
                      unit={unit}
                      isOffense={isOffense}
                      isSelected={isSelected}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
          <footer className={playerSideArticle.footer()}>
            <div>
              コスト
              <span className={playerSideArticle.currentCost()}>
                {currentCost}
              </span>
              /{COST_LIMIT}
            </div>
            <button
              type="button"
              disabled={isCostInvalid}
              className={playerSideArticle.sortieButton()}
              onClick={() =>
                onReady({
                  playerUnits: selectedIndexes.map(
                    (selectedIndex) => deck[selectedIndex]
                  ),
                  enemyUnits: enemies,
                })
              }
            >
              出撃
            </button>
          </footer>
        </article>
        <article className={enemySideArticle.base()}>
          <header className={enemySideArticle.header()}>
            <h2 className={enemySideArticle.heading()}>敵軍</h2>
            <div className={enemySideArticle.sideLabel()}>
              {isOffense ? "防御" : "攻撃"}
            </div>
          </header>
          <ul className={enemySideArticle.list()}>
            {enemies.map((unit, index) => (
              <li key={`${index}-${unit.id}`}>
                <SortieUnitCard unit={unit} isOffense={!isOffense} />
              </li>
            ))}
          </ul>
        </article>
      </div>
    </>
  );
};

const sideArticleTv = tv({
  slots: {
    base: "flex flex-col gap-4 border-1 p-2",
    header: "flex items-center justify-between",
    heading: "px-14 py-2 text-3xl font-bold",
    sideLabel: "px-5 py-2 text-3xl font-bold text-white",
    list: "flex gap-2 justify-center flex-wrap max-w-2xs",
    footer: "flex items-center justify-end gap-3",
    currentCost: "text-xl",
    sortieButton:
      "py-1.5 px-4 font-bold bg-green-700 rounded-md text-white cursor-pointer disabled:opacity-40 disabled:bg-gray-600 disabled:cursor-not-allowed",
  },
  variants: {
    side: {
      offense: {
        sideLabel: "bg-red-800",
      },
      defense: {
        sideLabel: "bg-blue-800",
      },
    },
    isCostInvalid: {
      true: {
        currentCost: "text-red-600",
      },
    },
  },
});
