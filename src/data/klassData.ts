import json from "./json/klass.json";

export type KlassId = number & { readonly __brand: unique symbol };

export type KlassDatum = {
  id: KlassId;
  name: string;
  magical: number;
  healer: number;
  move: "foot" | "horse" | "hover";
};

export const klassData = json as KlassDatum[];

export const findKlass = (id: KlassId) =>
  klassData.find((klass) => klass.id === id);
