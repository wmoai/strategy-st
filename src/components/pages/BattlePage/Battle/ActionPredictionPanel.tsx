import { clsx } from "clsx";
import { type FC } from "react";
import { tv } from "tailwind-variants";

import { UnitImage } from "@/components/parts/UnitImage";
import type { ActionPrediction } from "@/game/scenes/battleFieldScene/types";

type Props = {
  from: ActionPrediction;
  to: ActionPrediction;
};

export const ActionPredictionPanel: FC<Props> = ({ from, to }) => {
  const hpClass = hpTv();
  const fromBGClass = effectBG({
    attr: from.unit.isHealer
      ? "heal"
      : from.unit.isOffense
      ? "offense"
      : "defense",
  });
  const toBGClass = effectBG({
    attr: to.unit.isOffense ? "offense" : "defense",
  });

  return (
    <div className="flex items-stretch justify-center h-full">
      <div
        className={clsx(
          "flex-1 grid items-center justify-end px-4",
          fromBGClass
        )}
      >
        <div>
          <UnitImage unit={from.unit.data} isBlue={!from.unit.isOffense} />
          <div>
            <span className={hpClass}>{from.unit.currentHp}</span>
            <span>/{from.unit.data.hp}</span>
          </div>
        </div>
      </div>
      <table className="text-center [&_td]:px-1 [&_td]:min-w-[3em] text-xl">
        <tbody>
          <tr className={clsx("[&>td]:pt-1", fromBGClass)}>
            <td>{from.effect ? Math.abs(from.effect) : "-"}</td>
            <td>{from.hit === null ? "-" : from.hit + "%"}</td>
            <td>{from.crit === null ? "-" : from.crit + "%"}</td>
          </tr>
          <tr className="text-sm text-gray-300">
            <td>効果</td>
            <td>命中</td>
            <td>会心</td>
          </tr>
          <tr className={clsx("[&>td]:pb-1", toBGClass)}>
            <td>{to.effect ? Math.abs(to.effect) : "-"}</td>
            <td>{to.hit === null ? "-" : to.hit + "%"}</td>
            <td>{to.crit === null ? "-" : to.crit + "%"}</td>
          </tr>
        </tbody>
      </table>
      <div
        className={clsx(
          "flex-1 grid items-center justify-start px-4",
          toBGClass
        )}
      >
        <div>
          <UnitImage unit={to.unit.data} isBlue={!to.unit.isOffense} />
          <div>
            <span className={hpClass}>{to.unit.currentHp}</span>
            <span>/{to.unit.data.hp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const effectBG = tv({
  variants: {
    attr: {
      offense: "bg-[#753b3b]",
      defense: "bg-[#3b3e7c]",
      heal: "bg-[#3e6631]",
    },
  },
});

const hpTv = tv({
  base: "text-2xl text-green-300",
});
