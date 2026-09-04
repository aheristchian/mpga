import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePlayerScores,
  buildStandingsFromMatches,
  useTournamentService,
  DEFAULT_TOURNAMENT_RULES,
  TOURNAMENT_RULE_PRESETS,
} from './useTournamentService';
import type { Player, GameLog, TournamentMatchRecord } from '../types';

describe('useTournamentService', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('calculatePlayerScores', () => {
    const mockPlayers: Player[] = [
      {
        name: 'Alice',
        role: { id: 'citizen', name: 'Citizen', sideId: 'town', team: 'town' } as any,
        isDead: false,
        warnings: 0,
      },
      {
        name: 'Bob',
        role: { id: 'doctor', name: 'Doctor', sideId: 'town', team: 'town' } as any,
        isDead: false,
        warnings: 1,
      },
      {
        name: 'Charlie',
        role: { id: 'godfather', name: 'Godfather', sideId: 'mafia', team: 'mafia' } as any,
        isDead: true,
        warnings: 0,
      },
      {
        name: 'Dave',
        role: {
          id: 'nostradamus',
          name: 'Nostradamus',
          sideId: 'third-party',
          team: 'third-party',
        } as any,
        isDead: false,
        warnings: 0,
      },
    ];

    it('awards base win points and survival bonuses correctly when Town wins', () => {
      const scores = calculatePlayerScores(mockPlayers, [], 'town');

      const alice = scores.find((s) => s.playerName === 'Alice');
      expect(alice).toBeDefined();
      expect(alice?.isWinner).toBe(true);
      expect(alice?.baseWinPoints).toBe(3.0);
      expect(alice?.survivalPoints).toBe(1.0);
      expect(alice?.warningPenalty).toBe(0);
      expect(alice?.totalPoints).toBe(4.0); // 3 + 1 = 4.0

      const charlie = scores.find((s) => s.playerName === 'Charlie');
      expect(charlie).toBeDefined();
      expect(charlie?.isWinner).toBe(false);
      expect(charlie?.baseWinPoints).toBe(0);
      expect(charlie?.survivalPoints).toBe(0); // Dead
      expect(charlie?.totalPoints).toBe(0);
    });

    it('deducts warning card penalties accurately', () => {
      const scores = calculatePlayerScores(mockPlayers, [], 'town');

      const bob = scores.find((s) => s.playerName === 'Bob');
      expect(bob).toBeDefined();
      expect(bob?.isWinner).toBe(true);
      expect(bob?.baseWinPoints).toBe(3.0);
      expect(bob?.survivalPoints).toBe(1.0);
      expect(bob?.warnings).toBe(1);
      expect(bob?.warningPenalty).toBe(0.5); // 1 * 0.5
      expect(bob?.totalPoints).toBe(3.5); // 3 + 1 - 0.5 = 3.5
    });

    it('awards MVP and runner-up points when assigned', () => {
      const scores = calculatePlayerScores(mockPlayers, [], 'town', {
        mvpPlayerName: 'Alice',
        secondMvpPlayerName: 'Bob',
      });

      const alice = scores.find((s) => s.playerName === 'Alice');
      expect(alice?.isMvp).toBe(true);
      expect(alice?.mvpPoints).toBe(2.0);
      expect(alice?.totalPoints).toBe(6.0); // 3 (win) + 1 (survival) + 2 (mvp) = 6.0

      const bob = scores.find((s) => s.playerName === 'Bob');
      expect(bob?.isSecondMvp).toBe(true);
      expect(bob?.mvpPoints).toBe(1.0); // second MVP
      expect(bob?.totalPoints).toBe(4.5); // 3 + 1 + 1 - 0.5 = 4.5
    });

    it('handles Nostradamus co-victory evaluation correctly', () => {
      // Nostradamus pledged to Town
      const scoresTown = calculatePlayerScores(mockPlayers, [], 'town', {
        nostradamusChoice: 'town',
      });
      const daveTown = scoresTown.find((s) => s.playerName === 'Dave');
      expect(daveTown?.isWinner).toBe(true);
      expect(daveTown?.baseWinPoints).toBe(3.0);

      // Nostradamus pledged to Mafia while Town won
      const scoresMafia = calculatePlayerScores(mockPlayers, [], 'town', {
        nostradamusChoice: 'mafia',
      });
      const daveMafia = scoresMafia.find((s) => s.playerName === 'Dave');
      expect(daveMafia?.isWinner).toBe(false);
      expect(daveMafia?.baseWinPoints).toBe(0);
    });

    it('recognizes Doctor saves from game logs', () => {
      const logs: GameLog[] = [
        {
          id: '1',
          timestamp: '',
          day: 1,
          phase: 'night',
          type: 'night',
          title: 'Night Result',
          detail: 'Doctor saved Alice from a deadly attack!',
        },
      ];

      const scores = calculatePlayerScores(mockPlayers, logs, 'town');
      const bob = scores.find((s) => s.playerName === 'Bob');
      expect(bob?.doctorSavesCount).toBe(1);
      expect(bob?.specialBonusPoints).toBe(0.5);
    });

    it('applies custom rules configuration overrides', () => {
      const customRules = {
        ...DEFAULT_TOURNAMENT_RULES,
        winPoints: 5.0,
        survivalBonus: 2.0,
      };

      const scores = calculatePlayerScores(mockPlayers, [], 'town', {
        rules: customRules,
      });

      const alice = scores.find((s) => s.playerName === 'Alice');
      expect(alice?.baseWinPoints).toBe(5.0);
      expect(alice?.survivalPoints).toBe(2.0);
      expect(alice?.totalPoints).toBe(7.0);
    });
  });

  describe('buildStandingsFromMatches', () => {
    it('aggregates multi-match records into sorted player standings', () => {
      const mockMatches: TournamentMatchRecord[] = [
        {
          id: 'm1',
          matchNumber: 1,
          timestamp: '2026-09-04T12:00:00Z',
          gameModeId: 'godfather',
          winnerFaction: 'town',
          totalDays: 3,
          scores: [
            {
              playerName: 'Alice',
              isAlive: true,
              isWinner: true,
              isMvp: true,
              isSecondMvp: false,
              warnings: 0,
              isDisqualified: false,
              baseWinPoints: 3,
              survivalPoints: 1,
              mvpPoints: 2,
              warningPenalty: 0,
              specialPoints: 0,
              totalPoints: 6.0,
            },
            {
              playerName: 'Bob',
              isAlive: true,
              isWinner: false,
              isMvp: false,
              isSecondMvp: false,
              warnings: 1,
              isDisqualified: false,
              baseWinPoints: 0,
              survivalPoints: 0,
              mvpPoints: 0,
              warningPenalty: 0.5,
              specialPoints: 0,
              totalPoints: -0.5,
            },
          ],
        },
        {
          id: 'm2',
          matchNumber: 2,
          timestamp: '2026-09-04T14:00:00Z',
          gameModeId: 'godfather',
          winnerFaction: 'mafia',
          totalDays: 4,
          scores: [
            {
              playerName: 'Alice',
              isAlive: false,
              isWinner: false,
              isMvp: false,
              isSecondMvp: false,
              warnings: 0,
              isDisqualified: false,
              baseWinPoints: 0,
              survivalPoints: 0,
              mvpPoints: 0,
              warningPenalty: 0,
              specialPoints: 0,
              totalPoints: 0,
            },
            {
              playerName: 'Bob',
              isAlive: true,
              isWinner: true,
              isMvp: true,
              isSecondMvp: false,
              warnings: 0,
              isDisqualified: false,
              baseWinPoints: 3,
              survivalPoints: 1,
              mvpPoints: 2,
              warningPenalty: 0,
              specialPoints: 0,
              totalPoints: 6.0,
            },
          ],
        },
      ];

      const standings = buildStandingsFromMatches(mockMatches);

      expect(standings).toHaveLength(2);
      expect(standings[0].playerName).toBe('Alice');
      expect(standings[0].totalPoints).toBe(6.0);
      expect(standings[0].matchesPlayed).toBe(2);
      expect(standings[0].wins).toBe(1);
      expect(standings[0].losses).toBe(1);
      expect(standings[0].winRate).toBe(50.0);
      expect(standings[0].rank).toBe(1);

      expect(standings[1].playerName).toBe('Bob');
      expect(standings[1].totalPoints).toBe(5.5); // 6.0 - 0.5 = 5.5
      expect(standings[1].matchesPlayed).toBe(2);
      expect(standings[1].wins).toBe(1);
      expect(standings[1].totalWarnings).toBe(1);
      expect(standings[1].rank).toBe(2);
    });
  });

  describe('useTournamentService composable', () => {
    it('manages recording and deleting matches with reactivity', () => {
      const service = useTournamentService();
      service.resetTournament();
      expect(service.matches.value).toHaveLength(0);

      const recorded = service.recordMatch({
        gameModeId: 'godfather',
        winnerFaction: 'town',
        totalDays: 3,
        scores: [
          {
            playerName: 'Charlie',
            isAlive: true,
            isWinner: true,
            isMvp: false,
            isSecondMvp: false,
            warnings: 0,
            isDisqualified: false,
            baseWinPoints: 3,
            survivalPoints: 1,
            mvpPoints: 0,
            warningPenalty: 0,
            specialPoints: 0,
            totalPoints: 4,
          },
        ],
      });

      expect(service.matches.value).toHaveLength(1);
      expect(service.matches.value[0].matchNumber).toBe(1);
      expect(service.standings.value).toHaveLength(1);
      expect(service.standings.value[0].playerName).toBe('Charlie');

      const deleted = service.deleteMatch(recorded.id);
      expect(deleted).toBe(true);
      expect(service.matches.value).toHaveLength(0);
      expect(service.standings.value).toHaveLength(0);
    });

    it('generates valid RFC-compliant CSV content', () => {
      const service = useTournamentService();
      service.resetTournament();
      service.recordMatch({
        gameModeId: 'classic',
        winnerFaction: 'town',
        totalDays: 2,
        scores: [
          {
            playerName: 'Zahra',
            isAlive: true,
            isWinner: true,
            isMvp: true,
            isSecondMvp: false,
            warnings: 0,
            isDisqualified: false,
            baseWinPoints: 3,
            survivalPoints: 1,
            mvpPoints: 2,
            warningPenalty: 0,
            specialPoints: 0,
            totalPoints: 6.0,
          },
        ],
      });

      const csv = service.exportAsCsv();
      expect(csv).toContain('Rank,Player Name,Matches Played,Wins,Losses');
      expect(csv).toContain('1,"Zahra",1,1,0,100%,1,0,0,6,6');
    });

    it('applies predefined rule presets correctly', () => {
      const service = useTournamentService();
      service.applyRulePreset('simplePoints');
      expect(service.scoringRules.value.winPoints).toBe(1.0);
      expect(service.scoringRules.value.survivalBonus).toBe(0.0);

      service.applyRulePreset('iranianLeague');
      expect(service.scoringRules.value.winPoints).toBe(3.0);
      expect(service.scoringRules.value.survivalBonus).toBe(1.0);
    });

    it('supports JSON export and import', () => {
      const service = useTournamentService();
      service.resetTournament();
      service.setTournamentName('Tehran Mafia Cup 2026');

      const json = service.exportAsJson();
      expect(json).toContain('Tehran Mafia Cup 2026');

      const imported = service.importFromJson(json);
      expect(imported).toBe(true);
      expect(service.tournamentName.value).toBe('Tehran Mafia Cup 2026');
    });
  });
});
