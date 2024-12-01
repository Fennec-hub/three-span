import { SpanParams, Vector2LikeArray, Vector2SpanParams } from "./types";
import { vectorLikeToVector2 } from "./utils/vectorLikeToVector2";
import { Vector2 } from "three";
import { Span } from "./Span";
import { SpanNoise } from "./SpanNoise";

/**
 * `Vector2Span` just like {@link Vector3Span}, dynamically adjusts vector values
 * within specified ranges and/or time, depending on the configuration
 * a step can return a random vector, an array pick or a smooth interpolation
 * through an easing function or a predefined curve.
 */
export class Vector2Span extends Span<Vector2, Vector2LikeArray> {
  /**
   * Constructs a `Vector2Span` with configurable interpolation parameters.
   * @see {@link SpanParams}
   *
   * @param params - The configuration options for the vector adjustment, which can be:
   *   1. A {@link Vector2} or {@link Vector2LikeArray} as a constant value.
   *   2. `{ type: "lerp" }`      : Uses an `easing` function for smooth interpolation between `start` and `end`.
   *   3. `{ type: "random" }`    : Random vector within the range defined by `start` and `end`.
   *   4. `{ type: "randomLerp" }`: Random linear interpolation between the `start` and `end` vectors.
   *   5. `{ type: "curve" }`     : Defines interpolation via a `curve` with key steps between [0, 1].
   *                                Also support a per axis or color chanel curve.
   *
   *                  - `curveShape` (optional): Defaults to `"smooth"`. Options include:
   *                     - `"smooth"`: Cubic bezier interpolation for a smooth curve.
   *                     - `"linear"`: Linear interpolation.
   *                     - `"staircase"`: Stepwise interpolation, updating at curve segments.
   *
   *   6. `{ type: "array" }`: Selects a value from an array.
   *
   *                  - `pick` (optional): Defaults to `"randomLerp"`, with options:
   *                     - `"random"`: Random selection from the array.
   *                     - `"repeat"`: Sequentially cycles through the array.
   *                     - `"alternate"`: Alternates between forward and backward through the array.
   *
   *   7. `{ type: "gradient" }`: Gradually Interpolate the gradient values.
   *   8. {@link SpanNoise}, can be added to any type.
   *
   * @example
   * // 1. `value`, Vector2 or VectorLike  value
   * const span = new Vector2Span(new Vector2(30, 30));
   * const span = new Vector2Span([30, 30]);
   * const span = new Vector2Span().val(new Vector2(30, 30));
   *
   * // [2., 3.] `{ type: "random" }`, vector within range
   * const randomSpan = new Vector2Span({
   *    type: "random",
   *    start: [0, 0],
   *    end: [10, 10]
   * });
   *
   * const randomSpan = new Vector2Span({
   *  type: "randomLerp",
   *  start: new Vector2(),
   *  end: new Vector2(10, 10)
   * });
   *
   * const randomSpan = new Vector2Span.random(new Vector2(), Vector2(10, 10));
   *
   * // 4. `{ type: "lerp"}`, interpolation with an easing function
   * const lerpSpan = new Vector2Span({ type: "easing",
   *    start: [0, 0],
   *    end: new Vector2(10, 10),
   *    easing: "easeQuadIn"
   * });
   *
   * const lerpSpan = new Vector2Span().lerp([0, 0], new Vector2(10, 10), "easeQuadIn");
   *
   * // 5. `{ type: "curve"}`, Curve-based interpolation
   * const curve = { 0: [1, 1], 0.5: [0, 0], 1: [1, 1] };
   * const curveSpan = new Vector2Span({
   *    type: "curve",
   *    start: [0, 0],
   *    end: [10, 10],
   *    curve,
   *    curveShape: "smooth"
   * });
   *
   * const curveSpan = new Vector2Span().curve([0,0], [10, 10], curve, "smooth");
   *
   * const curvePerAxis = {
   *    x: curve,
   *    y: {
   *        curve,
   *        shape: "smooth"
   *      }
   *    }
   * };
   *
   * const curvePerAxisSpan = new Vector2Span({
   *  type: "curve",
   *  start: [0, 0],
   *  end: [10, 10],
   *  curve: curvePerAxis,
   *  curveShape: "smooth"
   * });
   *
   * const curvePerAxisSpan = new Vector2Span.curve([0, 0], [10, 10], curvePerAxis, "smooth");
   *
   * // 6. `{ type: "array"}`, Array-based selection
   * const arraySpan = new Vector2Span({
   *    type: "array",
   *    array: [[0, 0], [1, 1.5], [2, 2.6]],
   *    pick: "alternate"
   * });
   *
   * const arraySpan = new Vector2Span().array([[0, 0], [1, 1.5], [2, 2.6]], "alternate");
   *
   * // 7. `{ type: "gradient"}`, Gradient based interpolation
   * const gradient =
   * const gradientSpan = new Vector2Span({
   *    type: "gradient";
   *    steps: {
   *       0: [0, 0],
   *       0.5: [0.5, 1],
   *       1: [1, 0.5],
   *    };
   * });
   *
   * const gradientSpan = new Vector2Span().gradient({
   *    0: [0, 0],
   *    0.5: [0.5, 1],
   *    1: [1, 0.5],
   * })
   */
  constructor(params: Vector2SpanParams = [0, 0]) {
    super();
    this._value = new Vector2();
    this.set(params);
  }

  protected _convert(vector: Vector2LikeArray) {
    return vectorLikeToVector2(vector);
  }

  /**
   * @static Create a new Vector2Span from the JSON object
   *
   * @returns a Vector2Span object
   */
  static fromJSON(json: Vector2SpanParams) {
    return new Vector2Span(json);
  }

  /**
   * @static Check if the value is a Vector2Span instance and returns it or create a new one.
   *
   * @param value - A Vector2Span instance or its constructor's parameters.
   * @returns `Vector2Span` instance.
   */
  static create(value: Vector2Span | Vector2SpanParams): Vector2Span {
    return value instanceof Vector2Span ? value : new Vector2Span(value);
  }
}
