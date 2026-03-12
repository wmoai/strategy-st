export type Animation = {
  update: (deltaTime: number) => void;
  isEnd(): boolean;
};
export type SequentialAnimation = {
  animations: Animation[];
  onEnd?: () => void;
};

export class AnimationManager {
  private sequentialAnimation: SequentialAnimation[] = [];

  add(sequentialAnimation: SequentialAnimation) {
    this.sequentialAnimation.push(sequentialAnimation);
  }

  update(deltaTime: number) {
    this.sequentialAnimation.forEach((animationGroup) => {
      const animation = animationGroup.animations[0];
      animation.update(deltaTime);
      if (animation.isEnd()) {
        animationGroup.animations.shift();
        if (animationGroup.animations.length === 0) {
          animationGroup.onEnd?.();
        }
      }
    });
    this.sequentialAnimation = this.sequentialAnimation.filter(
      (animationGroup) => animationGroup.animations.length > 0,
    );
  }

  get isAnimating() {
    return this.sequentialAnimation.length > 0;
  }
}
