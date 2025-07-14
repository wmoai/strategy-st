import { findUnitDatum, unitData, type UnitDatum } from "@/data/unitData";

export const getRandomDeck = () => {
  const common = unitData.filter((unit) => unit.cost === 3);
  const veteran = unitData.filter((unit) => unit.cost === 4);
  const hero = unitData.filter((unit) => unit.cost === 5);
  const deck = ([] as UnitDatum[]).concat(
    getRandomUnits(common, 3),
    getRandomUnits(veteran, 6),
    getRandomUnits(hero, 3)
  );
  return deck;
};

export const getRandomUnits = (units: UnitDatum[], count: number) => {
  return Array.from({ length: count }).map(() => {
    const index = Math.floor(Math.random() * units.length);
    return units[index];
  });
};

const STORAGE_KEY = "yourDeck";

export const saveDeckToStorage = (units: UnitDatum[]) => {
  const unitIds = units.map((unit) => unit.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unitIds));
};

export const loadDeckFromStorage = (): UnitDatum[] | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return null;
  }
  const unitIds = JSON.parse(data);
  const units: Array<UnitDatum | null> = unitIds.map((id: unknown) => {
    if (typeof id === "number") {
      return findUnitDatum(id);
    }
    return null;
  });
  const filteredUnits: UnitDatum[] = units.filter((unit) => unit !== null);
  return filteredUnits;
};
