export type Animation = {
  isFinished: () => boolean;
  update: (deltaTime: number) => void;
};
