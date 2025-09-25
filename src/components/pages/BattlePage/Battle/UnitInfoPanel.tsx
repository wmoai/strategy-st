import { type FC } from "react";
import { tv } from "tailwind-variants";

import { UnitImage } from "@/components/parts/UnitImage";
import type { UnitEntity } from "@/game/entities/unit/UnitEntity";

type Props = {
  unit: UnitEntity;
};

export const UnitInfoPanel: FC<Props> = ({ unit }) => {
  return (
    <div className="justify-self-center flex items-center gap-5 h-full">
      <div className="p-2 bg-gray-500 rounded-xl">
        <UnitImage unit={unit.data} isBlue={!unit.isOffense} />
      </div>
      <div>
        <header className="flex gap-2">
          <div
            className={unitNameTv({
              isOffense: unit.isOffense,
            })}
          >
            {unit.data.name}
          </div>
          <div>
            HP
            <span className="ms-1 text-2xl text-green-300">
              {unit.currentHp}
            </span>
            <span className="text-yellow-200">/{unit.data.hp}</span>
          </div>
        </header>
        <dl className="mt-0.5 grid grid-cols-[repeat(3,10fr_11fr)] items-center [&>dt]:me-1.5 [&>dd]:text-xl [&>dd]:text-yellow-200 [&>*]:leading-tight">
          <dt>力</dt>
          <dd>{unit.data.str}</dd>
          <dt>技</dt>
          <dd>{unit.data.skl}</dd>
          <dt>守備</dt>
          <dd>{unit.data.dff}</dd>
          <dt>移動</dt>
          <dd>{unit.data.move}</dd>
          <dt>信仰</dt>
          <dd>{unit.data.fth}</dd>
          <dt>射程</dt>
          <dd>
            {(() => {
              const { max_range, min_range } = unit.data;
              if (max_range === min_range) {
                return max_range;
              }
              return `${min_range}~${max_range}`;
            })()}
          </dd>
        </dl>
      </div>
    </div>
  );
};

const unitNameTv = tv({
  base: "min-w-[6em] px-3 py-[1px] border border-gray-500 text-lg text-center",
  variants: {
    isOffense: {
      true: "bg-red-950",
      false: "bg-blue-950",
    },
  },
});
