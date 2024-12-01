import {
  Color,
  ColorRepresentation,
  Euler,
  EulerOrder,
  Quaternion,
  QuaternionLike,
  Vector2,
  Vector2Like,
  Vector3,
  Vector3Like,
  Vector4,
  Vector4Like,
} from "three";
import { Vector3Span } from "./Vector3Span";
import { EulerSpan } from "./EulerSpan";
import { ColorSpan } from "./ColorSpan";
import { Vector2Span } from "./Vector2Span";
import { Vector4Span } from "./Vector4Span";
import { QuaternionSpan } from "./QuaternionSpan";
import { EasingName } from "./easings/types";
import { SpanNoiseLike } from "./SpanNoise/types";
import { Scalar } from "./Scalar";
import { ScalarSpan } from "./ScalarSpan";

export type SpanType =
  | Scalar
  | Vector2
  | Vector3
  | Vector4
  | Euler
  | Color
  | Quaternion;

export type SpanTypeLike =
  | ScalarLike
  | Vector2LikeArray
  | Vector3LikeArray
  | Vector4LikeArray
  | EulerLikeArray
  | ColorLikeArray
  | QuaternionLikeArray;

export type SpanMethod =
  | "value"
  | "random"
  | "randomLerp"
  | "lerp"
  | "curve"
  | "gradient"
  | "array";

/** Timer-related configuration parameters */
export type SpanTimerParams = {
  /** Speed multiplier for the interpolation. Default 1. */
  speed?: number;
  /** Normalized initial delay in milliseconds. eg. a delay of `2` means 2 cycles, 0.5 means half a cycle. Default 0. */
  delay?: number;
  /** Number of repeat cycles. Default `Infinity`. */
  repeat?: number;
  /** Whether to reverse on alternate cycles. */
  alternate?: boolean;
};

export type SpanParams<TLike extends SpanTypeLike> =
  | TLike
  | (SpanTimerParams &
      (
        | {
            type: "value";
            value: TLike;
            noise?: SpanNoiseLike;
          }
        | {
            type: "lerp";
            start: TLike;
            end: TLike;
            easing?: EasingName;
            forceInteger?: boolean;
            noise?: SpanNoiseLike;
          }
        | {
            type: "randomLerp" | "random";
            start: TLike;
            end: TLike;
            forceInteger?: boolean;
            noise?: SpanNoiseLike;
          }
        | {
            type: "curve";
            start: TLike;
            end: TLike;
            curve: SpanCurve;
            curveShape?: SpanCurveShape;
            forceInteger?: boolean;
            noise?: SpanNoiseLike;
          }
        | {
            type: "gradient";
            steps: SpanGradient<TLike>;
            noise?: SpanNoiseLike;
          }
        | {
            type: "array";
            array: TLike[];
            pick?: SpanArrayPick;
            noise?: SpanNoiseLike;
          }
      ));

export type ScalarSpanParams = SpanParams<ScalarLike>;
export type Vector2SpanParams = SpanParams<Vector2LikeArray>;
export type Vector3SpanParams = SpanParams<Vector3LikeArray>;
export type Vector4SpanParams = SpanParams<Vector4LikeArray>;
export type EulerSpanParams = SpanParams<EulerLikeArray> & { slerp?: boolean };
export type QuaternionSpanParams = SpanParams<QuaternionLikeArray>;
export type ColorSpanParams = SpanParams<ColorLikeArray>;

export type ScalarSpanLike = ScalarSpan | ScalarSpanParams;
export type Vector2SpanLike = Vector2Span | Vector2SpanParams;
export type Vector3SpanLike = Vector3Span | Vector3SpanParams;
export type Vector4SpanLike = Vector4Span | Vector4SpanParams;
export type EulerSpanLike = EulerSpan | EulerSpanParams;
export type QuaternionSpanLike = QuaternionSpan | QuaternionSpanParams;
export type ColorSpanLike = ColorSpan | ColorSpanParams;

export type ScalarLike = number | { readonly value: number };
export type Vector2LikeArray = Vector2Like | [x: number, y: number];
export type Vector3LikeArray = Vector3Like | [x: number, y: number, z: number];
export type Vector4LikeArray =
  | Vector4Like
  | [x: number, y: number, z: number, w: number];

export type EulerLikeArray =
  | Euler
  | {
      readonly x: number;
      readonly y: number;
      readonly z: number;
      readonly order?: EulerOrder;
    }
  | [x: number, y: number, z: number, order?: EulerOrder];

export type QuaternionLikeArray =
  | Quaternion
  | QuaternionLike
  | [x: number, y: number, z: number, w: number];

export type ColorLikeArray =
  | ColorRepresentation
  | [r: number, g: number, b: number];

export type SpanArrayPick = "random" | "repeat" | "alternate";
export type SpanCurveShape = "smooth" | "linear" | "staircase";
export type SpanGradient<T> = Record<number, T>;
export type SpanCurve = SpanCurveValue | SpanCurveAxes | SpanCurveColor;
export type SpanCurveValue = Record<number, number>;
export type SpanCurveAxes = {
  x: SpanCurveComponent;
  y: SpanCurveComponent;
  z?: SpanCurveComponent;
  w?: SpanCurveComponent;
};
export type SpanCurveColor = {
  r: SpanCurveComponent;
  g: SpanCurveComponent;
  b: SpanCurveComponent;
};
export type SpanCurveComponent =
  | SpanCurveValue
  | { curve: SpanCurveValue; shape?: SpanCurveShape };

export type SpanStepFunction<T> = (scale?: number) => T;
