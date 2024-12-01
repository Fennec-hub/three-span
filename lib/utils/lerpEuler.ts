import { Euler } from "three";

export const lerpEuler = (
  euler: Euler,
  eulerA: Euler,
  eulerB: Euler,
  alpha: number
) => {
  euler.x = eulerA.x + (eulerB.x - eulerA.x) * alpha;
  euler.y = eulerA.y + (eulerB.y - eulerA.y) * alpha;
  euler.z = eulerA.z + (eulerB.z - eulerA.z) * alpha;

  return euler;
};
