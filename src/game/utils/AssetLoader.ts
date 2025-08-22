import { Assets, Texture } from "pixi.js";

type TextureKey = "klass" | "terrain";

export class AssetLoader {
  private static instance: AssetLoader | null = null;
  private textures: Map<TextureKey, Texture> = new Map();

  private static getInstance() {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  static async loadInitialAssets() {
    const instance = AssetLoader.getInstance();
    instance.textures.set("klass", await Assets.load("/strategy/units.png"));
    instance.textures.set(
      "terrain",
      await Assets.load("/strategy/terrain.png")
    );
  }

  static loadTexture(key: TextureKey) {
    const texture = AssetLoader.getInstance().textures.get(key);
    if (!texture) {
      throw new Error("asset not found");
    }
    return texture;
  }
}
