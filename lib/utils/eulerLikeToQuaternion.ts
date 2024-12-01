import { Euler, Quaternion } from "three";
import { eulerLikeToEuler } from "./eulerLikeToEuler";
import { EulerLikeArray } from "../types";

export const eulerLikeToQuaternion = (euler: Euler | EulerLikeArray) =>
  new Quaternion().setFromEuler(eulerLikeToEuler(euler));
