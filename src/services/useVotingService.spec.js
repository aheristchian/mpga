import { describe, it, expect } from 'vitest';
import {
  calculateVotingThreshold,
  calculateMaxVotesPerCandidate,
  clampVotes,
} from './useVotingService';

describe('useVotingService', () => {
  describe('calculateVotingThreshold', () => {
    it('calculates threshold with ceil rounding (Godfather mode)', () => {
      expect(calculateVotingThreshold(10, 'ceil')).toBe(5);
      expect(calculateVotingThreshold(9, 'ceil')).toBe(5);
      expect(calculateVotingThreshold(8, 'ceil')).toBe(4);
      expect(calculateVotingThreshold(7, 'ceil')).toBe(4);
      expect(calculateVotingThreshold(1, 'ceil')).toBe(1);
      expect(calculateVotingThreshold(0, 'ceil')).toBe(0);
    });

    it('calculates threshold with half / round rounding (Classic mode)', () => {
      expect(calculateVotingThreshold(10, 'half')).toBe(5);
      expect(calculateVotingThreshold(9, 'half')).toBe(5);
      expect(calculateVotingThreshold(8, 'half')).toBe(4);
      expect(calculateVotingThreshold(7, 'half')).toBe(4);
      expect(calculateVotingThreshold(5, 'half')).toBe(3);
    });

    it('calculates threshold with floor rounding', () => {
      expect(calculateVotingThreshold(9, 'floor')).toBe(4);
      expect(calculateVotingThreshold(7, 'floor')).toBe(3);
    });
  });

  describe('calculateMaxVotesPerCandidate', () => {
    it('enforces alive - 1 rule (player under vote cannot vote for themselves)', () => {
      expect(calculateMaxVotesPerCandidate(10)).toBe(9);
      expect(calculateMaxVotesPerCandidate(8)).toBe(7);
      expect(calculateMaxVotesPerCandidate(4)).toBe(3);
      expect(calculateMaxVotesPerCandidate(2)).toBe(1);
    });

    it('handles edge cases where aliveCount is 1 or 0', () => {
      expect(calculateMaxVotesPerCandidate(1)).toBe(0);
      expect(calculateMaxVotesPerCandidate(0)).toBe(0);
    });
  });

  describe('clampVotes', () => {
    it('clamps increment within [0, alive - 1]', () => {
      // 8 alive -> max 7
      expect(clampVotes(0, 1, 8)).toBe(1);
      expect(clampVotes(6, 1, 8)).toBe(7);
      expect(clampVotes(7, 1, 8)).toBe(7); // should not exceed 7
      expect(clampVotes(10, 1, 8)).toBe(7);
    });

    it('clamps decrement to minimum 0', () => {
      expect(clampVotes(1, -1, 8)).toBe(0);
      expect(clampVotes(0, -1, 8)).toBe(0);
      expect(clampVotes(0, -5, 8)).toBe(0);
    });
  });
});
