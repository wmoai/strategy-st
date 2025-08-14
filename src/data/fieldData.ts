import muhiJson from "./json/field/muhi.json";
import persianJson from "./json/field/persian.json";
import sekiJson from "./json/field/seki.json";
import { terrainDataMap, type TerrainId } from "./terrainData";

export type FieldId = number & { readonly __brand: unique symbol };
export type CellId = number & { readonly __brand: unique symbol };

export type Position = {
  x: number;
  y: number;
};

export class FieldData {
  id: FieldId;
  width: number;
  height: number;
  terrain: TerrainId[];
  info: {
    oinit: CellId[];
    dinit: CellId[];
    base: CellId[];
    turn: number[];
  };

  constructor(args: {
    id: number;
    width: number;
    height: number;
    terrain: number[];
    info: {
      oinit: number[];
      dinit: number[];
      base: number[];
      turn: number[];
    };
  }) {
    this.id = args.id as FieldData["id"];
    this.width = args.width;
    this.height = args.height;
    this.terrain = args.terrain as FieldData["terrain"];
    this.info = args.info as FieldData["info"];
  }

  static random() {
    return fields[Math.floor(Math.random() * fields.length)];
  }

  existsCell({ x, y }: Position) {
    const { width, height } = this;
    return y >= 0 && y < height && x >= 0 && x < width;
  }

  isEdgeCell(pos: Position) {
    const { width, height } = this;
    if (!this.existsCell(pos)) {
      return false;
    }
    const { x, y } = pos;
    return x == 0 || y == 0 || x == width - 1 || y == height - 1;
  }

  isActiveCell(pos: Position) {
    // 端1マス分は不使用
    return this.existsCell(pos) && !this.isEdgeCell(pos);
  }

  getDistance(from: Position, to: Position) {
    return Math.abs(from.y - to.y) + Math.abs(from.x - to.x);
  }

  getTerrainId({ x, y }: Position) {
    const { terrain, width } = this;
    return terrain[y * width + x];
  }

  private getPosition(cellId: CellId): Position {
    return {
      x: Math.floor(cellId % this.width),
      y: Math.floor(cellId / this.width),
    };
  }

  getTerrain(pos: Position) {
    return terrainDataMap[this.getTerrainId(pos)];
  }

  get getTerrainRows() {
    const { width, height } = this;
    return Array.from({ length: height }).map((_, y) =>
      Array.from({ length: width }).map((_, x) => this.getTerrain({ x, y }))
    );
  }

  get getOffenseInitialPositions() {
    return this.info.oinit.map((cellId) => this.getPosition(cellId));
  }

  get getDefenseInitialPositions() {
    return this.info.dinit.map((cellId) => this.getPosition(cellId));
  }

  get getDefenseBasePositions() {
    return this.info.base.map((cellId) => this.getPosition(cellId));
  }

  get getTurn() {
    return this.info.turn[0];
  }
}

const parseJson = (json: typeof muhiJson): FieldData => new FieldData(json);

const fields: FieldData[] = [
  parseJson(muhiJson),
  parseJson(persianJson),
  parseJson(sekiJson),
];

export const findFieldData = (id: number) =>
  fields.find((field) => field.id === id);
