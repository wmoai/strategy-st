import { AnimatedSprite, Rectangle, Texture } from "pixi.js";

import { AssetLoader } from "@/game/utils/AssetLoader";

export class HealAnimation {
  private static instance: HealAnimation;
  private textures: Texture[];

  private static getInstance() {
    if (!HealAnimation.instance) {
      HealAnimation.instance = new HealAnimation();
    }
    return HealAnimation.instance;
  }

  private constructor() {
    const baseTexture = AssetLoader.loadTexture("light");
    const tileSize = 120;
    this.textures = [];

    for (let i = 0; i < 10; i++) {
      const x = (i * tileSize) % baseTexture.width;
      const y = Math.floor((i * tileSize) / baseTexture.width) * tileSize;
      this.textures.push(
        new Texture({
          source: baseTexture.source,
          frame: new Rectangle(x, y, tileSize, tileSize),
        }),
      );
    }
  }

  static createAnimatedSprite() {
    const instance = HealAnimation.getInstance();
    return new AnimatedSprite(instance.textures);
  }
}
