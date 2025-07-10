import type { FC } from "react";
import { tv } from "tailwind-variants";

import { UnitImage } from "@/components/parts/UnitImage";
import type { Unit } from "@/data/units";

type Props = {
  unit: Unit;
  isOffense: boolean;
  isSelected?: boolean;
};

export const SortieUnitCard: FC<Props> = ({ unit, isOffense, isSelected }) => {
  const { base, name, cost } = sortieUnitCardTv({ isSelected });
  return (
    <section className={base()}>
      <div className="px-4">
        <UnitImage unit={unit} isBlue={!isOffense} isGray={!isSelected} />
      </div>
      <div className={name()}>{unit.name}</div>
      <div className={cost()}>{unit.cost}</div>
    </section>
  );
};

const sortieUnitCardTv = tv({
  slots: {
    base: "relative py-1 bg-gray-200",
    name: "text-sm text-center",
    cost: "absolute top-0 right-0 size-6 leading-6 outline-1 outline-white rounded-full text-center bg-gray-900 text-white",
  },
  variants: {
    isSelected: {
      true: {
        base: "bg-green-200",
        cost: "bg-green-800",
      },
    },
  },
});
