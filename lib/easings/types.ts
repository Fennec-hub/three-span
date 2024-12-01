import { easings } from ".";

export type EasingName = keyof typeof easings;
export type EasingFunction = (scale: number) => number;
