import { QuaternionLikeArray, QuaternionSpanParams } from "./types";
import { EasingFunction } from "./easings/types";
import { quaternionLikeToQuaternion } from "./utils/quaternionLikeToQuaternion";
import { Quaternion } from "three";
import { Span } from "./Span";
import { gradientQuaternionSlerp } from "./utils/gradientQuaternionSlerp";

/**
 * A class to dynamically adjusts Quaternion values
 * within specified ranges and/or time, depending on the configuration
 * a step can return a random Quaternion, an array pick or a smooth interpolation
 * through an easing function or a predefined curve.
 */
export class QuaternionSpan extends Span<Quaternion, QuaternionLikeArray> {
  /**
   * @param value - The value to be processed. It can either be:
   *              1. A single number representing a fixed value.
   *
   *              2. `{ type: "randomLerp" }`: Random Quaternion within the `start`-`end` range.
   *
   *              3. `{ type: "random" }`: Random linear interpolation between a `start`-`end` Quaternions.
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
   * const stepper = new QuaternionSpan(30);
   *
   * //- 2 Random number between `start` and `end`
   * const stepper = new QuaternionSpan({ type: "randomLerp", start: 0, end: 10, integer: true });
   *
   * //- 3 Easing function between `start` and `end` using an
   * const stepper = new QuaternionSpan({ type: "easing", start: 0, end: 10, easing: "easeQuadIn", integer: true });
   *
   * //- 4 Using a Curve interpolation
   * const curve = { 0: 1,  0.5:0, 1: 1 };
   * const stepper = new QuaternionSpan({ type: "easing", start: 0, end: 10, curve, curveShape: "smooth" });
   *
   * //- 5 Array of values
   * const stepper = new QuaternionSpan({ array: [0, 1.5, 2.6, 3.5], pick: "alternate" });
   */
  constructor(params: QuaternionSpanParams = [0, 0, 0, 0]) {
    super();
    this._value = new Quaternion();
    this.set(params);
  }

  protected _convert(vector: QuaternionLikeArray) {
    return quaternionLikeToQuaternion(vector);
  }

  protected _lerp(easingFunc: EasingFunction) {
    const start = this._start;
    const end = this._end;
    return (scale = 0) =>
      this._value.slerpQuaternions(start, end, easingFunc(scale));
  }

  protected _lerpGradient(keys: number[]) {
    return gradientQuaternionSlerp(this._value, this._steps, keys);
  }

  /**
   * @static Create a new QuaternionSpan from the JSON object
   *
   * @returns a QuaternionSpan object
   */
  static fromJSON(json: QuaternionSpanParams) {
    return new QuaternionSpan(json);
  }

  /**
   * @static Check if the value is a QuaternionSpan instance and returns it or create a new one.
   *
   * @param value - A QuaternionSpan instance or its constructor's parameters.
   * @returns `QuaternionSpan` instance.
   */
  static create(value: QuaternionSpan | QuaternionSpanParams): QuaternionSpan {
    return value instanceof QuaternionSpan ? value : new QuaternionSpan(value);
  }
}
