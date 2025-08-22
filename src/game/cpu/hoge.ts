import type { GameEnv } from "../elements/game/GameEnv";

export const moveByAi = (env: GameEnv) => {
  const units = env.controllers.enemyUnits;

  if (units.length === 0) {
    return;
  }
  const unit = units[0];

  const targetUnits = unit.isHealer
    ? units.filter((_unit) => _unit !== unit)
    : env.controllers.playerUnits;

  // const rangeCells =
};
