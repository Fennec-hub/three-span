import { Vector3LikeArray, Vector3SpanParams } from "./types";
import { vectorLikeToVector3 } from "./utils/vectorLikeToVector3";
import { ScalarSpan } from "./ScalarSpan";
import { Vector3 } from "three";
import { Span } from "./Span";

/**
 * `Vector3Span` just like {@link ScalarSpan}, dynamically adjusts vector values
 * within specified ranges and/or time, depending on the configuration
 * a step can return a random vector, an array pick or a smooth interpolation
 * through an easing function or a predefined curve.
 */
export class Vector3Span extends Span<Vector3, Vector3LikeArray> {
  /**
   * @param value - The value to be processed. It can either be:
   *              1. A single number representing a fixed value.
   *
   *              2. `{ type: "randomLerp" }`: Random Vector within the `start`-`end` range.
   *
   *              3. `{ type: "randomPerAxi" }`: Random linear interpolation per axis within the [`start`, `end`] range.
   *
   *              4. `{ type: "easing" }`: The `easing` function value reflecting the particle's lifetime within
   *                 a `start` and `end` range.
   *
   *              5. `{ type: "curve" }`: A `curve` represented by key steps between 0 and 1,
   *                  and a scale value for each step.
   *                  The `curveShape` property is optional and defaulted to `"smooth"`, It can either be:
   *                    - `"smooth"`: Smooth curve interpolation with cubic bezier.
   *                    - `"linear"`: Linear interpolation.
   *                    - `"staircase"`: The value is updated only at the end of the curve segment.
   *
   *              6. `{ type: "array" }`: Pick a number from a defined `array`.
   *                 The `pick` property is optional and defaulted to `"randomLerp"`. It can either be:
   *                    - `"randomLerp"`: Pick a random value from the array.
   *                    - `"repeat"`: Traverse the array up then return to 0 and repeat.
   *                    - `"alternate"`: Traverse the array up then reverse back and alternate.
   *
   * @example
   * // 1. Single value
   * const stepper = new Vector3Span(30);
   *
   * // 2. Random number between `start` and `end`
   * const stepper = new Vector3Span({ type: "randomLerp", start: 0, end: 10, integer: true });
   *
   * // 3. Easing function between `start` and `end` using an
   * const stepper = new Vector3Span({ type: "easing", start: 0, end: 10, easing: "easeQuadIn", integer: true });
   *
   * // 4. Using a Curve interpolation
   * const curve = { 0: 1,  0.5:0, 1: 1 };
   * const stepper = new Vector3Span({ type: "easing", start: 0, end: 10, curve, curveShape: "smooth" });
   *
   * // 5. Array of values
   * const stepper = new Vector3Span({ type: "array", array: [0, 1.5, 2.6, 3.5], pick: "alternate" });
   */
  constructor(params: Vector3SpanParams = [0, 0, 0]) {
    super();
    this._value = new Vector3();
    this.set(params);
  }

  protected _convert(vector: Vector3LikeArray) {
    return vectorLikeToVector3(vector);
  }

  /**
   * @static Create a new Vector3Span from the JSON object
   *
   * @returns a Vector3Span object
   */
  static fromJSON(json: Vector3SpanParams) {
    return new Vector3Span(json);
  }

  /**
   * @static Check if the value is a Vector3Span instance and returns it or create a new one.
   *
   * @param value - A Vector3Span instance or its constructor's parameters.
   * @returns `Vector3Span` instance.
   */
  static create(value: Vector3Span | Vector3SpanParams): Vector3Span {
    return value instanceof Vector3Span ? value : new Vector3Span(value);
  }
}
