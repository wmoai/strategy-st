import { useEffect, useRef, type FC } from "react";

import { runGame } from "@/game";

export const Battle: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const isRunning = useRef(false);

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
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-600">
      <div className="h-[100px] m-auto">
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
      <div ref={canvasWrapperRef} className="flex-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
