import { Color, Vector2, Vector3, Vector4 } from "three";
import { gradientSubRangeLerpParams } from "./gradientSubRangeLerpParams";
import { gradientFirstLast } from "./gradientFirstLast";
import { Scalar } from "../Scalar";

export const gradientVectorLerp = <
  T extends (Scalar | Vector2 | Vector3 | Vector4 | Color) & {
    copy: (v: any) => any;
    lerp: (v: any, t: number) => any;
  }
>(
  target: T,
  steps: Record<number, T>,
  keys: number[]
) => {
  const [firstKey, firstStep, lastKey, lastStep] = gradientFirstLast(
    keys,
    steps
  );

  return (step: number = 0) => {
    if (step <= firstKey) return target.copy(firstStep);

    if (step >= lastKey) return target.copy(lastStep);

    const [lowerVec, upperVec, t] = gradientSubRangeLerpParams<T>(
      keys,
      steps,
      step
    );

    return target.copy(lowerVec).lerp(upperVec, t) as T;
  };
};
