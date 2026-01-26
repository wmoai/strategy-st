import type { Position } from "@/data/fieldData";
import { findKlass, type KlassData } from "@/data/klassData";
import type { TerrainData } from "@/data/terrainData";
import { findUnitData, type UnitData, type UnitId } from "@/data/unitData";
import { cellSize } from "@/game/constants";
import type { Animation } from "@/game/types";

import { UnitComponent } from "./UnitComponent";

export type UnitState = {
  position: Position;
  isActed: boolean;
  currentHp: number;
};

export class UnitEntity {
  readonly data: UnitData;
  readonly klass: KlassData;
  readonly isOffense: boolean;
  component: UnitComponent;
  private state: UnitState;

  constructor({
    unitId,
    isOffense,
    position,
  }: {
    unitId: UnitId;
    isOffense: boolean;
    position: Position;
  }) {
    const data = findUnitData(unitId);
    if (!data) {
      throw new Error("invalid unitId");
    }
    this.data = data;
    const klass = findKlass(this.data.klass);
    if (!klass) {
      throw new Error("invalid unit klass");
    }
    this.klass = klass;
    this.isOffense = isOffense;
    this.state = {
      position,
      currentHp: data.hp,
      isActed: false,
    };
    this.component = new UnitComponent({ unitData: data, isOffense });
    this.updateComponent();
  }

  private updateComponent() {
    this.component.update(this.state);
  }

  get container() {
    return this.component.container;
  }

  get isHealer() {
    return this.klass.healer === 1;
  }

  get isMagical() {
    return this.klass.magical === 1;
  }

  get position() {
    return this.state.position;
  }

  get currentHp() {
    return this.state.currentHp;
  }

  get isActed() {
    return this.state.isActed;
  }

  resetToState() {
    this.updateComponent();
  }

  standBy(position: Position) {
    this.state.position = position;
    this.state.isActed = true;
    this.updateComponent();
  }

  getActionEffectValueTo(target: UnitData) {
    const defense = this.isMagical ? target.fth : target.dff;
    return Math.max(this.data.str - defense, 1);
  }

  getHitRate({ target, terrain }: { target: UnitData; terrain: TerrainData }) {
    if (this.isHealer) {
      return 100;
    }
    const rate = 100 + this.data.skl * 5 - target.skl * 5 - terrain.avoid;
    return Math.min(Math.max(Math.floor(rate), 1), 100);
  }

  getCritRate() {
    if (this.isHealer) {
      return 0;
    }
    const rate = this.data.skl * 10;
    return Math.min(Math.max(Math.floor(rate), 0), 100);
  }

  createMoveAnimations(route: Position[]) {
    const animations = route.map<Animation>((to) => {
      const endCoordinates = {
        x: to.x * cellSize,
        y: to.y * cellSize,
      };
      return {
        update: (deltaTime: number) => {
          const distance = {
            x: endCoordinates.x - this.container.x,
            y: endCoordinates.y - this.container.y,
          };
          const speed = deltaTime * 8;
          this.container.x =
            distance.x > 0
              ? Math.min(this.container.x + speed, endCoordinates.x)
              : Math.max(this.container.x - speed, endCoordinates.x);
          this.container.y =
            distance.y > 0
              ? Math.min(this.container.y + speed, endCoordinates.y)
              : Math.max(this.container.y - speed, endCoordinates.y);
        },
        isFinished: () => {
          return (
            this.container.x === endCoordinates.x &&
            this.container.y === endCoordinates.y
          );
        },
      };
    });
    return animations;
  }
}
