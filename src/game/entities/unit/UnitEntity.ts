import type { Position } from "@/data/fieldData";
import { findKlass, type KlassData } from "@/data/klassData";
import type { TerrainData } from "@/data/terrainData";
import { findUnitData, type UnitData, type UnitId } from "@/data/unitData";
import { cellSize, hpBarWidth } from "@/game/constants";
import type { Animation } from "@/game/scenes/battleFieldScene/AnimationManager";

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
    this.state.isActed = true;
    this.changePosition(position);
  }

  changePosition(position: Position) {
    this.state.position = position;
    this.updateComponent();
  }

  async changeHp(hp: number) {
    this.state.currentHp = Math.max(0, Math.min(this.data.hp, hp));
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

  createMovingAnimations(route: Position[]): Animation[] {
    return route.map((nextPosition) => {
      const toCoordinates = {
        x: nextPosition.x * cellSize,
        y: nextPosition.y * cellSize,
      };

      return {
        update: (deltaTime: number) => {
          const { container } = this;
          const distance = {
            x: toCoordinates.x - container.x,
            y: toCoordinates.y - container.y,
          };
          const movingDistance = deltaTime * 8;
          container.x =
            distance.x > 0
              ? Math.min(container.x + movingDistance, toCoordinates.x)
              : Math.max(container.x - movingDistance, toCoordinates.x);
          container.y =
            distance.y > 0
              ? Math.min(container.y + movingDistance, toCoordinates.y)
              : Math.max(container.y - movingDistance, toCoordinates.y);
        },
        isEnd: () => {
          const { container } = this;
          return (
            container.x === toCoordinates.x && container.y === toCoordinates.y
          );
        },
      };
    });
  }

  createChangingHpBarAnimation({
    deltaHp,
    duration,
  }: {
    deltaHp: number;
    duration: number;
  }): Animation {
    const maxHp = this.data.hp;
    const finalHp = Math.max(
      0,
      Math.min(maxHp, this.state.currentHp + deltaHp),
    );
    const finalWidth = hpBarWidth * (finalHp / maxHp);
    const deltaWidth = finalWidth - this.component.children.greenLine.width;
    const deltaWidthPerTime = deltaWidth / duration;
    return {
      update: (deltaTime: number) => {
        const { greenLine } = this.component.children;
        const changedWidth = greenLine.width + deltaWidthPerTime * deltaTime;
        greenLine.width =
          deltaWidthPerTime > 0
            ? Math.min(changedWidth, finalWidth)
            : Math.max(changedWidth, finalWidth);
      },
      isEnd: () => {
        return this.component.children.greenLine.width === finalWidth;
      },
    };
  }
}
