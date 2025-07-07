import { findUnit, units, type Unit } from "@/data/units";

export const getRandomDeck = () => {
  const common = units.filter((unit) => unit.cost === 3);
  const veteran = units.filter((unit) => unit.cost === 4);
  const hero = units.filter((unit) => unit.cost === 5);
  const deck = ([] as Unit[]).concat(
    getRandomUnits(common, 3),
    getRandomUnits(veteran, 6),
    getRandomUnits(hero, 3)
  );
  return deck;
};

const getRandomUnits = (units: Unit[], count: number) => {
  return Array.from({ length: count }).map(() => {
    const index = Math.floor(Math.random() * units.length);
    return units[index];
  });
};

const STORAGE_KEY = "yourDeck";

export const saveDeckToStorage = (units: Unit[]) => {
  const unitIds = units.map((unit) => unit.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unitIds));
};

export const loadDeckFromStorage = (): Unit[] | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return null;
  }
  const unitIds = JSON.parse(data);
  const units: Array<Unit | null> = unitIds.map((id: unknown) => {
    if (typeof id === "number") {
      return findUnit(id);
    }
    return null;
  });
  const filteredUnits: Unit[] = units.filter((unit) => unit !== null);
  return filteredUnits;
};
