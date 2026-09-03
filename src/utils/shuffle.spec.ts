import { describe, it, expect } from 'vitest';
import { fisherYatesShuffle } from './shuffle';

describe('Fisher-Yates Shuffle', () => {
  it('preserves array length and elements', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = fisherYatesShuffle(input);

    expect(shuffled).toHaveLength(input.length);
    expect(shuffled.slice().sort((a, b) => a - b)).toEqual(input);
  });

  it('does not mutate original array', () => {
    const input = Object.freeze(['a', 'b', 'c', 'd', 'e']);
    const shuffled = fisherYatesShuffle(input);

    expect(input).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(shuffled).toHaveLength(5);
  });

  it('handles empty and single-element arrays', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
    expect(fisherYatesShuffle(['solo'])).toEqual(['solo']);
  });
});
