import { SpanNoise } from ".";

export type SpanNoiseParams = {
  seed?: number | string;
  frequency?: number;
  amplitude?: number;
  cycles?: number;
  speed?: number;
};

export type SpanNoiseLike = SpanNoise | SpanNoiseParams;

export type SpanNoiseBlend = "add" | "multiply" | "divide" | "subtract";
