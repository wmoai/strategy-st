import type { FC } from "react";

import type { UnitData } from "@/data/unitData";

type Props = {
  unit: UnitData;
  isBlue?: boolean;
  isGray?: boolean;
};

export const UnitImage: FC<Props> = ({ unit, isBlue, isGray }) => {
  const size = 50;

  return (
    <div
      className={`bg-[url(/units.png)]`}
      style={{
        width: size,
        height: size,
        backgroundPositionX: -(unit.klass - 1) * size,
        backgroundPositionY: isGray ? 0 : isBlue ? -size : -size * 2,
      }}
    />
  );
};
