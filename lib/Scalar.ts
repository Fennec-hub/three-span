import { MathUtils } from "three";

/**
 * A class representing a scalar value (a single float or number).
 * AKA `{ value: number }`
 */
export class Scalar {
  readonly isScalar = true;

  /** The scalar's numerical value. */
  value: number;

  /**
   * Creates a new Scalar instance.
   * @param {number} [value=0] - The initial value of the scalar.
   */
  constructor(value: number | { value: number } = 0) {
    this.value = typeof value === "number" ? value : value.value;
  }

  /** An `x` getter alias for `this.value` */
  get x(): number {
    return this.value;
  }

  /** An `x` setter alias for `this.value` */
  set x(value: number) {
    this.value = value;
  }

  /**
   * Sets the scalar value
   *
   * @param value - the scalar value
   * @returns `this`
   */
  set(value: number): this {
    this.value = value;
    return this;
  }

  /**
   * Linearly interpolates between this scalar and s, where alpha is the distance along the line - alpha = 0 will be this scalar, and alpha = 1 will be s.
   *
   * @param v — vector to interpolate towards.
   * @param alpha — interpolation factor in the closed interval [0, 1].
   *
   * @returns `this`
   */
  lerp(s: Scalar, alpha: number) {
    this.value = MathUtils.lerp(this.value, s.value, alpha);

    return this;
  }

  /**
   * Sets this scalar to be the scalar linearly interpolated between s1 and s2 where alpha is the distance along the line connecting the two scalars - alpha = 0 will be s1, and alpha = 1 will be s2.
   *
   * @param s1        - the starting scalar.
   * @param s2        - scalar to interpolate towards.
   * @param alpha     - interpolation factor in the closed interval [0, 1].
   *
   * @returns `this`
   */
  lerpScalars(s1: Scalar, s2: Scalar, alpha: number) {
    this.value = MathUtils.lerp(s1.value, s2.value, alpha);
    return this;
  }

  /**
   * Copy the source's value to this scalar instance
   *
   * @param source - the source scalar
   *
   * @returns `this`
   */
  copy(source: Scalar) {
    this.value = source.value;
    return this;
  }

  /**
   * Create a new Scalar instance with `this.value`
   *
   * @returns The newly cloned instance
   **/
  clone() {
    return new Scalar(this.value);
  }

  /**
   * Scalar to JSON
   * @returns a number as JSON format
   **/
  toJSON() {
    return this.value;
  }
}
