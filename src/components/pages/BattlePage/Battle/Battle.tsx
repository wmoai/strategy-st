import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, type FC } from "react";

import {
  actionPredictionAtom,
  focusedTerrainAtom,
  focusedUnitAtom,
  sortieAtom,
} from "@/features/battle/battleAtom";
import { Game } from "@/game/elements/game/Game";

import { ActionPredictionPanel } from "./ActionPredictionPanel";
import { UnitInfoPanel } from "./UnitInfoPanel";

export const Battle: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const isRunning = useRef(false);
  const sortie = useAtomValue(sortieAtom);
  const [focusedUnit, setFocusedUnit] = useAtom(focusedUnitAtom);
  const [focusedTerrain, setFocusedTerrain] = useAtom(focusedTerrainAtom);
  const [actionPrediction, setActionPrediction] = useAtom(actionPredictionAtom);

  useEffect(() => {
    if (isRunning.current) {
      return;
    }
    isRunning.current = true;
    Game.create({
      isPlayerOffense: sortie.isOffense,
      sortieUnits: sortie.units,
      handlers: {
        onFocusUnit: setFocusedUnit,
        onFocusTerrain: setFocusedTerrain,
        onPredictAct: setActionPrediction,
      },
    }).then((game) => {
      if (!canvasRef.current || !canvasWrapperRef.current) {
        return;
      }
      game.run({
        canvas: canvasRef.current,
        canvasWrapper: canvasWrapperRef.current,
      });
    });
  }, [
    setActionPrediction,
    setFocusedTerrain,
    setFocusedUnit,
    sortie.isOffense,
    sortie.units,
  ]);

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
            {actionPrediction ? (
              <ActionPredictionPanel
                from={actionPrediction.from}
                to={actionPrediction.to}
              />
            ) : focusedUnit ? (
              <UnitInfoPanel unit={focusedUnit} />
            ) : null}
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
