import { units, type Unit } from "@/data/units";

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
  return Array(count).map(() => {
    const index = Math.floor(Math.random() * units.length);
    return units[index];
  });
};
