import { describe, it, expect } from 'vitest';
import {
  calculateVotingThreshold,
  calculateMaxVotesPerCandidate,
  clampVotes,
  togglePreVote,
  castFinalVote,
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

  describe('togglePreVote', () => {
    it('prevents self-voting in pre-vote', () => {
      const voterMap = {};
      const counts = { Reza: 0 };
      const res = togglePreVote('Reza', 'Reza', voterMap, counts, 10);
      expect(res.changed).toBe(false);
      expect(counts.Reza).toBe(0);
    });

    it('toggles vote on and off for a candidate (preventing spam)', () => {
      const voterMap = {};
      const counts = { Ali: 0 };

      // 1st click -> adds vote
      const res1 = togglePreVote('Reza', 'Ali', voterMap, counts, 10);
      expect(res1.changed).toBe(true);
      expect(res1.added).toBe(true);
      expect(counts.Ali).toBe(1);

      // 2nd click -> retracts vote
      const res2 = togglePreVote('Reza', 'Ali', voterMap, counts, 10);
      expect(res2.changed).toBe(true);
      expect(res2.added).toBe(false);
      expect(counts.Ali).toBe(0);

      // 3rd click -> adds vote again
      const res3 = togglePreVote('Reza', 'Ali', voterMap, counts, 10);
      expect(res3.changed).toBe(true);
      expect(res3.added).toBe(true);
      expect(counts.Ali).toBe(1);
    });

    it('allows a voter to vote for multiple different candidates in pre-vote', () => {
      const voterMap = {};
      const counts = { Ali: 0, Sara: 0 };

      togglePreVote('Reza', 'Ali', voterMap, counts, 10);
      togglePreVote('Reza', 'Sara', voterMap, counts, 10);

      expect(counts.Ali).toBe(1);
      expect(counts.Sara).toBe(1);
      expect(voterMap['reza'].has('Ali')).toBe(true);
      expect(voterMap['reza'].has('Sara')).toBe(true);
    });
  });

  describe('castFinalVote', () => {
    it('prevents self-voting in final vote', () => {
      const voterMap = {};
      const counts = { Reza: 0, Ali: 0 };
      const res = castFinalVote('Reza', 'Reza', voterMap, counts, 10);
      expect(res.changed).toBe(false);
      expect(counts.Reza).toBe(0);
    });

    it('enforces single vote total and switches defender cleanly', () => {
      const voterMap = {};
      const counts = { DefenderA: 0, DefenderB: 0 };

      // Vote Defender A
      const res1 = castFinalVote('Reza', 'DefenderA', voterMap, counts, 10);
      expect(res1.changed).toBe(true);
      expect(res1.chosenDefender).toBe('DefenderA');
      expect(counts.DefenderA).toBe(1);
      expect(counts.DefenderB).toBe(0);

      // Switch to Defender B -> Defender A decrements to 0, Defender B increments to 1
      const res2 = castFinalVote('Reza', 'DefenderB', voterMap, counts, 10);
      expect(res2.changed).toBe(true);
      expect(res2.chosenDefender).toBe('DefenderB');
      expect(counts.DefenderA).toBe(0);
      expect(counts.DefenderB).toBe(1);

      // Click Defender B again -> retracts vote
      const res3 = castFinalVote('Reza', 'DefenderB', voterMap, counts, 10);
      expect(res3.changed).toBe(true);
      expect(res3.chosenDefender).toBe(null);
      expect(counts.DefenderA).toBe(0);
      expect(counts.DefenderB).toBe(0);
    });
  });
});
