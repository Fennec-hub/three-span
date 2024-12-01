/**
 * DRY, micro optimization!
 * returns the gradient first and last key and step,
 * so they don't have to be re-evaluated in the step function.
 *
 * @param keys  - The gradient keys
 * @param steps - The gradient steps
 * @return The gradient first and last key and step
 */
export const gradientFirstLast = <T>(
  keys: number[],
  steps: Record<number, T>
): [firstKey: number, firstStep: T, lastKey: number, lastStep: T] => [
  keys[0],
  steps[keys[0]],
  keys[keys.length - 1],
  steps[keys[keys.length - 1]],
];
