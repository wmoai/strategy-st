import { type FC } from "react";
import { tv } from "tailwind-variants";

import { UnitImage } from "@/components/parts/UnitImage";
import type { ActionPrediction } from "@/game/elements/game/GameEnv";

type Props = {
  from: ActionPrediction;
  to: ActionPrediction;
};

export const ActionPredictionPanel: FC<Props> = ({ from, to }) => {
  const hpClass = hpTv();
  return (
    <div className="flex gap-2 items-center justify-center h-full">
      <div>
        <UnitImage unit={from.unit.data} isBlue={!from.unit.isOffense} />
        <div>
          <span className={hpClass}>{from.unit.currentHp}</span>
          <span>/{from.unit.data.hp}</span>
        </div>
      </div>
      <table className="text-center [&_td]:px-1 [&_td]:min-w-[3em] [&_td:first-child]:bg-red-800">
        <tbody>
          <tr>
            <td>{from.effect}</td>
            <th>効果</th>
            <td>{to.effect ?? "-"}</td>
          </tr>
          <tr>
            <td>{from.hit === null ? "-" : from.hit + "%"}</td>
            <th>命中</th>
            <td>{to.hit === null ? "-" : to.hit + "%"}</td>
          </tr>
          <tr>
            <td>{from.crit === null ? "-" : from.crit + "%"}</td>
            <th>会心</th>
            <td>{to.crit === null ? "-" : to.crit + "%"}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <UnitImage unit={to.unit.data} isBlue={!to.unit.isOffense} />
        <div>
          <span className={hpClass}>{to.unit.currentHp}</span>
          <span>/{to.unit.data.hp}</span>
        </div>
      </div>
    </div>
  );
};

const hpTv = tv({
  base: "text-xl text-green-300",
});
const hpDiffTv = tv({
  base: "text-red-300 ms-0.5",
  variants: {
    isHeal: {
      true: "text-green-400",
    },
  },
});
