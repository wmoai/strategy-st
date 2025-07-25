import { type CellId, type FieldDatum } from "@/data/fieldData";
import type { TerrainId } from "@/data/terrainData";

export type Position = { x: number; y: number };
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

export class FieldLogic {
  private readonly data: FieldDatum;

  constructor({ data }: { data: FieldDatum }) {
    this.data = data;
  }

  static init(data: FieldDatum) {
    const instance = new FieldLogic({ data });
    return instance;
  }

  existsCell({ x, y }: Position) {
    const { width, height } = this.data;
    return y >= 0 && y < height && x >= 0 && x < width;
  }

  isEdgeCell(pos: Position) {
    const { width, height } = this.data;
    if (!this.existsCell(pos)) {
      return false;
    }
    const { x, y } = pos;
    return x == 0 || y == 0 || x == width - 1 || y == height - 1;
  }

  isActiveCell(pos: Position) {
    // 端1マスは装飾マス
    return this.existsCell(pos) && !this.isEdgeCell(pos);
  }

  distance(from: Position, to: Position) {
    return Math.abs(from.y - to.y) + Math.abs(from.x - to.x);
  }

  terrainId({ x, y }: Position) {
    const { terrain, width } = this.data;
    return terrain[y * width + x];
  }

  private position(cellId: CellId): Position {
    return {
      x: Math.floor(cellId % this.data.width),
      y: Math.floor(cellId / this.data.width),
    };
  }

  get terrainRows() {
    const { terrain, width } = this.data;
    return Array.from({ length: width }).map((_, i) =>
      terrain.slice(i * width, i * width + width)
    );
  }

  get offenseInitialPositions() {
    return this.data.info.oinit.map((cellId) => this.position(cellId));
  }

  get defenseInitialPositions() {
    return this.data.info.dinit.map((cellId) => this.position(cellId));
  }

  get defenseBasePositions() {
    return this.data.info.base.map((cellId) => this.position(cellId));
  }

  get turn() {
    return this.data.info.turn[0];
  }

  terrainNeighborConnection(pos: Position): TerrainNeighborConnection {
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
        const deltaPos = { x: pos.x + dx, y: pos.y + dy };
        buff[dy][dx] =
          !this.existsCell(deltaPos) ||
          this.isTerrainConnected({ from: pos, to: deltaPos });
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
  }

  private isTerrainConnected({ from, to }: { from: Position; to: Position }) {
    const fromTerrainId = this.terrainId(from);
    const toTerrainId = this.terrainId(to);

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
  }
}
