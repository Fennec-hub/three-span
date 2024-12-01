import { Vector2 } from "three";
import { Vector2LikeArray } from "../types";

export const vectorLikeToVector2 = (vec: Vector2LikeArray) =>
  vec instanceof Vector2
    ? vec
    : Array.isArray(vec)
    ? new Vector2().fromArray(vec)
    : new Vector2(vec.x, vec.y);
