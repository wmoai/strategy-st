import type { Container } from "pixi.js";

import { fieldData, type CellId, type FieldDatum } from "@/data/fieldData";
import { terrainDataMap, type TerrainDatum } from "@/data/terrainData";

import { FieldComponent } from "./FieldComponent";

export type Position = { x: number; y: number };

export class FieldModel {
  private readonly data: FieldDatum;
  private readonly cellSize: number;
  readonly turn: number;
  readonly offenseInitPositions: Position[];
  readonly defenseInitPositions: Position[];
  readonly defenseBasePositions: Position[];
  private component!: FieldComponent;
  private hoveredPosition?: Position;

  private constructor({
    data,
    cellSize,
  }: {
    data: FieldDatum;
    cellSize: number;
  }) {
    this.data = data;
    this.cellSize = cellSize;
    this.turn = data.info.turn[0];
    this.offenseInitPositions = data.info.oinit.map((cellId) =>
      this.position(cellId)
    );
    this.defenseInitPositions = data.info.dinit.map((cellId) =>
      this.position(cellId)
    );
    this.defenseBasePositions = data.info.base.map((cellId) =>
      this.position(cellId)
    );
  }

  static async createRandom({ cellSize }: { cellSize: number }) {
    const fieldDatum = fieldData[Math.floor(Math.random() * fieldData.length)];
    const model = new FieldModel({ data: fieldDatum, cellSize });
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
    const { terrain, width } = this.data;
    return terrain[y * width + x];
  }

  addComponentToContainer(container: Container) {
    container.addChild(this.component.container);
  }

  onHover(
    callback: ({
      position,
      terrain,
    }: {
      position: Position;
      terrain: TerrainDatum;
    }) => void
  ) {
    const { container } = this.component;
    container.eventMode = "static";
    container.on("globalpointermove", (e) => {
      const localPos = e.getLocalPosition(container);
      const newHoveredPos = {
        x: Math.floor(localPos.x / this.cellSize),
        y: Math.floor(localPos.y / this.cellSize),
      };
      if (!this.isActiveCell(newHoveredPos)) {
        return;
      }
      if (
        newHoveredPos.x !== this.hoveredPosition?.x ||
        newHoveredPos.y !== this.hoveredPosition.y
      ) {
        callback({
          position: newHoveredPos,
          terrain:
            terrainDataMap[
              this.terrainId({ x: newHoveredPos.x, y: newHoveredPos.y })
            ],
        });
      }
      this.hoveredPosition = newHoveredPos;
    });
  }
}
