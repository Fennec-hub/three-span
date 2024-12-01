import { Vector4LikeArray, Vector4SpanParams } from "./types";
import { vectorLikeToVector4 } from "./utils/vectorLikeToVector4";
import { ScalarSpan } from "./ScalarSpan";
import { Vector4 } from "three";
import { Span } from "./Span";

/**
 * `Vector4Span` just like {@link ScalarSpan}, dynamically adjusts vector values
 * within specified ranges and/or time, depending on the configuration
 * a step can return a random vector, an array pick or a smooth interpolation
 * through an easing function or a predefined curve.
 */
export class Vector4Span extends Span<Vector4, Vector4LikeArray> {
  /**
   * @param value - The value to be processed. It can either be:
   *              1. A single number representing a fixed value.
   *
   *              2. `{ type: "randomLerp" }`: Random Vector within the `start`-`end` range.
   *
   *              3. `{ type: "random" }`: Random linear interpolation between a `start`-`end` vectors.
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
   * //- 1 Single value
   * const stepper = new Vector4Span(30);
   *
   * //- 2 Random number between `start` and `end`
   * const stepper = new Vector4Span({ type: "randomLerp", start: 0, end: 10, integer: true });
   *
   * //- 3 Easing function between `start` and `end` using an
   * const stepper = new Vector4Span({ type: "easing", start: 0, end: 10, easing: "easeQuadIn", integer: true });
   *
   * //- 4 Using a Curve interpolation
   * const curve = { 0: 1,  0.5:0, 1: 1 };
   * const stepper = new Vector4Span({ type: "easing", start: 0, end: 10, curve, curveShape: "smooth" });
   *
   * //- 5 Array of values
   * const stepper = new Vector4Span({ array: [0, 1.5, 2.6, 3.5], pick: "alternate" });
   */
  constructor(params: Vector4SpanParams = [0, 0, 0, 0]) {
    super();
    this._value = new Vector4();
    this.set(params);
  }

  protected _convert(vector: Vector4LikeArray) {
    return vectorLikeToVector4(vector);
  }

  /**
   * @static Create a new Vector4Span from the JSON object
   *
   * @returns a Vector4Span object
   */
  static fromJSON(json: Vector4SpanParams) {
    return new Vector4Span(json);
  }

  /**
   * @static Check if the value is a Vector4Span instance and returns it or create a new one.
   *
   * @param value - A Vector4Span instance or its constructor's parameters.
   * @returns `Vector4Span` instance.
   */
  static create(value: Vector4Span | Vector4SpanParams): Vector4Span {
    return value instanceof Vector4Span ? value : new Vector4Span(value);
  }
}
