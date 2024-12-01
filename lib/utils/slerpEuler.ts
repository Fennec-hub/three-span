import { Euler, Quaternion } from "three";

const quaternion = /*@__PURE__*/ new Quaternion();

export const slerpEuler = (
  euler: Euler,
  min: Quaternion,
  max: Quaternion,
  scale: number
) =>
  euler.setFromQuaternion(
    quaternion.slerpQuaternions(min, max, scale),
    euler.order
  );
