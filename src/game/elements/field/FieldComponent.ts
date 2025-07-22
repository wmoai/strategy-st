import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";

import type { FieldDatum } from "@/data/fieldData";
import type { TerrainId } from "@/data/terrainData";

import type { Position } from "./FieldModel";
import { fieldUtil } from "./fieldUtil";

const terrainTextureParts = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
] as const;
type TerrainTexturePart = (typeof terrainTextureParts)[number];
type TerrainTexture = Record<TerrainTexturePart, Texture>;
type TerrainConnection =
  | "none" // つながっていない
  | "x" // x軸方向につながっている
  | "y" // y軸方向につながっている
  | "xy" // xy軸両方につながっている
  | "xyd"; // xy軸と斜め方向につながっている
type ConnectedTerrainTexture = Record<TerrainConnection, TerrainTexture>;
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

export class FieldComponent {
  static terrainTextures: Record<TerrainId, ConnectedTerrainTexture> | null =
    null;
  private readonly data: FieldDatum;
  private readonly cellSize: number;
  readonly container: Container;

  private constructor({
    data,
    cellSize,
  }: {
    data: FieldDatum;
    cellSize: number;
  }) {
    this.data = data;
    this.cellSize = cellSize;
    this.container = new Container();
  }

  static async create({
    data,
    cellSize,
  }: {
    data: FieldDatum;
    cellSize: number;
  }) {
    const component = new FieldComponent({ data, cellSize });
    await component.setSprites({ cellSize });
    return component;
  }

  private async setSprites({ cellSize }: { cellSize: number }) {
    await FieldComponent.loadTerrainTextures();
    const { terrainTextures } = FieldComponent;
    if (terrainTextures === null) {
      return;
    }
    const { width, terrain } = this.data;

    const rows = Array.from({ length: width }).map((_, i) =>
      terrain.slice(i * width, i * width + width)
    );

    rows.forEach((row, y) => {
      row.forEach((cellTerrain, x) => {
        const textureSet = terrainTextures[cellTerrain];
        const neighborConnection = this.terrainNeighborConnection({ x, y });
        terrainTextureParts.forEach((part) => {
          this.container.addChild(
            this.createSprite({
              cellSize,
              textureSet,
              neighborConnection,
              part,
              position: { x, y },
            })
          );
        });
      });
    });
  }

  private createSprite({
    cellSize,
    textureSet,
    neighborConnection,
    part,
    position: { x, y },
  }: {
    cellSize: number;
    textureSet: ConnectedTerrainTexture;
    neighborConnection: TerrainNeighborConnection;
    part: TerrainTexturePart;
    position: Position;
  }) {
    const isTopPart = part.includes("top");
    const isLeftPart = part.includes("Left");
    const connection = {
      x: isLeftPart ? neighborConnection.left : neighborConnection.right,
      y: isTopPart ? neighborConnection.top : neighborConnection.bottom,
      diagonal: neighborConnection[part],
    };

    const partTexture = (() => {
      switch (true) {
        case connection.y && connection.x && connection.diagonal:
          return textureSet["xyd"];
        case connection.y && connection.x:
          return textureSet["xy"];
        case connection.x:
          return textureSet["x"];
        case connection.y:
          return textureSet["y"];
        default:
          return textureSet["none"];
      }
    })()[part];

    const sprite = new Sprite(partTexture);
    sprite.x = x * cellSize + (isLeftPart ? 0 : cellSize / 2);
    sprite.y = y * cellSize + (isTopPart ? 0 : cellSize / 2);
    sprite.width = cellSize / 2;
    sprite.height = cellSize / 2;
    return sprite;
  }

  private static async loadTerrainTextures() {
    if (FieldComponent.terrainTextures !== null) {
      return;
    }
    const spriteImage = await Assets.load("/strategy/terrain.png");
    const spriteTileSize = 40;

    const result: Record<TerrainId, ConnectedTerrainTexture> = {};
    for (
      let xIndex = 0;
      xIndex < spriteImage.width / spriteTileSize;
      xIndex++
    ) {
      const connectionBuffer: TerrainTexture[] = [];

      for (let yIndex = 0; yIndex < 5; yIndex++) {
        const textureSetBuffer: Texture[] = [];
        for (let v = 0; v < 2; v++) {
          for (let h = 0; h < 2; h++) {
            const texture = new Texture({
              source: spriteImage,
              frame: new Rectangle(
                spriteTileSize * xIndex + (spriteTileSize / 2) * h,
                spriteTileSize * yIndex + (spriteTileSize / 2) * v,
                spriteTileSize / 2,
                spriteTileSize / 2
              ),
            });
            textureSetBuffer.push(texture);
          }
        }
        connectionBuffer.push({
          topLeft: textureSetBuffer[0],
          topRight: textureSetBuffer[1],
          bottomLeft: textureSetBuffer[2],
          bottomRight: textureSetBuffer[3],
        });
      }
      result[(xIndex + 1) as TerrainId] = {
        none: connectionBuffer[0],
        y: connectionBuffer[1],
        x: connectionBuffer[2],
        xy: connectionBuffer[3],
        xyd: connectionBuffer[4],
      };
    }
    FieldComponent.terrainTextures = result;
  }

  private terrainNeighborConnection(pos: Position): TerrainNeighborConnection {
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
          !fieldUtil(this.data).existsCell(deltaPos) ||
          this.isTerrainConnected(pos, deltaPos);
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

  private isTerrainConnected(from: Position, to: Position) {
    const util = fieldUtil(this.data);
    const fromTerrainId = util.terrainId(from);
    const toTerrainId = util.terrainId(to);

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

  onPointerMove(callback: (position: Position) => void) {
    this.container.eventMode = "static";
    this.container.on("pointermove", (e) => {
      const localPos = e.getLocalPosition(this.container);
      callback({
        x: Math.floor(localPos.x / this.cellSize),
        y: Math.floor(localPos.y / this.cellSize),
      });
    });
  }
}
