import type {
  Color,
  Euler,
  Quaternion,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import { Scalar } from "../Scalar";

const toJSON = (value: any) => value.toJSON?.() ?? value.toArray?.() ?? value;

/**
 * Transform the stepper's value to JSON format
 * @param value - A Primitive number, a Vector3, an Euler or a Color.
 * @returns The value's JSON
 */
export const valueToJSON = <
  T extends Scalar | Vector2 | Vector3 | Vector4 | Euler | Quaternion | Color
>(
  value: T | T[]
) => (Array.isArray(value) ? value.map((val) => toJSON(val)) : toJSON(value));
