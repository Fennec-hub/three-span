import { Quaternion } from "three";
import { gradientSubRangeLerpParams } from "./gradientSubRangeLerpParams";
import { gradientFirstLast } from "./gradientFirstLast";

const _quat = /*@__PURE__*/ new Quaternion();

export const gradientQuaternionSlerp = (
  target: Quaternion,
  steps: { [step: number]: Quaternion },
  keys: number[]
) => {
  const [firstKey, firstStep, lastKey, lastStep] = gradientFirstLast(
    keys,
    steps
  );

  return (step: number = 0) => {
    if (step <= firstKey) return target.copy(firstStep);
    if (step >= lastKey) return target.copy(lastStep);

    return target.copy(
      _quat.slerpQuaternions(...gradientSubRangeLerpParams(keys, steps, step))
    );
  };
};
