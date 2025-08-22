import {
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

import type { Position } from "@/data/fieldData";
import type { KlassId } from "@/data/klassData";
import { type UnitData } from "@/data/unitData";

import type { UnitState } from "./UnitController";
import type { Animation } from "../animation/Animation";

type UnitTexture = {
  gray: Texture;
  blue: Texture;
  red: Texture;
};

type ConstructorParams = {
  data: UnitData;
  isOffense: boolean;
  cellSize: number;
};

export class UnitComponent {
  private static textures: Record<KlassId, UnitTexture> | null = null;
  private readonly klassId: KlassId;
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

  static async preload() {
    const spriteImage = await Assets.load("/strategy/units.png");
    const spriteTileSize = 50;

    const result: Record<KlassId, UnitTexture> = {};

    for (let w = 0; w < spriteImage.width / spriteTileSize; w++) {
      const klassId = (w + 1) as KlassId;
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
      result[klassId] = {
        gray: buff[0],
        blue: buff[1],
        red: buff[2],
      };
    }
    UnitComponent.textures = result;
  }

  constructor({ data, isOffense, cellSize }: ConstructorParams) {
    this.klassId = data.klass;
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
    this.components.redLine
      .rect(2, cellSize - 4, this.hpBarWidth, 2)
      .fill(0xdc143c);
    this.components.greenLine
      .rect(2, cellSize - 4, this.hpBarWidth, 2)
      .fill(0x40e0d0);
    this.container = new Container({
      children: [
        this.components.unit,
        this.components.redLine,
        this.components.greenLine,
      ],
    });
  }

  private updateUnitSprite(state: UnitState) {
    if (!UnitComponent.textures) {
      throw new Error("unit textures not preloaded");
    }
    const unitTexture = UnitComponent.textures[this.klassId];
    this.components.unit.texture = state.isActed
      ? unitTexture.gray
      : this.isOffense
      ? unitTexture.red
      : unitTexture.blue;
    this.container.position.set(
      state.position.x * this.cellSize,
      state.position.y * this.cellSize
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

  moveAnimations(route: Position[]) {
    const animations = route.map<Animation>((to) => {
      const endCoordinates = {
        x: to.x * this.cellSize,
        y: to.y * this.cellSize,
      };
      return {
        update: (deltaTime: number) => {
          const distance = {
            x: endCoordinates.x - this.container.x,
            y: endCoordinates.y - this.container.y,
          };
          const speed = deltaTime * 8;
          this.container.x =
            distance.x > 0
              ? Math.min(this.container.x + speed, endCoordinates.x)
              : Math.max(this.container.x - speed, endCoordinates.x);
          this.container.y =
            distance.y > 0
              ? Math.min(this.container.y + speed, endCoordinates.y)
              : Math.max(this.container.y - speed, endCoordinates.y);
        },
        isFinished: () => {
          return (
            this.container.x === endCoordinates.x &&
            this.container.y === endCoordinates.y
          );
        },
      };
    });
    return animations;
  }
}
