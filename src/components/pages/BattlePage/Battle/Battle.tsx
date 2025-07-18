import { useAtomValue } from "jotai";
import { useEffect, useRef, type FC } from "react";

import { battleAtom } from "@/features/battle/battleAtom";
import { runGame } from "@/game";

export const Battle: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const isRunning = useRef(false);
  const battleState = useAtomValue(battleAtom);

  useEffect(() => {
    if (!canvasRef.current || !canvasWrapperRef.current) {
      return;
    }
    if (isRunning.current) {
      return;
    }
    isRunning.current = true;
    runGame({
      canvas: canvasRef.current,
      width: canvasWrapperRef.current.clientWidth,
      height: canvasWrapperRef.current.clientHeight,
      isPlayerOffense: battleState.isOffense,
      sortie: battleState.sortie,
    });
  }, [battleState.isOffense, battleState.sortie]);

  return (
    <div className="flex flex-col h-screen bg-gray-600 overflow-hidden">
      <div className="h-[100px] m-auto shrink-0">
        <div className="flex h-full">
          <button type="button">
            ターン
            <br />
            終了
          </button>
          <div>unit</div>
          <div>info</div>
        </div>
      </div>
      <div ref={canvasWrapperRef} className="flex-auto overflow-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
