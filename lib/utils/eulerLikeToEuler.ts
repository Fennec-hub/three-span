import { Euler } from "three";
import { EulerLikeArray } from "../types";

export const eulerLikeToEuler = (euler: Euler | EulerLikeArray) =>
  euler instanceof Euler
    ? euler
    : Array.isArray(euler)
    ? new Euler().fromArray(euler)
    : new Euler(euler.x, euler.y, euler.z, euler.order);
