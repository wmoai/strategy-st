export type Animation = {
  update: (deltaTime: number) => void;
  isEnd(): boolean;
};
export type AnimationGroup = {
  animations: Animation[];
  onEnd?: () => void;
};

export class AnimationManager {
  private animationGroups: AnimationGroup[] = [];

  add(animationGroup: AnimationGroup) {
    this.animationGroups.push(animationGroup);
  }

  update(deltaTime: number) {
    this.animationGroups.forEach((animationGroup) => {
      const animation = animationGroup.animations[0];
      animation.update(deltaTime);
      if (animation.isEnd()) {
        animationGroup.animations.shift();
        if (animationGroup.animations.length === 0) {
          animationGroup.onEnd?.();
        }
      }
    });
    this.animationGroups = this.animationGroups.filter(
      (animationGroup) => animationGroup.animations.length > 0,
    );
  }

  get isAnimating() {
    return this.animationGroups.length > 0;
  }
}
