import { Vector3 } from "three";
import { Vector3LikeArray } from "../types";

export const vectorLikeToVector3 = (vec: Vector3LikeArray) =>
  vec instanceof Vector3
    ? vec
    : Array.isArray(vec)
    ? new Vector3(...vec)
    : new Vector3(vec.x, vec.y, vec.z);
