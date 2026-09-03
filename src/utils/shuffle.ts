/**
 * Unbiased Fisher-Yates (Knuth) array shuffle algorithm.
 * Replaces statistically biased `array.sort(() => Math.random() - 0.5)`.
 *
 * @param array - The source array to shuffle (does not mutate source)
 * @returns A new shuffled array
 */
export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
