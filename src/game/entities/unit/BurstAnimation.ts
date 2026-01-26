import { AnimatedSprite, Rectangle, Texture } from "pixi.js";

import { AssetLoader } from "@/game/utils/AssetLoader";

export class BurstAnimation {
  private static instance: BurstAnimation;
  private textures: Texture[];

  private static getInstance() {
    if (!BurstAnimation.instance) {
      BurstAnimation.instance = new BurstAnimation();
    }
    return BurstAnimation.instance;
  }

  private constructor() {
    const fireTexture = AssetLoader.loadTexture("fire");
    const tileSize = 120;
    this.textures = [];

    for (let i = 0; i < 6; i++) {
      const x = (i * tileSize) % fireTexture.width;
      const y = Math.floor((i * tileSize) / fireTexture.width) * tileSize;
      this.textures.push(
        new Texture({
          source: fireTexture.source,
          frame: new Rectangle(x, y, tileSize, tileSize),
        }),
      );
    }
  }

  static createAnimatedSprite() {
    const instance = BurstAnimation.getInstance();
    return new AnimatedSprite(instance.textures);
  }
}
