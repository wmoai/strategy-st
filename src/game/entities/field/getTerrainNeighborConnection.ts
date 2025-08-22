import type { FieldData, Position } from "@/data/fieldData";
import type { TerrainId } from "@/data/terrainData";

type TerrainNeighborConnection = {
  topLeft: boolean;
  top: boolean;
  topRight: boolean;
  left: boolean;
  right: boolean;
  bottomLeft: boolean;
  bottom: boolean;
  bottomRight: boolean;
};

export const getTerrainNeighborConnection = ({
  fieldData,
  position: { x, y },
}: {
  fieldData: FieldData;
  position: Position;
}): TerrainNeighborConnection => {
  const buff: Record<number, Record<number, boolean>> = {
    [-1]: {},
    0: {},
    1: {},
  };
  for (let dy = -1; dy < 2; dy++) {
    for (let dx = -1; dx < 2; dx++) {
      if (dy === 0 && dx === 0) {
        continue;
      }
      const deltaPos = { x: x + dx, y: y + dy };
      buff[dy][dx] =
        !fieldData.existsCell(deltaPos) ||
        isTerrainConnected({ field: fieldData, from: { x, y }, to: deltaPos });
    }
  }
  return {
    topLeft: buff[-1][-1],
    top: buff[-1][0],
    topRight: buff[-1][1],
    left: buff[0][-1],
    right: buff[0][1],
    bottomLeft: buff[1][-1],
    bottom: buff[1][0],
    bottomRight: buff[1][1],
  };
};

const isTerrainConnected = ({
  field,
  from,
  to,
}: {
  field: FieldData;
  from: Position;
  to: Position;
}) => {
  const fromTerrainId = field.getTerrainId(from);
  const toTerrainId = field.getTerrainId(to);

  const waterGroupIds = [6, 7] as TerrainId[];
  const bridgeGroupIds = [9, 10] as TerrainId[];
  if (waterGroupIds.includes(fromTerrainId)) {
    if (
      waterGroupIds.includes(toTerrainId) ||
      bridgeGroupIds.includes(toTerrainId)
    ) {
      return true;
    }
  }
  const mountainGroupIds = [4, 5] as TerrainId[];
  if (
    mountainGroupIds.includes(fromTerrainId) &&
    mountainGroupIds.includes(toTerrainId)
  ) {
    return true;
  }
  return fromTerrainId === toTerrainId;
};
