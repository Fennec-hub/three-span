import { ScalarLike, ScalarSpanParams } from "./types";

import { Span } from "./Span";
import { Scalar } from "./Scalar";
import { isTypePredicate } from "./utils/isTypePredicate";
import { SpanNoiseLike } from "./SpanNoise/types";
import { EasingFunction } from "./easings/types";

/**
 * A class to dynamically adjusts {@link Scalar} value
 * within specified ranges and/or time, depending on the configuration
 * a step can return a random vector, an array pick or a smooth interpolation
 * through an easing function or a predefined curve.
 */
export class ScalarSpan extends Span<Scalar, ScalarLike> {
  /**
   * @param params - The value to be processed. It can either be:
   *              1. A single number representing a fixed value.
   *
   *              2. `{ type: "randomLerp" }`: Random Vector within the `start` and `end` range.
   *
   *              3. `{ type: "random" }`: Random linear interpolation between the `start` and `end` vectors.
   *
   *              4. `{ type: "easing" }`: The `easing` function value reflecting the particle's lifetime within
   *                 a `start` and `end` range.
   *
   *              5. `{ type: "curve" }`: A `curve` represented by key steps in the range [0, 1],
   *                  with a scale value for each step.
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
   * const stepper = new Vector2Span(30);
   *
   * //- 2 Random number between `start` and `end`
   * const stepper = new Vector2Span({ type: "randomLerp", start: 0, end: 10, integer: true });
   *
   * //- 3 Easing function between `start` and `end` using an
   * const stepper = new Vector2Span({ type: "easing", start: 0, end: 10, easing: "easeQuadIn", integer: true });
   *
   * //- 4 Using a Curve interpolation
   * const curve = { 0: 1,  0.5:0, 1: 1 };
   * const stepper = new Vector2Span({ type: "easing", start: 0, end: 10, curve, curveShape: "smooth" });
   *
   * //- 5 Array of values
   * const stepper = new Vector2Span({ array: [0, 1.5, 2.6, 3.5], pick: "alternate" });
   */
  constructor(params: ScalarSpanParams = 0) {
    super();
    this._value = new Scalar();
    this.set(params);
  }

  protected _convert(scalar: ScalarLike) {
    return isTypePredicate<Scalar>(scalar, "isScalar")
      ? scalar
      : new Scalar(scalar);
  }

  random(
    start: ScalarLike,
    end: ScalarLike,
    forceInteger?: boolean,
    noise?: SpanNoiseLike
  ) {
    return this.randomLerp(start, end, forceInteger, noise);
  }

  protected _lerp(easing: EasingFunction) {
    const { _value, _start, _end } = this;
    return (scale = 0) => _value.lerpScalars(_start, _end, easing(scale));
  }

  /**
   * @static Create a new Vector2Span from the JSON object
   *
   * @returns a Vector2Span object
   */
  static fromJSON(json: ScalarSpanParams) {
    return new ScalarSpan(json);
  }

  /**
   * @static Check if the value is a Vector2Span instance and returns it or create a new one.
   *
   * @param value - A Vector2Span instance or its constructor's parameters.
   * @returns `Vector2Span` instance.
   */
  static create(value: ScalarSpan | ScalarSpanParams): ScalarSpan {
    return value instanceof ScalarSpan ? value : new ScalarSpan(value);
  }
}
