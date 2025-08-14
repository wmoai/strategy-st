import json from "./json/klass.json";

export type KlassId = number & { readonly __brand: unique symbol };

export type KlassData = {
  id: KlassId;
  name: string;
  magical: number;
  healer: number;
  move: "foot" | "horse" | "hover";
};

export const klasses = json as KlassData[];

export const findKlass = (id: KlassId) =>
  klasses.find((klass) => klass.id === id);
