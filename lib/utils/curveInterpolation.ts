import {
  Color,
  Euler,
  MathUtils,
  Quaternion,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import {
  SpanCurveAxes,
  SpanCurveColor,
  SpanCurveComponent,
  SpanCurveShape,
  SpanCurveValue,
  SpanStepFunction,
} from "../types";
import { AXES, RGB } from "./constants";
import { EasingFunction } from "../easings/types";

export const curvesAxesInterpolation = <
  T extends Vector2 | Vector3 | Vector4 | Euler | Quaternion | Color
>(
  curves: SpanCurveAxes | SpanCurveColor,
  curveShape: SpanCurveShape,
  value: any,
  start: any,
  end: any
): SpanStepFunction<T> => {
  const { lerp } = MathUtils;

  const components = (value as Color).isColor ? RGB : AXES;

  const mappedCurves = components
    .map((component) => {
      const curveValue: SpanCurveValue | SpanCurveComponent | undefined = (
        curves as any
      )[component];

      if (!curveValue || value[component] == null) return null;

      let { curve, shape } =
        "curve" in curveValue
          ? curveValue
          : { curve: curveValue, shape: curveShape };

      shape = shape || curveShape;

      const easing = curveInterpolation(curve, shape);

      return [component, easing] as const;
    })
    .filter((curve) => !!curve);

  return (scale: number = 0) => {
    mappedCurves.forEach(
      ([axis, easing]) =>
        (value[axis] = lerp(start[axis], end[axis], easing(scale)))
    );

    return value as T;
  };
};

export const curveInterpolation = (
  curve: SpanCurveValue,
  curveShape: SpanCurveShape
): EasingFunction => {
  const steps = Object.keys(curve)
    .map(parseFloat)
    .sort((a, b) => a - b);
  const values = steps.map((step) => curve![step]);

  const firstStep = steps[0];
  const firstValue = values[0];
  const lastStep = steps[steps.length - 1];
  const lastValue = values[steps.length - 1];

  switch (curveShape) {
    case "smooth":
      return smoothInterpolation;

    case "linear":
      return linearInterpolation;

    default:
      return staircaseLerp;
  }

  /** .-'`'-. .-'`'-. .-'`'-. */
  function smoothInterpolation(x: number): number {
    if (x <= firstStep) return firstValue;
    if (x >= lastStep) return lastValue;

    let i = 0;
    while (x > steps[i + 1]) i++;

    const x0 = steps[i];
    const x1 = steps[i + 1];
    const y0 = values[i];
    const y1 = values[i + 1];

    const t = (x - x0) / (x1 - x0);
    const t2 = t * t;
    const t3 = t2 * t;

    const a = 2 * t3 - 3 * t2 + 1;
    const b = -2 * t3 + 3 * t2;
    const c = t3 - 2 * t2 + t;
    const d = t3 - t2;

    return (
      a * y0 + b * y1 + c * (y1 - y0) * (x1 - x0) + d * (y1 - y0) * (x1 - x0)
    );
  }

  /** /\/\/\ */
  function linearInterpolation(x: number): number {
    if (x <= firstStep) return firstValue;
    if (x >= lastStep) return lastValue;

    let i = 0;
    while (x > steps[i + 1]) i++;

    const x0 = steps[i];
    const x1 = steps[i + 1];
    const y0 = values[i];
    const y1 = values[i + 1];

    const t = (x - x0) / (x1 - x0);

    return y0 + (y1 - y0) * t;
  }

  /** _|‾|__|‾|__|‾|_  */
  function staircaseLerp(x: number): number {
    if (x <= firstStep) return firstValue;
    if (x >= lastStep) return lastValue;

    let i = 0;
    while (x > steps[i + 1]) i++;

    return values[i];
  }
};
