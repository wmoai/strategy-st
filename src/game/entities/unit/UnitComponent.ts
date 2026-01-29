import { Container, Graphics, Sprite } from "pixi.js";

import type { UnitData } from "@/data/unitData";
import { cellSize } from "@/game/constants";

import { BurstAnimation } from "./BurstAnimation";
import { HealAnimation } from "./HealAnimation";
import { KlassSpriteSheet } from "./KlassSpriteSheet";
import type { UnitState } from "./UnitEntity";

const hpBarWidth = cellSize - 4;

export class UnitComponent {
  private readonly unitData: UnitData;
  private readonly isOffense: boolean;
  readonly container: Container;
  children: {
    unit: Sprite;
    redLine: Graphics;
    greenLine: Graphics;
  };

  constructor({
    unitData,
    isOffense,
  }: {
    unitData: UnitData;
    isOffense: boolean;
  }) {
    this.unitData = unitData;
    this.isOffense = isOffense;
    this.container = new Container();

    const margin = cellSize / 10;
    this.children = {
      unit: new Sprite({
        width: cellSize - margin * 2,
        height: cellSize - margin * 2,
        x: margin,
        y: margin,
      }),
      redLine: new Graphics()
        .rect(2, cellSize - 4, hpBarWidth, 2)
        .fill(0xdc143c),
      greenLine: new Graphics()
        .rect(2, cellSize - 4, hpBarWidth, 2)
        .fill(0x40e0d0),
    };
    this.container = new Container({
      children: [
        this.children.unit,
        this.children.redLine,
        this.children.greenLine,
      ],
    });
  }

  update(state: UnitState) {
    this.children.unit.texture = KlassSpriteSheet.getUnitTexture({
      unitData: this.unitData,
      isOffense: this.isOffense,
      isActed: state.isActed,
    });
    this.children.greenLine.width = Math.max(
      (hpBarWidth * state.currentHp) / this.unitData.hp,
      0,
    );
    this.container.position.set(
      state.position.x * cellSize,
      state.position.y * cellSize,
    );
  }

  animateHpBar(hp: number) {}

  animateBurst() {
    const animation = BurstAnimation.createAnimatedSprite();
    animation.x = cellSize / 2;
    animation.y = cellSize / 2;
    animation.width = cellSize * 3;
    animation.height = cellSize * 3;
    animation.anchor.set(0.5);
    animation.animationSpeed = 0.5;
    animation.loop = false;
    animation.onComplete = () => {
      this.container.removeChild(animation);
      animation.destroy();
    };
    this.container.addChild(animation);
    animation.play();
  }

  animateHeal() {
    const animation = HealAnimation.createAnimatedSprite();
    animation.x = cellSize / 2;
    animation.y = cellSize / 4;
    animation.width = cellSize * 1.5;
    animation.height = cellSize * 1.5;
    animation.anchor.set(0.5);
    animation.animationSpeed = 0.3;
    animation.loop = false;
    animation.blendMode = "add";
    animation.onComplete = () => {
      this.container.removeChild(animation);
      animation.destroy();
    };
    this.container.addChild(animation);
    animation.play();
  }
}
