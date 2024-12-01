import { Quaternion, type Euler } from "three";
import { gradientSubRangeLerpParams } from "./gradientSubRangeLerpParams";
import { slerpEuler } from "./slerpEuler";
import { gradientFirstLast } from "./gradientFirstLast";

export const gradientEulerSlerp = (
  target: Euler,
  steps: { [step: number]: Euler },
  keys: number[]
) => {
  const quaternions: Record<number, Quaternion> = {};

  keys.forEach(
    (key) => (quaternions[key] = new Quaternion().setFromEuler(steps[key]))
  );

  const [firstKey, firstStep, lastKey, lastStep] = gradientFirstLast(
    keys,
    steps
  );

  return (step: number = 0) => {
    if (step <= firstKey) return target.copy(firstStep);

    if (step >= lastKey) return target.copy(lastStep);

    return slerpEuler(
      target,
      ...gradientSubRangeLerpParams(keys, quaternions, step)
    );
  };
};
