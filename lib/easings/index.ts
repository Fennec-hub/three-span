const PI = Math.PI;

/**
 * The ease object provides a collection of easing functions for use with the effects
 */
export const easings = {
  linear: (value: number) => {
    return value;
  },

  quadIn: (value: number) => {
    return Math.pow(value, 2);
  },

  quadOut: (value: number) => {
    return -(Math.pow(value - 1, 2) - 1);
  },

  quadInOut: (value: number) => {
    if ((value /= 0.5) < 1) return 0.5 * Math.pow(value, 2);

    return -0.5 * ((value -= 2) * value - 2);
  },

  cubicIn: (value: number) => {
    return Math.pow(value, 3);
  },

  cubicOut: (value: number) => {
    return Math.pow(value - 1, 3) + 1;
  },

  cubicInOut: (value: number) => {
    if ((value /= 0.5) < 1) return 0.5 * Math.pow(value, 3);

    return 0.5 * (Math.pow(value - 2, 3) + 2);
  },

  quartIn: (value: number) => {
    return Math.pow(value, 4);
  },

  quartOut: (value: number) => {
    return -(Math.pow(value - 1, 4) - 1);
  },

  quartInOut: (value: number) => {
    if ((value /= 0.5) < 1) return 0.5 * Math.pow(value, 4);

    return -0.5 * ((value -= 2) * Math.pow(value, 3) - 2);
  },

  sineIn: (value: number) => {
    return -Math.cos(value * (PI / 2)) + 1;
  },

  sineOut: (value: number) => {
    return Math.sin(value * (PI / 2));
  },

  sineInOut: (value: number) => {
    return -0.5 * (Math.cos(PI * value) - 1);
  },

  expoIn: (value: number) => {
    return value === 0 ? 0 : Math.pow(2, 10 * (value - 1));
  },

  expoOut: (value: number) => {
    return value === 1 ? 1 : -Math.pow(2, -10 * value) + 1;
  },

  expoInOut: (value: number) => {
    if (value === 0) return 0;
    if (value === 1) return 1;
    if ((value /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (value - 1));

    return 0.5 * (-Math.pow(2, -10 * --value) + 2);
  },

  circIn: (value: number) => {
    return -(Math.sqrt(1 - value * value) - 1);
  },

  circOut: (value: number) => {
    return Math.sqrt(1 - Math.pow(value - 1, 2));
  },

  circInOut: (value: number) => {
    if ((value /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - value * value) - 1);

    return 0.5 * (Math.sqrt(1 - (value -= 2) * value) + 1);
  },

  backIn: (value: number) => {
    var s = 1.70158;

    return value * value * ((s + 1) * value - s);
  },

  backOut: (value: number) => {
    var s = 1.70158;

    return (value = value - 1) * value * ((s + 1) * value + s) + 1;
  },

  backInOut: (value: number) => {
    var s = 1.70158;

    if ((value /= 0.5) < 1)
      return 0.5 * (value * value * (((s *= 1.525) + 1) * value - s));

    return 0.5 * ((value -= 2) * value * (((s *= 1.525) + 1) * value + s) + 2);
  },
} as const;
