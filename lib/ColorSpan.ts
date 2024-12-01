import { ColorLikeArray, ColorSpanParams } from "./types";
import { EasingFunction } from "./easings/types";
import { colorLikeToColor } from "./utils/colorLikeToColor";
import { Color } from "three";
import { Span } from "./Span";

export class ColorSpan extends Span<Color, ColorLikeArray> {
  constructor(params: ColorSpanParams = [0, 0, 0]) {
    super();
    this._value = new Color();
    this.set(params);
  }

  protected _convert(color: ColorLikeArray) {
    return colorLikeToColor(color);
  }

  protected _lerp(easingFunc: EasingFunction) {
    const start = this._start;
    const end = this._end;
    return (scale = 0) => this._value.lerpColors(start, end, easingFunc(scale));
  }

  /**
   * @static Create a new ColorSpan from the JSON object
   *
   * @returns a ColorSpan object
   */
  static fromJSON(json: ColorSpanParams) {
    return new ColorSpan(json);
  }

  /**
   * @static Check if the value is a ColorSpan instance and returns it or create a new one.
   *
   * @param value - A ColorSpan instance or its constructor's parameters.
   * @returns `ColorSpan` instance.
   */
  static create(value: ColorSpan | ColorSpanParams): ColorSpan {
    return value instanceof ColorSpan ? value : new ColorSpan(value);
  }
}
