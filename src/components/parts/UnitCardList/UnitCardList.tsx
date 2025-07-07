import type { FC } from "react";

import type { Unit } from "@/data/units";

import { UnitCard } from "../UnitCard";
import { ButtonOrFragment } from "./ButtonOrFragment";

type Props = {
  units: Unit[];
  onClickUnit?: (unit: Unit, index: number) => void;
};

export const UnitCardList: FC<Props> = ({ units, onClickUnit }) => {
  return (
    <ul className={`flex flex-wrap gap-2 justify-center max-w-2xl mx-4`}>
      {units.map((unit, index) => (
        <li key={`${index}-${unit.id}`}>
          <ButtonOrFragment
            onClick={onClickUnit ? () => onClickUnit(unit, index) : undefined}
          >
            <UnitCard unit={unit} />
          </ButtonOrFragment>
        </li>
      ))}
    </ul>
  );
};
