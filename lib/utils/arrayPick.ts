import { SpanArrayPick } from "../types";
import { MathUtils } from "three";

export const arrayPick = <T>(array: T[], pick: SpanArrayPick): (() => T) => {
  let length = array.length;
  let step: number = 0;
  let picker: () => T;

  const { pingpong } = MathUtils;

  switch (pick) {
    case "random":
      picker = () => array[Math.floor(Math.random() * length)];
      break;

    case "repeat":
      picker = () => array[step++ % length];
      break;

    default:
      length -= 1;
      picker = () => array[pingpong(step++, length)];
      break;
  }

  return picker;
};
