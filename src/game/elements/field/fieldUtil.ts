import type { FieldDatum } from "@/data/fieldData";

import type { Position } from "./FieldModel";

export const fieldUtil = (data: FieldDatum) => ({
  terrainId: ({ x, y }: Position) => {
    const { terrain } = data;
    return terrain[y * data.width + x];
  },

  existsCell: ({ x, y }: Position) => {
    const { width, height } = data;
    return y >= 0 && y < height && x >= 0 && x < width;
  },
});
