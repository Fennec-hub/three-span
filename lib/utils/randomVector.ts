import type {
  Color,
  Euler,
  Quaternion,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import { MathUtils } from "three";
import { AXES, RGB } from "./constants";

export const randomVector = <
  T extends Vector2 | Vector3 | Vector4 | Euler | Quaternion | Color
>(
  value: T,
  start: T,
  end: T
): ((step?: number) => T) => {
  const { randFloat } = MathUtils;
  const components = ((value as Color).isColor ? RGB : AXES).filter(
    (component) => (value as any)[component] != null
  );

  return () => {
    components.forEach(
      (component) =>
        ((value as any)[component] = randFloat(
          (start as any)[component],
          (end as any)[component]
        ))
    );
    return value as T;
  };
};
