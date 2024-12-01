import { Vector4 } from "three";
import { Vector4LikeArray } from "../types";

export const vectorLikeToVector4 = (vec: Vector4LikeArray) =>
  vec instanceof Vector4
    ? vec
    : Array.isArray(vec)
    ? new Vector4().fromArray(vec)
    : new Vector4(vec.x, vec.y, vec.z, vec.w);
