import { MathUtils } from "three";
import { Scalar } from "../Scalar";

export const lerpScalar = (
  min: Scalar,
  max: Scalar,
  scale: number,
  forceInteger: boolean
) => {
  const value = MathUtils.lerp(min.value, max.value, scale);
  return { value: forceInteger ? Math.round(value) : value };
};
