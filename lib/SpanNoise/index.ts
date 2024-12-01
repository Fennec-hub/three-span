import { Color, Vector3, Vector4 } from "three";
import { SpanStepFunction, SpanType } from "../types";
import { SpanNoiseParams } from "./types";
import {
  createNoise3D,
  createNoise2D,
  NoiseFunction3D,
  NoiseFunction2D,
} from "simplex-noise";
import alea from "alea";
import { Scalar } from "../Scalar";

/**
 * Class representing noise generation for span-based animations and transitions.
 * Provides functionality for adding procedural noise to scalar and vector values.
 */
export class SpanNoise {
  /** Frequency of the noise pattern */
  frequency!: number;

  /** Amplitude/strength of the noise effect */
  amplitude!: number;

  /** Number of cycles before noise pattern repeats */
  cycle!: number;

  /** Speed of noise animation/evolution */
  speed!: number;

  /** Seed value for noise generation */
  private _seed?: number | string;

  /** 2D simplex noise generator function */
  private _simplex2D!: NoiseFunction2D;

  /** 3D simplex noise generator function */
  private _simplex3D!: NoiseFunction3D;

  /**
   * Creates a new SpanNoise instance.
   * @param params            - Configuration parameters for the noise generator
   * @param params.seed       - Optional seed value for deterministic noise generation. Can be a number or string
   * @param params.frequency  - Optional frequency of the noise pattern. Defaults to 1
   * @param params.amplitude  - Optional amplitude/strength of the noise effect. Defaults to 1
   * @param params.cycles     - Optional number of cycles before noise pattern repeats. Defaults to 1
   * @param params.speed      - Optional speed of noise animation/evolution. Defaults to 1 (internally multiplied by 0.1)
   */
  constructor(params: SpanNoiseParams) {
    this.set(params);
  }

  /**
   * Updates the noise generator parameters.
   * @param params - New configuration parameters
   */
  set(params: SpanNoiseParams) {
    const { seed, frequency, amplitude, cycles, speed } = params;
    this._seed = seed;
    this.frequency = frequency ?? this.frequency ?? 1;
    this.amplitude = amplitude ?? this.amplitude ?? 1;
    this.cycle = cycles ?? this.cycle ?? 1;
    this.speed = speed ?? this.speed ?? 1;

    this._simplex2D = createNoise2D(seed ? alea(seed) : undefined);
    this._simplex3D = createNoise3D(seed ? alea(seed) : undefined);

    return this;
  }

  /**
   * Creates a step function that applies noise to a value over time.
   * @template T    - Type of value {@link SpanType}
   * @param value   - Initial value to create stepper for
   * @returns Step function that applies noise to the value
   */
  stepper<T extends SpanType>(value: T) {
    const val: { value: T } = {} as any;
    const noiseWrapper = this.wrapper<T>(() => val.value, value);
    return (value: T, step: number) => {
      val.value = value;
      return noiseWrapper(step);
    };
  }

  /**
   * Copy the source SpanNoise into `this` SpanNoise
   *
   * @param source - The source SpanNoise to copy.
   * @returns `this` SpanNoise.
   */
  copy(source: this): this {
    return this.set(source.toJSON());
  }

  /**
   * Return a clone instance of `this` SpanNoise.
   *
   * @returns A cloned new SpanNoise instance.
   */
  clone(): this {
    return new (this as any).constructor(this.toJSON()) as this;
  }

  /**
   * Creates a wrapper function that applies noise to values based on their type.
   * @template T - Type of value (Scalar or Vector)
   * @param stepFunction  - Function that provides the base value at each step
   * @param value         - Initial value to determine wrapper type
   * @returns Wrapped step function that applies noise
   */
  wrapper<T extends SpanType>(
    stepFunction: SpanStepFunction<T>,
    value: T
  ): SpanStepFunction<T> {
    return (
      (value as Scalar).isScalar
        ? this._scalarWrapper(stepFunction as SpanStepFunction<Scalar>)
        : this._vectorWrapper(stepFunction, value)
    ) as SpanStepFunction<T>;
  }

  /**
   * Internal wrapper for applying noise to vector values (Vector3, Vector4, Color).
   * @private
   * @template T          - Type of vector value
   * @param stepFunction  - Function that provides the base vector at each step
   * @param value - Initial vector value
   * @returns Step function that applies noise to vectors
   */
  private _vectorWrapper<T extends SpanType>(
    stepFunction: SpanStepFunction<T>,
    value: T
  ) {
    const color = (value as any).isColor ? new Color() : null;
    const noiseValue = (color ? new Vector3() : value.clone()) as Vector4;
    let t = 0;
    let timer = 0;
    return (step: number) => {
      if ((timer += Math.abs(step)) >= this.cycle) {
        timer = 0;
        t += this.speed * 0.01;
      }

      const _simplex3D = this._simplex3D;
      const frequency = this.frequency * 0.1;
      const amplitude = this.amplitude * 0.1;
      const value = stepFunction(step);

      color
        ? (noiseValue as unknown as Vector3).setFromColor(color)
        : noiseValue.copy(value as any);

      const { x, y, z, w } = noiseValue;

      noiseValue.x +=
        _simplex3D(x * frequency, y * frequency, t) * x * amplitude;

      noiseValue.y +=
        _simplex3D(y * frequency, (z ?? x) * frequency, t) * y * amplitude;

      if (z === undefined) return noiseValue;

      noiseValue.z +=
        _simplex3D(z * frequency, x * frequency, t) * z * amplitude;

      if (w !== undefined) {
        noiseValue.w +=
          _simplex3D(w * frequency, y * frequency, t) * w * amplitude;
        return noiseValue;
      }

      return color
        ? color.setFromVector3(noiseValue as unknown as Vector3)
        : noiseValue;
    };
  }

  /**
   * Internal wrapper for applying noise to scalar values.
   * @private
   * @param stepFunction - Function that provides the base scalar at each step
   * @returns Step function that applies noise to scalars
   */
  private _scalarWrapper(stepFunction: SpanStepFunction<Scalar>) {
    let t = 0;
    let timer = 0;
    return (step: number) => {
      if ((timer += Math.abs(step)) >= this.cycle) {
        timer = 0;
        t += 0.001 * this.speed;
      }
      const value = stepFunction(step).value;
      return (
        value + this._simplex2D(value * this.frequency, t) * this.amplitude
      );
    };
  }

  /**
   * Serializes the noise generator configuration to JSON.
   * @returns JSON representation of the noise configuration
   */
  toJSON() {
    return {
      seed: this._seed,
      frequency: this.frequency !== 1 ? this.frequency : undefined,
      amplitude: this.amplitude !== 1 ? this.amplitude : undefined,
      cycles: this.cycle !== 1 ? this.cycle : undefined,
      speed: this.speed !== 0.1 ? this.speed : undefined,
    };
  }

  /**
   * Deserializes and applies noise configuration from JSON.
   * @param JSON - JSON configuration to apply
   */
  fromJSON(JSON: SpanNoiseParams) {
    this.set(JSON);
  }

  /**
   * Creates a SpanNoise instance from either existing instance or parameters.
   * @param noise - Existing SpanNoise instance or configuration parameters
   * @returns New or existing SpanNoise instance
   */
  static create(noise: SpanNoise | SpanNoiseParams): SpanNoise {
    return noise instanceof SpanNoise ? noise : new SpanNoise(noise);
  }
}
