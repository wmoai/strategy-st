import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";

import type { TerrainId } from "@/data/terrainData";

import type { FieldModel, NeighborConnection } from "../models/FieldModel";

const parts = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;
type Part = (typeof parts)[number];

type SplittedTerrainTexture = Record<Part, Texture>;
type Connection =
  | "none" // つながっていない
  | "x" // x軸方向につながっている
  | "y" // y軸方向につながっている
  | "xy" // xy軸両方につながっている
  | "xyd"; // xy軸と斜め方向につながっている
type ConnectedTerrainTexture = Record<Connection, SplittedTerrainTexture>;
type TextureResource = Record<TerrainId, ConnectedTerrainTexture>;

const cellSize = 40;

export const createFieldContainer = async (field: FieldModel) => {
  const terrainTexture = await createTerrainTexture();

  const container = new Container();
  field.rows.forEach((row, y) => {
    row.forEach((terrain, x) => {
      const textureSet = terrainTexture[terrain];
      const neighborConnection = field.neighborConnection({ x, y });
      parts.forEach((part) => {
        container.addChild(
          createSprite({
            textureSet,
            neighborConnection,
            part,
            position: { x, y },
          })
        );
      });
    });
  });
  return container;
};

const createTerrainTexture = async () => {
  const originalTexture = await Assets.load("/strategy/terrain.png");
  const tileSize = 40;

  const result: TextureResource = {};
  for (let xIndex = 0; xIndex < originalTexture.width / tileSize; xIndex++) {
    const connectionBuffer: SplittedTerrainTexture[] = [];

    for (let yIndex = 0; yIndex < 5; yIndex++) {
      const textureSetBuffer: Texture[] = [];
      for (let v = 0; v < 2; v++) {
        for (let h = 0; h < 2; h++) {
          const texture = new Texture({
            source: originalTexture,
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
  return result;
};

const createSprite = ({
  textureSet,
  neighborConnection,
  part,
  position: { x, y },
}: {
  textureSet: ConnectedTerrainTexture;
  neighborConnection: NeighborConnection;
  part: keyof SplittedTerrainTexture;
  position: { x: number; y: number };
}) => {
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
};
