import {
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

import { findUnitDatum, type UnitId } from "@/data/unitData";

import type { UnitState } from "./UnitModel";

type UnitTexture = {
  gray: Texture;
  blue: Texture;
  red: Texture;
};

type ConstructorParams = {
  unitId: UnitId;
  isOffense: boolean;
  cellSize: number;
};

export class UnitComponent {
  private static textures: Record<UnitId, UnitTexture> | null = null;
  private readonly unitId: UnitId;
  private readonly cellSize: number;
  private readonly isOffense: boolean;
  readonly container: Container;
  private readonly components: {
    unit: Sprite;
    redLine: Graphics;
    greenLine: Graphics;
  };
  private readonly maxHp: number;
  private readonly hpBarWidth: number;

  private constructor({ unitId, isOffense, cellSize }: ConstructorParams) {
    const data = findUnitDatum(unitId);
    if (!data) {
      throw new Error("invalid unitId");
    }
    this.unitId = unitId;
    this.cellSize = cellSize;
    this.isOffense = isOffense;
    this.maxHp = data.hp;
    this.hpBarWidth = cellSize - 4;

    const margin = cellSize / 10;
    this.components = {
      unit: new Sprite({
        width: cellSize - margin * 2,
        height: cellSize - margin * 2,
        x: margin,
        y: margin,
      }),
      redLine: new Graphics(),
      greenLine: new Graphics(),
    };
    this.components.redLine.fill(0xdc143c);
    this.components.redLine.rect(2, cellSize - 4, this.hpBarWidth, 2);
    this.components.greenLine.fill(0x40e0d0);
    this.components.greenLine.rect(2, cellSize - 4, this.hpBarWidth, 2);
    this.container = new Container({
      children: [
        this.components.unit,
        this.components.redLine,
        this.components.greenLine,
      ],
    });
  }

  static async create(args: ConstructorParams) {
    await UnitComponent.loadUnitTextures();
    const element = new UnitComponent(args);
    return element;
  }

  private static async loadUnitTextures() {
    if (UnitComponent.textures !== null) {
      return;
    }
    const spriteImage = await Assets.load("/strategy/units.png");
    const spriteTileSize = 50;

    const result: Record<UnitId, UnitTexture> = {};

    for (let w = 0; w < spriteImage.width / spriteTileSize; w++) {
      const unitId = (w + 1) as UnitId;
      const buff: Texture[] = [];
      for (let h = 0; h < 3; h++) {
        const texture = new Texture({
          source: spriteImage,
          frame: new Rectangle(
            spriteTileSize * w,
            spriteTileSize * h,
            spriteTileSize,
            spriteTileSize
          ),
        });
        buff.push(texture);
      }
      result[unitId] = {
        gray: buff[0],
        blue: buff[1],
        red: buff[2],
      };
    }
    UnitComponent.textures = result;
  }

  private updateUnitSprite(state: UnitState) {
    if (!UnitComponent.textures) {
      return;
    }
    const unitTexture = UnitComponent.textures[this.unitId];
    this.components.unit.texture = state.isActed
      ? unitTexture.gray
      : this.isOffense
      ? unitTexture.red
      : unitTexture.blue;
    this.container.position.set(
      state.x * this.cellSize,
      state.y * this.cellSize
    );
  }

  private updateGreenLineWidth(state: UnitState) {
    this.components.greenLine.width = Math.max(
      (this.hpBarWidth * state.currentHp) / this.maxHp,
      0
    );
  }

  update(state: UnitState) {
    this.updateUnitSprite(state);
    this.updateGreenLineWidth(state);
  }
}
