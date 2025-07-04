import type { FC } from "react";

import type { Unit } from "@/data/units";

import { UnitImage } from "./UnitImage";

type Props = {
  unit: Unit;
};

export const UnitCard: FC<Props> = ({ unit }) => {
  return (
    <article className="border-1">
      <header className="flex items-center text-white bg-gray-600 text-center font-bold">
        <div className="text-xl bg-black px-2 py-0.5">{unit.cost}</div>
        <div className="flex-1">{unit.name}</div>
      </header>
      <div className="flex items-center justify-center gap-4 px-3 py-1">
        <UnitImage unit={unit} isGray />
        <dl className="grid grid-cols-[2fr_3fr_2fr_3fr] gap-x-1 items-center [&_dd]:text-xl [&_dt]:text-gray-700 ">
          <dt>力</dt>
          <dd>{unit.str}</dd>
          <dt>技</dt>
          <dd>{unit.skl}</dd>
          <dt>守</dt>
          <dd>{unit.dff}</dd>
          <dt>移</dt>
          <dd>{unit.move}</dd>
          <dt>信</dt>
          <dd>{unit.fth}</dd>
          <dt>射</dt>
          <dd>
            {unit.max_range === unit.min_range
              ? unit.min_range
              : `${unit.min_range},${unit.max_range}`}
          </dd>
        </dl>
      </div>
    </article>
  );
};
