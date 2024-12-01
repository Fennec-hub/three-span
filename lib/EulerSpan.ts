import { EulerLikeArray, EulerSpanParams, SpanGradient } from "./types";
import { EasingFunction, EasingName } from "./easings/types";
import { eulerLikeToEuler } from "./utils/eulerLikeToEuler";
import { Euler, Vector3 } from "three";
import { Span } from "./Span";
import { gradientVectorLerp } from "./utils/gradientVectorLerp";
import { lerpEuler } from "./utils/lerpEuler";
import { gradientEulerSlerp } from "./utils/gradientEulerSlerp";
import { slerpEuler } from "./utils/slerpEuler";
import { eulerLikeToQuaternion } from "./utils/eulerLikeToQuaternion";
import { SpanNoiseLike } from "./SpanNoise/types";

/**
 * A class to dynamically adjusts vector values
 * within specified ranges and/or time, depending on the configuration
 * a step can return a random vector, an array pick or a smooth interpolation
 * through an easing function or a predefined curve.
 */
export class EulerSpan extends Span<Euler, EulerLikeArray> {
  /** Defines Whether the euler interpolation should be linear (vector like `lerp`) or spherical (`slerp` using a `quaternion`) */
  slerp: boolean = true;

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
   * const stepper = new EulerLerpSpan(30);
   *
   * //- 2 Random number between `start` and `end`
   * const stepper = new EulerLerpSpan({ type: "randomLerp", start: 0, end: 10, integer: true });
   *
   * //- 3 Easing function between `start` and `end` using an
   * const stepper = new EulerLerpSpan({ type: "easing", start: 0, end: 10, easing: "easeQuadIn", integer: true });
   *
   * //- 4 Using a Curve interpolation
   * const curve = { 0: 1,  0.5:0, 1: 1 };
   * const stepper = new EulerLerpSpan({ type: "easing", start: 0, end: 10, curve, curveShape: "smooth" });
   *
   * //- 5 Array of values
   * const stepper = new EulerLerpSpan({ array: [0, 1.5, 2.6, 3.5], pick: "alternate" });
   */
  constructor(params: EulerSpanParams = [0, 0, 0]) {
    super();
    this._value = new Euler();
    this.slerp = params.slerp ?? true;
    this.set(params);
  }

  lerp(
    start: EulerLikeArray,
    end: EulerLikeArray,
    easing?: EasingName,
    forceInteger?: boolean,
    noise?: SpanNoiseLike
  ): this {
    this._lerp = this.slerp ? this._slerp : this._eulerLerp;
    return super.lerp(start, end, easing, forceInteger, noise);
  }

  gradient(steps: SpanGradient<EulerLikeArray>, noise?: SpanNoiseLike): this {
    this._lerpGradient = this.slerp
      ? this._slerpGradient
      : this._eulerLerpGradient;
    return super.gradient(steps, noise);
  }

  protected _convert(vector: EulerLikeArray) {
    return eulerLikeToEuler(vector);
  }

  _eulerLerp(easingFunc: EasingFunction) {
    const start = this._start;
    const end = this._end;
    return (scale = 0) => lerpEuler(this._value, start, end, easingFunc(scale));
  }

  _slerp(easingFunc: EasingFunction) {
    const startQuaternion = eulerLikeToQuaternion(this._start);
    const endQuaternion = eulerLikeToQuaternion(this._end);
    return (scale = 0) =>
      slerpEuler(
        this._value,
        startQuaternion,
        endQuaternion,
        easingFunc(scale)
      );
  }

  _eulerLerpGradient(keys: number[]) {
    const vec3Steps: Record<number, Vector3> = {};
    keys.forEach(
      (key) => (vec3Steps[key] = new Vector3().setFromEuler(this._steps[key]))
    );

    const vec3 = new Vector3();
    const vec3Step = gradientVectorLerp(vec3, vec3Steps, keys);
    return (step: number = 0) => this._value.setFromVector3(vec3Step(step));
  }

  _slerpGradient(keys: number[]) {
    return gradientEulerSlerp(this._value, this._steps, keys);
  }

  /**
   * @static Create a new EulerLerpSpan from the JSON object
   *
   * @returns a EulerLerpSpan object
   */
  static fromJSON(json: EulerSpanParams) {
    return new EulerSpan(json);
  }

  /**
   * @static Check if the value is a EulerLerpSpan instance and returns it or create a new one.
   *
   * @param value - A EulerLerpSpan instance or its constructor's parameters.
   * @returns `EulerLerpSpan` instance.
   */
  static create(value: EulerSpan | EulerSpanParams): EulerSpan {
    return value instanceof EulerSpan ? value : new EulerSpan(value);
  }
}
