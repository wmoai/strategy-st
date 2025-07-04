import type { FC } from "react";

import type { Unit } from "@/data/units";

type Props = {
  unit: Unit;
  isBlue?: boolean;
  isGray?: boolean;
};

export const UnitImage: FC<Props> = ({ unit, isBlue, isGray }) => {
  const size = 50;
  const xPos = -(unit.klass - 1) * size;
  const yPos = isGray ? 0 : isBlue ? -size * 2 : -size;

  return (
    <div
      className={`bg-[url(/units.png)]`}
      style={{
        width: size,
        height: size,
        backgroundPositionX: xPos,
        backgroundPositionY: yPos,
      }}
    />
  );
};
