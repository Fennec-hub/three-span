/**
 * Checks if the provided value satisfies the specified type predicate.
 *
 * @param object  - The object to be checked.
 * @param isType  - The condition
 * @returns Returns true if the value satisfies the type predicate, false otherwise.
 */
export const isTypePredicate = <T>(object: any, isType: keyof T): object is T =>
  !!(object as T)?.[isType];
