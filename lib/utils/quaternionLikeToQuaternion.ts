import { Quaternion } from "three";
import { QuaternionLikeArray } from "../types";

export const quaternionLikeToQuaternion = (quaternion: QuaternionLikeArray) =>
  quaternion instanceof Quaternion
    ? quaternion
    : Array.isArray(quaternion)
    ? new Quaternion().fromArray(quaternion)
    : new Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
