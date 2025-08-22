import { Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";

import type { FieldData, Position } from "@/data/fieldData";
import type { TerrainId } from "@/data/terrainData";
import { cellSize } from "@/game/constants";
import { AssetLoader } from "@/game/utils/AssetLoader";

import { getTerrainNeighborConnection } from "./getTerrainNeighborConnection";

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

export class TerrainSpriteSheet {
  private static instance: TerrainSpriteSheet;
  private readonly connectedTextureRecord: Record<
    TerrainId,
    ConnectedTerrainTexture
  >;

  private static getInstance() {
    if (!TerrainSpriteSheet.instance) {
      TerrainSpriteSheet.instance = new TerrainSpriteSheet();
    }
    return TerrainSpriteSheet.instance;
  }

  private constructor() {
    const baseTexture = AssetLoader.loadTexture("terrain");
    const tileSize = 40;

    const result: TerrainSpriteSheet["connectedTextureRecord"] = {};
    for (let xIndex = 0; xIndex < baseTexture.width / tileSize; xIndex++) {
      const connectionBuffer: TerrainTexture[] = [];

      for (let yIndex = 0; yIndex < 5; yIndex++) {
        const textureSetBuffer: Texture[] = [];
        for (let v = 0; v < 2; v++) {
          for (let h = 0; h < 2; h++) {
            const texture = new Texture({
              source: baseTexture.source,
              frame: new Rectangle(
                tileSize * xIndex + (tileSize / 2) * h,
                tileSize * yIndex + (tileSize / 2) * v,
                tileSize / 2,
                tileSize / 2
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
    this.connectedTextureRecord = result;
  }
  static createFieldContainer(fieldData: FieldData) {
    return TerrainSpriteSheet.getInstance().createFieldContainer(fieldData);
  }

  createFieldContainer(fieldData: FieldData) {
    const container = new Container();
    const { connectedTextureRecord } = this;
    if (connectedTextureRecord === null) {
      throw new Error("terrain textures not preloaded");
    }
    const { width } = fieldData;

    fieldData.getTerrainRows.forEach((row, y) => {
      row.forEach((cellTerrain, x) => {
        const textureSet = connectedTextureRecord[cellTerrain.id];
        terrainTextureParts.forEach((part) => {
          container.addChild(
            this.createSprite({
              fieldData,
              textureSet,
              part,
              position: { x, y },
            })
          );
        });
        const isEdge =
          x === 0 ||
          y === 0 ||
          x === fieldData.width - 1 ||
          y === fieldData.height - 1;
        if (isEdge) {
          container.addChild(
            new Graphics()
              .rect(x * cellSize, y * cellSize, cellSize, cellSize)
              .fill({ color: 0, alpha: 0.2 })
          );
        }
      });
    });

    const containerMask = new Graphics()
      .rect(0, 0, width * cellSize, fieldData.height * cellSize)
      .fill(0);
    container.mask = containerMask;
    container.addChild(containerMask);

    container.cacheAsTexture(true);
    return container;
  }

  private createSprite({
    fieldData,
    textureSet,
    part,
    position: { x, y },
  }: {
    fieldData: FieldData;
    textureSet: ConnectedTerrainTexture;
    part: TerrainTexturePart;
    position: Position;
  }) {
    const neighborConnection = getTerrainNeighborConnection({
      fieldData,
      position: { x, y },
    });

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
}
