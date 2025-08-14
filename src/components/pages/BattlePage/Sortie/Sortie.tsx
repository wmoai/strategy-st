import { useAtomValue, useSetAtom } from "jotai";
import { useMemo, useState, type FC } from "react";
import { tv } from "tailwind-variants";

import { units, type UnitData } from "@/data/unitData";
import { battleStepAtom, sortieAtom } from "@/features/battle/battleAtom";
import { deckAtom } from "@/features/deck/deckAtom";
import { getRandomUnits } from "@/features/deck/deckLogic";

import { SortieUnitCard } from "./SortieUnitCard";

const COST_LIMIT = 24;

export const Sortie: FC = () => {
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
    return ([] as UnitData[]).concat(
      getRandomUnits(common, 3),
      getRandomUnits(veteran, 2),
      getRandomUnits(hero, 1)
    );
  }, []);
  const setBattleStep = useSetAtom(battleStepAtom);
  const setSortie = useSetAtom(sortieAtom);

  const isCostInvalid = currentCost == 0 || currentCost > COST_LIMIT;

  const playerSideSectionClass = sideSectionTv({
    side: isOffense ? "offense" : "defense",
    isCostInvalid,
  });
  const enemySideSectionClass = sideSectionTv({
    side: isOffense ? "defense" : "offense",
  });

  return (
    <>
      <h1 className="my-8 text-3xl font-bold text-center">出撃ユニット選択</h1>
      <div className="flex gap-6 justify-center">
        <section className={playerSideSectionClass.base()}>
          <header className={playerSideSectionClass.header()}>
            <h2 className={playerSideSectionClass.heading()}>自軍</h2>
            <div className={playerSideSectionClass.sideLabel()}>
              {isOffense ? "攻撃" : "防御"}
            </div>
          </header>
          <ul className={playerSideSectionClass.list()}>
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
          <footer className={playerSideSectionClass.footer()}>
            <div>
              コスト
              <span className={playerSideSectionClass.currentCost()}>
                {currentCost}
              </span>
              /{COST_LIMIT}
            </div>
            <button
              type="button"
              disabled={isCostInvalid}
              className={playerSideSectionClass.sortieButton()}
              onClick={() => {
                setBattleStep("battle");
                setSortie({
                  isOffense,
                  units: {
                    player: selectedIndexes.map(
                      (selectedIndex) => deck[selectedIndex]
                    ),
                    enemy: enemies,
                  },
                });
              }}
            >
              出撃
            </button>
          </footer>
        </section>
        <section className={enemySideSectionClass.base()}>
          <header className={enemySideSectionClass.header()}>
            <h2 className={enemySideSectionClass.heading()}>敵軍</h2>
            <div className={enemySideSectionClass.sideLabel()}>
              {isOffense ? "防御" : "攻撃"}
            </div>
          </header>
          <ul className={enemySideSectionClass.list()}>
            {enemies.map((unit, index) => (
              <li key={`${index}-${unit.id}`}>
                <SortieUnitCard unit={unit} isOffense={isOffense} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};

const sideSectionTv = tv({
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
