import { EasingName, EasingFunction } from "./easings/types";
import {
  SpanCurve,
  SpanCurveShape,
  SpanArrayPick,
  SpanMethod,
  SpanParams,
  SpanGradient,
  SpanType,
  SpanTypeLike,
  SpanStepFunction,
  EulerSpanParams,
  SpanTimerParams,
} from "./types";
import type { Vector2 } from "three";
import type { Scalar } from "./Scalar";
import type { Vector2Span } from "./Vector2Span";
import { arrayPick } from "./utils/arrayPick";
import { curveInterpolation } from "./utils/curveInterpolation";
import { randomVector } from "./utils/randomVector";
import { valueToJSON } from "./utils/valueToJSON";
import { gradientVectorLerp } from "./utils/gradientVectorLerp";
import { easings } from "./easings";
import { SpanNoise } from "./SpanNoise";
import { SpanNoiseLike } from "./SpanNoise/types";

/**
 * Base class for dynamic value interpolation and animation in Three.js
 * Supports various interpolation methods including random values, easing functions,
 * custom curves, gradients, and array-based stepping.
 *
 * @abstract
 * @class
 * @template T - The Three.js type being interpolated (Vector2, Vector3, Euler, etc.)
 * @template TLike - The JSON-serializable representation of the type
 */
export abstract class Span<T extends SpanType, TLike extends SpanTypeLike> {
  protected _value!: T;
  protected _type!: SpanMethod;
  protected _start!: T;
  protected _end!: T;
  protected _easing!: string;
  protected _curve!: SpanCurve;
  protected _curveShape!: SpanCurveShape;
  protected _steps!: SpanGradient<T>;
  protected _array!: T[];
  protected _pick!: SpanArrayPick;
  protected _noise?: SpanNoise;

  private _hasTimer!: boolean;
  private _speed!: number;
  private _delay!: number;
  private _repeat!: number;
  private _alternate!: boolean;

  /** Whether to convert the resulting float value to integer  */
  forceInteger: boolean = false;

  /**
   * Configures the span with the provided parameters
   *
   * @param params - {@link SpanParams}. Configuration parameters for the span.
   * @returns This span instance for chaining
   */
  set(params: SpanParams<TLike>): this {
    if (typeof params !== "object" || !("type" in params))
      return this.val(params);

    this.timer(params, false);

    const type = params.type;
    this._type = type;

    // Set `EulerSpan`'s `slerp` param if defined
    if ((params as EulerSpanParams).slerp === false)
      (this as any).slerp = false;

    switch (type) {
      case "value":
        this.val(params.value, params.noise);
        break;

      case "array":
        this.array(params.array, params.pick, params.noise);
        break;

      case "gradient":
        this.gradient(params.steps, params.noise);
        break;

      case "randomLerp":
      case "random":
        this.randomLerp(
          params.start,
          params.end,
          params.forceInteger,
          params.noise
        );
        break;

      case "lerp":
        this.lerp(
          params.start,
          params.end,
          params.easing,
          params.forceInteger,
          params.noise
        );
        break;

      case "curve":
        this.curve(
          params.curve,
          params.curveShape,
          params.start,
          params.end,
          params.forceInteger,
          params.noise
        );
        break;
    }

    return this;
  }

  /**
   * Performs a single interpolation step
   *
   * @param scale - The interpolation progress (0-1). Default is 0
   * @returns The interpolated value
   */
  step!: (scale?: number) => T;

  /**
   * Creates a delta time based stepper function
   *
   * @param duration        - The duration of one complete cycle in milliseconds.
   * @param timer           - Optional. Timer params {@link SpanTimerParams}.
   * @param timer.speed     - Speed multiplier for the interpolation. Default 1.
   * @param timer.delay     - Normalized initial delay in milliseconds. eg. a delay of `2` means 2 cycles, 0.5 means half a cycle. Default 0.
   * @param timer.repeat    - Number of repeat cycles. Default `Infinity`.
   * @param timer.alternate - Whether to reverse on alternate cycles.
   *
   * @returns A function that accepts delta time and returns the interpolated value
   */
  deltaStepper(duration: number, timer?: SpanTimerParams) {
    if (timer) this.timer(timer);

    return (delta: number) => this.step(delta / duration);
  }

  /**
   * Creates an elapsed time based stepper function
   *
   * @param duration        - The duration of one complete cycle in milliseconds.
   * @param timer           - Optional. Span Timer params. See {@link SpanTimerParams}.
   * @param timer.speed     - Speed multiplier for the interpolation. Default 1.
   * @param timer.delay     - Normalized initial delay in milliseconds. eg. a delay of `2` means 2 cycles, 0.5 means half a cycle. Default 0.
   * @param timer.repeat    - Number of repeat cycles. Default `Infinity`.
   * @param timer.alternate - Whether to reverse on alternate cycles.
   *
   * @returns A function that accepts elapsed time and returns the interpolated value
   */
  elapsedStepper(duration: number, timer?: SpanTimerParams) {
    if (timer) this.timer(timer);

    let lastTime = 0;

    return (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      return this.step(delta / duration);
    };
  }

  /**
   * Sets a constant value for the span.
   *
   * @param value - The constant value to return in step(). {@link SpanTypeLike}.
   * @param noise - Optional noise configuration.
   *
   * @returns `this`
   */
  val(value: TLike, noise?: SpanNoiseLike) {
    this._type = "value";
    const val = this._convert(value);
    this._value = val;

    return this._stepper(() => val, noise);
  }

  /**
   * Creates a linear interpolation with an easing function between two values.
   *
   * @param start         - Start value for interpolation.
   * @param end           - End value for interpolation.
   * @param easing        - Easing function name. Default is "linear".
   * @param forceInteger  - Rounds result if true.
   * @param noise         - Optional noise configuration.
   *
   * @returns `this`
   */
  lerp(
    start: TLike,
    end: TLike,
    easing: EasingName = "linear",
    forceInteger: boolean = false,
    noise?: SpanNoiseLike
  ) {
    this._type = "lerp";
    this._easing = easing;
    this._bound(start, end, forceInteger);

    return this._stepper(this._lerp(easings[easing]), noise);
  }

  /**
   * Generates random values within a defined range.
   *
   * @param start         - Start of the random range.
   * @param end           - End of the random range.
   * @param forceInteger  - If true, rounds random values.
   * @param noise         - Optional noise configuration.
   *
   * @returns `this`
   */
  random(
    start: TLike,
    end: TLike,
    forceInteger: boolean = false,
    noise?: SpanNoiseLike
  ) {
    this._type = "random";
    this._bound(start, end, forceInteger);

    const _start = this._start as Exclude<T, number | Scalar>;
    const _end = this._end as Exclude<T, number | Scalar>;
    const _val = this._value as Exclude<T, number | Scalar>;

    return this._stepper(randomVector(_val, _start, _end), noise);
  }

  /**
   * Generates random lerp between the defined range.
   *
   * @param start         - Start of the random range.
   * @param end           - End of the random range.
   * @param forceInteger  - If true, rounds random values.
   * @param noise         - Optional noise configuration.
   *
   * @returns `this`
   */
  randomLerp(
    start: TLike,
    end: TLike,
    forceInteger: boolean = false,
    noise?: SpanNoiseLike
  ) {
    this._type = "randomLerp";
    this._bound(start, end, forceInteger);

    return this._stepper(this._lerp(Math.random), noise);
  }

  /**
   * Sets interpolation along a defined curve shape.
   *
   * @param curve - Custom curve values.
   * @param curveShape - Shape of the curve ("smooth", "linear", or "staircase").
   * @param start - Start value.
   * @param end - End value.
   * @param forceInteger - Rounds result if true.
   * @param noise - Optional noise configuration.
   *
   * @returns `this`
   */
  curve(
    curve: SpanCurve,
    curveShape: SpanCurveShape = "smooth",
    start: TLike,
    end: TLike,
    forceInteger: boolean = false,
    noise?: SpanNoiseLike
  ) {
    this._type = "curve";
    this._bound(start, end, forceInteger);
    this._curve = curve;
    this._curveShape = curveShape || "smooth";

    return this._stepper(
      this._lerp(curveInterpolation(this._curve, this._curveShape)),
      noise
    );
  }

  /**
   * Sets an array-based selection for step values.
   *
   * @param array - Array of possible values.
   * @param pick - Picking strategy, e.g., "random" or "repeat".
   * @param noise - Optional noise configuration.
   *
   * @returns `this`
   */
  array(array: TLike[], pick?: SpanArrayPick, noise?: SpanNoiseLike) {
    this._type = "array";
    this._array = array.map((val) => this._convert(val));
    this._pick = pick || "random";

    return this._stepper(arrayPick(this._array, this._pick), noise);
  }

  /**
   * Defines gradient interpolation across specified key steps.
   *
   * @param steps - Map of gradient steps.
   * @param noise - Optional noise configuration.
   *
   * @returns Configured stepper function.
   */
  gradient(steps: SpanGradient<TLike>, noise?: SpanNoiseLike) {
    this._type = "gradient";
    this._steps = {};
    let max: number = 0;
    let min: number = Infinity;
    const keys = Object.keys(steps)
      .map((val) => {
        const key = Number(val);
        max = Math.max(max, key);
        min = Math.min(min, key);
        return key;
      })
      .map((key) => {
        const value = steps[key];
        key = (key - min) / (max - min);
        this._steps[key] = this._convert(value);
        return key;
      })
      .sort((a, b) => a - b);

    return this._stepper(this._lerpGradient(keys), noise);
  }

  timer(
    {
      speed = 1,
      delay = 0,
      repeat = Infinity,
      alternate = false,
    }: SpanTimerParams,
    reset: boolean = true
  ) {
    this._hasTimer =
      speed !== 1 || delay !== 0 || repeat !== Infinity || !!alternate;

    this._speed = speed;
    this._delay = delay;
    this._repeat = repeat;
    this._alternate = alternate;

    if (reset && this._hasTimer) this.copy(this);
  }

  /**
   * Copy the source Span into `this` Span
   *
   * @param source - The source Span to copy.
   * @returns `this` Span.
   */
  copy(source: this): this {
    return this.set(source.toJSON());
  }

  /**
   * Return a clone instance of `this` Span.
   *
   * @returns A cloned new Span instance.
   */
  clone(): this {
    return new (this as any).constructor(this.toJSON()) as this;
  }

  /**
   * Stepper to JSON
   *
   * @returns The Stepper json format
   */
  toJSON(): SpanParams<TLike> {
    const type = this._type;
    const noise = this._noise;

    const baseJson: any = {
      type,
      noise: noise?.toJSON(),
      forceInteger: this.forceInteger,
    };

    if (this._hasTimer)
      Object.assign(baseJson, {
        speed: this._speed,
        delay: this._delay,
        repeat: this._repeat,
        alternate: this._alternate,
      });

    // Setting the EulerSpan slerp param
    if ((this as any).slerp === false) baseJson.slerp = false;

    const BaseJSONWithBounds = () => ({
      ...baseJson,
      start: this._start && valueToJSON(this._start),
      end: this._end && valueToJSON(this._end),
    });

    switch (type) {
      case "value":
        return {
          ...baseJson,
          value: valueToJSON(this._value),
        };

      case "randomLerp":
      case "random":
        return BaseJSONWithBounds();

      case "lerp":
        return {
          ...BaseJSONWithBounds(),
          easing: this._easing,
        } as SpanParams<TLike>;

      case "curve":
        return {
          ...BaseJSONWithBounds(),
          curve: this._curve,
          curveShape: this._curveShape,
        } as SpanParams<TLike>;

      case "gradient":
        return {
          ...baseJson,
          steps: Object.entries(this._steps).reduce(
            (acc, [key, val]) => ({ ...acc, [key]: valueToJSON(val) }),
            {}
          ),
        };

      case "array":
        return {
          ...baseJson,
          array: valueToJSON(this._array),
          pick: this._pick,
        };
    }
  }

  /**
   * Generate the stepper function, set a timer wrapper and/or a noise wrapper, if needed
   *
   * @param stepFunction  - The step function
   * @param noise         - The noise configuration
   *
   * @returns `this`
   */
  protected _stepper(stepFunction: SpanStepFunction<T>, noise?: SpanNoiseLike) {
    if (this._hasTimer) stepFunction = this._timerWrapper(stepFunction);

    if (noise) {
      this._noise = SpanNoise.create(noise);
      stepFunction = this._noise.wrapper(stepFunction, this._value);
    }

    this.step = stepFunction;

    return this;
  }

  /**
   * Set the main interpolation function for the {@link Span.step} method
   *
   * @param easing - The interpolation easing function
   * @returns Step function {@link SpanStepFunction}
   *
   * @protected
   */
  protected _lerp(easing: EasingFunction): SpanStepFunction<T> {
    const start = this._start as Vector2;
    const end = this._end as Vector2;
    const value = this._value as Vector2;
    return (scale = 0) => value.lerpVectors(start, end, easing(scale)) as T;
  }

  /**
   * Set the gradient interpolation function
   * @param keys - The gradient keys
   * @returns
   *
   * @private
   */
  protected _lerpGradient(keys: number[]): SpanStepFunction<T> {
    return gradientVectorLerp(
      (this as unknown as Vector2Span)._value,
      this._steps as SpanGradient<Vector2>,
      keys
    ) as SpanStepFunction<T>;
  }

  /**
   * Set the span [start, end] range bounds.
   *
   * @param start - The start value
   * @param end - The end value
   * @param forceInteger - If `true` convert the value to an Integer. Optional.
   */
  protected _bound(start: TLike, end: TLike, forceInteger: boolean = false) {
    this._start = this._convert(start);
    this._end = this._convert(end);
    this.forceInteger = forceInteger;
  }

  /**
   * Wrap the step function with a timer function.
   *
   * @param stepFunction - The step function
   *
   * @returns A timer wrapped stepper function
   */
  protected _timerWrapper(stepFunction: SpanStepFunction<T>) {
    const { _speed, _delay, _repeat, _alternate } = this;

    let timer = 0;
    let duration = Math.abs(_speed);
    let repeated = 0;
    let expired = false;
    let firstCycle = true;

    return (step: number = 0) => {
      if (expired) return stepFunction(1);

      step *= _speed;
      timer += Math.abs(step);

      if (firstCycle) {
        if (timer < _delay) return stepFunction(0);
        firstCycle = false;
        timer -= _delay;
      }

      if (timer >= duration) {
        timer = 0;
        repeated++;

        if (repeated >= _repeat) expired = true;
        else if (_alternate && !!(repeated & 1)) step = 1 - step;
      }

      return stepFunction(step);
    };
  }

  /**
   * Convert the `value` from JSON's {@link SpanTypeLike} format to a {@link SpanType} value
   *
   * @param value - a value of type {@link SpanTypeLike}
   * @returns The converted {@link SpanType} value
   *
   * @private
   */
  protected abstract _convert(value: TLike): T;
}
