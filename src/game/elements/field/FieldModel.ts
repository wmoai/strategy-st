import { fieldData, type CellId, type FieldDatum } from "@/data/fieldData";
import type { TerrainId } from "@/data/terrainData";

import { FieldComponent } from "./FieldComponent";

export type Position = { x: number; y: number };

export class FieldModel {
  private readonly data: FieldDatum;
  readonly turn: number;
  readonly rows: TerrainId[][];
  readonly offenseInitPoses: Position[];
  readonly defenseInitPoses: Position[];
  readonly defenseBasePoses: Position[];
  component!: FieldComponent;

  private constructor({ data }: { data: FieldDatum }) {
    this.data = data;
    this.turn = data.info.turn[0];
    const { width, terrain } = data;
    this.rows = Array.from({ length: width }).map((_, i) =>
      terrain.slice(i * width, i * width + width)
    );
    this.offenseInitPoses = data.info.oinit.map((cellId) =>
      this.position(cellId)
    );
    this.defenseInitPoses = data.info.dinit.map((cellId) =>
      this.position(cellId)
    );
    this.defenseBasePoses = data.info.base.map((cellId) =>
      this.position(cellId)
    );
  }

  static async createRandom({ cellSize }: { cellSize: number }) {
    const fieldDatum = fieldData[Math.floor(Math.random() * fieldData.length)];
    const model = new FieldModel({ data: fieldDatum });
    model.component = await FieldComponent.create({
      data: fieldDatum,
      cellSize,
    });
    return model;
  }

  private position(cellId: CellId): Position {
    return {
      x: Math.floor(cellId % this.data.width),
      y: Math.floor(cellId / this.data.width),
    };
  }

  initialPos(isOffense: boolean) {
    return isOffense ? this.data.info.oinit : this.data.info.dinit;
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
    const { terrain } = this.data;
    return terrain[y * this.data.width + x];
  }
}
