import { Color } from "three";
import { ColorLikeArray } from "../types";

export const colorLikeToColor = (color: ColorLikeArray) =>
  color instanceof Color
    ? color
    : Array.isArray(color)
    ? new Color().fromArray(color)
    : new Color(color);
