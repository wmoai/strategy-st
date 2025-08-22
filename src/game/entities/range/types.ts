import type { Position } from "@/data/fieldData";

export type RangeCell = {
  position: Position;
  movable: boolean;
  actable: boolean;
  movablePrev: Position | null;
  step: number;
};
