import { Color, Euler, Quaternion, Vector2, Vector3, Vector4 } from "three";
import { Scalar } from "../Scalar";
import { SpanGradient } from "../types";

/**
 * DRY!
 * Returns the gradient sub range lerp/slerp params.
 *
 * @param keys  - The gradient keys
 * @param steps - The gradient steps
 * @param step  - The current step
 * @returns The lerp/slerp lowerStep, upperStep, and t progress
 */
export const gradientSubRangeLerpParams = <
  T extends Scalar | Vector2 | Vector3 | Vector4 | Color | Euler | Quaternion
>(
  keys: number[],
  steps: SpanGradient<T>,
  step: number
): [lowerVec: T, upperVec: T, t: number] => {
  let lowerKey!: number, upperKey!: number;

  for (let i = 0, l = keys.length - 1; i < l; i++) {
    if (step >= keys[i] && step <= keys[i + 1]) {
      lowerKey = keys[i];
      upperKey = keys[i + 1];
    }
  }

  return [
    steps[lowerKey],
    steps[upperKey],
    (step - lowerKey) / (upperKey - lowerKey),
  ];
};
