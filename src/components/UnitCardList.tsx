import type { FC } from "react";

import type { Unit } from "@/data/units";

import { UnitCard } from "./UnitCard";

type Props = {
  units: Unit[];
  row: number;
};

export const UnitCardList: FC<Props> = ({ units, row }) => {
  return (
    <ul
      className={`grid gap-2`}
      style={{
        gridTemplateColumns: `repeat(${row}, 1fr)`,
      }}
    >
      {units.map((unit) => (
        <li key={unit.id}>
          <UnitCard unit={unit} />
        </li>
      ))}
    </ul>
  );
};
