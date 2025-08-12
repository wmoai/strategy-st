import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, type FC } from "react";
import { tv } from "tailwind-variants";

import { UnitImage } from "@/components/parts/UnitImage";
import {
  focusedTerrainAtom,
  focusedUnitAtom,
  sortieAtom,
} from "@/features/battle/battleAtom";
import { Game } from "@/game/elements/game/Game";

export const Battle: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const isRunning = useRef(false);
  const sortie = useAtomValue(sortieAtom);
  const [focusedUnit, setFocusedUnit] = useAtom(focusedUnitAtom);
  const [focusedTerrain, setFocusedTerrain] = useAtom(focusedTerrainAtom);

  useEffect(() => {
    if (isRunning.current) {
      return;
    }
    isRunning.current = true;
    Game.preload().then(() => {
      if (!canvasRef.current || !canvasWrapperRef.current) {
        return;
      }
      const game = new Game({
        isPlayerOffense: sortie.isOffense,
        sortieUnits: sortie.units,
      });
      game.run({
        canvas: canvasRef.current,
        canvasWrapper: canvasWrapperRef.current,
        onFocusUnit: setFocusedUnit,
        onFocusTerrain: setFocusedTerrain,
      });
    });
  }, [setFocusedTerrain, setFocusedUnit, sortie.isOffense, sortie.units]);

  return (
    <div className="flex flex-col h-screen bg-[#222] text-gray-100 overflow-hidden">
      <div className="h-[100px] m-auto shrink-0">
        <div className="flex items-stretch w-2xl h-full bg-gray-700">
          <button
            type="button"
            className="bg-green-700 p-4 rounded-xl font-bold"
          >
            ターン
            <br />
            終了
          </button>
          <section className="flex-1">
            {focusedUnit && (
              <div className="justify-self-center flex items-center gap-5 h-full">
                <div className="p-2 bg-gray-500 rounded-xl">
                  <UnitImage
                    unit={focusedUnit.data}
                    isBlue={!focusedUnit.isOffense}
                  />
                </div>
                <div>
                  <header className="flex gap-2">
                    <div
                      className={unitNameTv({
                        isOffense: focusedUnit.isOffense,
                      })}
                    >
                      {focusedUnit.data.name}
                    </div>
                    <div>
                      HP
                      <span className="ms-1 text-2xl text-green-300">
                        {focusedUnit.currentHp}
                      </span>
                      <span className="text-yellow-200">
                        /{focusedUnit.data.hp}
                      </span>
                    </div>
                  </header>
                  <dl className="mt-0.5 grid grid-cols-[repeat(3,10fr_11fr)] items-center [&>dt]:me-1.5 [&>dd]:text-xl [&>dd]:text-yellow-200 [&>*]:leading-tight">
                    <dt>力</dt>
                    <dd>{focusedUnit.data.str}</dd>
                    <dt>技</dt>
                    <dd>{focusedUnit.data.skl}</dd>
                    <dt>守備</dt>
                    <dd>{focusedUnit.data.dff}</dd>
                    <dt>移動</dt>
                    <dd>{focusedUnit.data.move}</dd>
                    <dt>信仰</dt>
                    <dd>{focusedUnit.data.fth}</dd>
                    <dt>射程</dt>
                    <dd>
                      {(() => {
                        const { max_range, min_range } = focusedUnit.data;
                        if (max_range === min_range) {
                          return max_range;
                        }
                        return `${min_range}~${max_range}`;
                      })()}
                    </dd>
                  </dl>
                </div>
              </div>
            )}
          </section>
          <section className="flex flex-col w-[8rem] bg-gray-600">
            <div className="flex-1">軍</div>
            <section className="grid grid-cols-[25fr_30fr] py-1">
              {focusedTerrain && (
                <>
                  <div className="font-bold text-center">
                    {focusedTerrain.name}
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-sm">回避</span>
                    <span>
                      {focusedTerrain.avoid > 0 && "+"}
                      {focusedTerrain.avoid}
                    </span>
                  </div>
                </>
              )}
            </section>
          </section>
        </div>
      </div>
      <div ref={canvasWrapperRef} className="flex-auto overflow-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

const unitNameTv = tv({
  base: "min-w-[6em] px-3 py-[1px] border border-gray-500 text-lg text-center",
  variants: {
    isOffense: {
      true: "bg-red-900",
      false: "bg-blue-900",
    },
  },
});
