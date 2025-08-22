import { Rectangle, Texture } from "pixi.js";

import type { KlassId } from "@/data/klassData";
import type { UnitData } from "@/data/unitData";
import { AssetLoader } from "@/game/utils/AssetLoader";

type KlassTexture = {
  gray: Texture;
  blue: Texture;
  red: Texture;
};

export class KlassSpriteSheet {
  private static instance: KlassSpriteSheet;
  private textureRecord: Record<KlassId, KlassTexture>;

  private static getInstance() {
    if (!KlassSpriteSheet.instance) {
      KlassSpriteSheet.instance = new KlassSpriteSheet();
    }
    return KlassSpriteSheet.instance;
  }

  private constructor() {
    const baseTexture = AssetLoader.loadTexture("klass");
    const tileSize = 50;

    const result: KlassSpriteSheet["textureRecord"] = {};

    for (let w = 0; w < baseTexture.width / tileSize; w++) {
      const klassId = (w + 1) as KlassId;
      const buff: Texture[] = [];
      for (let h = 0; h < 3; h++) {
        const texture = new Texture({
          source: baseTexture.source,
          frame: new Rectangle(tileSize * w, tileSize * h, tileSize, tileSize),
        });
        buff.push(texture);
      }
      result[klassId] = {
        gray: buff[0],
        blue: buff[1],
        red: buff[2],
      };
    }
    this.textureRecord = result;
  }

  static getUnitTexture({
    unitData,
    isOffense,
    isActed,
  }: {
    unitData: UnitData;
    isOffense: boolean;
    isActed: boolean;
  }) {
    const instance = KlassSpriteSheet.getInstance();
    const unitTexture = instance.textureRecord[unitData.klass];
    return isActed
      ? unitTexture.gray
      : isOffense
      ? unitTexture.red
      : unitTexture.blue;
  }
}
