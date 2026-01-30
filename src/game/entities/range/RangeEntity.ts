import { Container } from "pixi.js";

import type { FieldData, Position } from "@/data/fieldData";
import type { UnitData } from "@/data/unitData";

import { calculateShortestPath } from "./calculateShortestPath";
import { RangeComponent } from "./RangeComponent";
import type { RangeCell } from "./types";

export class RangeEntity {
  isHealer: boolean;
  rangeCells: RangeCell[][];
  container: Container;
  frame: number = 0;

  constructor({
    unitData,
    isHealer,
    position,
    fieldData,
    noEntries = [],
    forceMove,
  }: {
    unitData: UnitData;
    isHealer: boolean;
    position: Position;
    fieldData: FieldData;
    noEntries?: Position[];
    forceMove?: number;
  }) {
    this.isHealer = isHealer;
    this.container = new Container();
    this.rangeCells = calculateShortestPath({
      fieldData,
      noEntries,
      unitData,
      position,
      forceMove,
    });
  }

  showRange() {
    const component = new RangeComponent({
      rangeCells: this.rangeCells,
      isHealer: this.isHealer,
    });
    this.container.addChild(component.container);
  }

  hideRange() {
    this.container.removeChildren();
  }

  isMovable({ x, y }: Position) {
    return this.rangeCells
      ?.flat()
      .some(
        (rangeCell) =>
          rangeCell.position.x === x &&
          rangeCell.position.y === y &&
          rangeCell.movable,
      );
  }

  isActable({ x, y }: Position) {
    return this.rangeCells
      ?.flat()
      .some(
        (rangeCell) =>
          rangeCell.position.x === x &&
          rangeCell.position.y === y &&
          rangeCell.actable,
      );
  }

  routeTo(to: Position): Position[] {
    if (!this.rangeCells) {
      return [];
    }
    const result: Position[] = [];
    let currentPos = to;
    const flatRanges = this.rangeCells.flat();
    while (true) {
      const current = flatRanges.find(
        (item) =>
          item.position.x === currentPos.x && item.position.y === currentPos.y,
      );
      if (!current || !current.movablePrev) {
        break;
      }
      result.push(current.position);
      currentPos = current.movablePrev;
    }
    result.reverse();
    return result;
  }

  animate(deltaTime: number) {
    this.frame = (this.frame + deltaTime) % 60;
    if (this.container.children.length === 0) {
      return;
    }
    this.container.alpha =
      0.8 + (Math.sin(this.frame * (Math.PI / 30)) + 1) / 10;
  }
}
