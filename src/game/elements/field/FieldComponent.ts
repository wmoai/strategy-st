import {
  Assets,
  BlurFilter,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

import type { FieldDatum } from "@/data/fieldData";
import { type TerrainId } from "@/data/terrainData";

import { FieldLogic, type Position } from "./FieldLogic";
import type { RangeCell } from "../range/RangeLogic";

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

export class FieldComponent {
  static terrainTextures: Record<TerrainId, ConnectedTerrainTexture> | null =
    null;
  private readonly data: FieldDatum;
  private readonly cellSize: number;
  readonly container: Container;
  readonly layer: {
    terrain: Container;
    range: Container | null;
  };
  private readonly logic: FieldLogic;

  constructor({ data, cellSize }: { data: FieldDatum; cellSize: number }) {
    this.data = data;
    this.cellSize = cellSize;
    this.container = new Container({ eventMode: "static" });
    this.layer = {
      terrain: new Container(),
      range: null,
    };
    this.container.addChild(this.layer.terrain);
    this.logic = new FieldLogic({ data });
  }

  async setSprites() {
    await FieldComponent.loadTerrainTextures();
    const { terrainTextures } = FieldComponent;
    if (terrainTextures === null) {
      return;
    }
    const { width } = this.data;
    const { cellSize } = this;

    this.logic.terrainRows.forEach((row, y) => {
      row.forEach((cellTerrain, x) => {
        const textureSet = terrainTextures[cellTerrain.id];
        terrainTextureParts.forEach((part) => {
          this.layer.terrain.addChild(
            this.createSprite({
              cellSize,
              textureSet,
              part,
              position: { x, y },
            })
          );
        });
      });
    });

    const shadowMargin = cellSize / 4;
    const edgeShadow = new Graphics()
      .rect(
        -cellSize,
        -cellSize,
        width * cellSize + cellSize * 2,
        this.data.height * cellSize + cellSize * 2
      )
      .fill({ color: 0, alpha: 0.3 })
      .rect(
        cellSize - shadowMargin,
        cellSize - shadowMargin,
        (width - 2) * cellSize + shadowMargin * 2,
        (this.data.height - 2) * cellSize + shadowMargin * 2
      )
      .cut();
    edgeShadow.filters = [new BlurFilter()];
    this.layer.terrain.addChild(edgeShadow);

    const containerMask = new Graphics()
      .rect(0, 0, width * cellSize, this.data.height * cellSize)
      .fill(0);
    this.layer.terrain.mask = containerMask;
    this.layer.terrain.addChild(containerMask);

    this.layer.terrain.cacheAsTexture(true);
  }

  private createSprite({
    cellSize,
    textureSet,
    part,
    position: { x, y },
  }: {
    cellSize: number;
    textureSet: ConnectedTerrainTexture;
    part: TerrainTexturePart;
    position: Position;
  }) {
    const neighborConnection = this.logic.terrainNeighborConnection({
      x,
      y,
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

  renderRange({
    ranges,
    isHealer,
  }: {
    ranges: RangeCell[][];
    isHealer: boolean;
  }) {
    this.layer.range?.destroy();

    const rangeContainer = new Container();
    ranges.forEach((row, y) =>
      row.forEach((rangeCell, x) => {
        if (rangeCell.movable || rangeCell.actable) {
          const color = rangeCell.movable
            ? 0x98fb98
            : isHealer
            ? 0x87ceeb
            : 0xffd700;
          const highlight = new Graphics()
            .rect(
              x * this.cellSize,
              y * this.cellSize,
              this.cellSize,
              this.cellSize
            )
            .fill({ color, alpha: 0.5 })
            .stroke({ color });
          rangeContainer.addChild(highlight);
        }
      })
    );
    this.layer.range = rangeContainer;
    this.container.addChild(rangeContainer);
    rangeContainer.cacheAsTexture(true);
  }

  onHover(callback: ({ position }: { position: Position }) => void) {
    this.container.on("globalpointermove", (e) => {
      const localPos = e.getLocalPosition(this.container);
      const actualPos = {
        x: Math.floor(localPos.x / this.cellSize),
        y: Math.floor(localPos.y / this.cellSize),
      };
      callback({ position: actualPos });
    });
  }

  onClick(callback: () => void) {
    this.container.on("click", callback);
  }
}
