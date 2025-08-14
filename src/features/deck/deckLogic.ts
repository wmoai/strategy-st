import { findUnitData, units, type UnitData } from "@/data/unitData";

export const getRandomDeck = () => {
  const common = units.filter((unit) => unit.cost === 3);
  const veteran = units.filter((unit) => unit.cost === 4);
  const hero = units.filter((unit) => unit.cost === 5);
  const deck = ([] as UnitData[]).concat(
    getRandomUnits(common, 3),
    getRandomUnits(veteran, 6),
    getRandomUnits(hero, 3)
  );
  return deck;
};

export const getRandomUnits = (units: UnitData[], count: number) => {
  return Array.from({ length: count }).map(() => {
    const index = Math.floor(Math.random() * units.length);
    return units[index];
  });
};

const STORAGE_KEY = "yourDeck";

export const saveDeckToStorage = (units: UnitData[]) => {
  const unitIds = units.map((unit) => unit.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unitIds));
};

export const loadDeckFromStorage = (): UnitData[] | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return null;
  }
  const unitIds = JSON.parse(data);
  const units: Array<UnitData | null> = unitIds.map((id: unknown) => {
    if (typeof id === "number") {
      return findUnitData(id);
    }
    return null;
  });
  const filteredUnits: UnitData[] = units.filter((unit) => unit !== null);
  return filteredUnits;
};
