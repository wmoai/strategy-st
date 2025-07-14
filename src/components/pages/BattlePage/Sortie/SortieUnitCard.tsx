import type { FC } from "react";
import { tv } from "tailwind-variants";

import { UnitImage } from "@/components/parts/UnitImage";
import type { UnitDatum } from "@/data/unitData";

type Props = {
  unit: UnitDatum;
  isOffense: boolean;
  isSelected?: boolean;
};

export const SortieUnitCard: FC<Props> = ({ unit, isOffense, isSelected }) => {
  const { base, cost } = sortieUnitCardTv({ isSelected });
  return (
    <section className={base()}>
      <div className="px-4">
        <UnitImage unit={unit} isBlue={!isOffense} isGray={!isSelected} />
      </div>
      <div className="text-sm text-center">{unit.name}</div>
      <div className={cost()}>{unit.cost}</div>
    </section>
  );
};

const sortieUnitCardTv = tv({
  slots: {
    base: "relative py-1 bg-gray-200",
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
