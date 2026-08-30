import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildTimelineSteps, useMatchReplay } from './useMatchReplay';

describe('Match Replay Engine (useMatchReplay.js)', () => {
  const initialPlayers = [
    { name: 'Ali', role: { id: 'godfather', sideId: 'mafia' } },
    { name: 'Sarah', role: { id: 'doctor', sideId: 'town' } },
    { name: 'Reza', role: { id: 'detective', sideId: 'town' } },
    { name: 'Mona', role: { id: 'citizen', sideId: 'town' } },
  ];

  const mockGameLogs = [
    {
      id: 'log-1',
      day: 1,
      phase: 'day',
      type: 'day',
      title: 'Speaker Turn: Ali',
      detail: 'Ali spoke for 40 seconds.',
      timestamp: '12:00:01',
    },
    {
      id: 'log-2',
      day: 1,
      phase: 'day',
      type: 'day',
      title: 'Challenge Speech: Sarah',
      detail: 'Sarah challenged Ali for 25s.',
      player: 'Sarah',
      timestamp: '12:01:00',
    },
    {
      id: 'log-3',
      day: 1,
      phase: 'voting',
      type: 'voting',
      title: 'Defense Voting',
      detail: 'Mona received 3 votes and was eliminated.',
      target: 'Mona',
      timestamp: '12:05:00',
    },
    {
      id: 'log-4',
      day: 1,
      phase: 'night',
      type: 'night',
      title: 'Doctor Treatment',
      detail: 'Doctor treated Reza.',
      player: 'Sarah',
      target: 'Reza',
      timestamp: '12:10:00',
    },
    {
      id: 'log-5',
      day: 1,
      phase: 'night',
      type: 'night',
      title: 'Night Elimination',
      detail: 'Ali shot Reza but Reza was saved by Doctor shield!',
      target: 'Reza',
      timestamp: '12:12:00',
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds chronological steps correctly from raw logs', () => {
    // Note: mockGameLogs in gameStore are unshifted (newest first).
    // Let's pass them as unshifted array
    const unshiftedLogs = [...mockGameLogs].reverse();
    const steps = buildTimelineSteps(initialPlayers, unshiftedLogs);

    expect(steps.length).toBe(6); // Step 0 (setup) + 5 events
    expect(steps[0].index).toBe(0);
    expect(steps[0].phase).toBe('setup');
    expect(steps[0].roster.every((p) => !p.isDead)).toBe(true);

    // Step 1: Ali speaks
    expect(steps[1].day).toBe(1);
    expect(steps[1].title).toBe('Speaker Turn: Ali');
    expect(steps[1].activePlayerNames).toContain('Ali');

    // Step 3: Mona eliminated
    expect(steps[3].title).toBe('Defense Voting');
    const monaAtStep3 = steps[3].roster.find((p) => p.name === 'Mona');
    expect(monaAtStep3.isDead).toBe(true);

    // Step 5: Reza saved
    const rezaAtStep5 = steps[5].roster.find((p) => p.name === 'Reza');
    expect(rezaAtStep5.isDead).toBe(false);
  });

  it('provides reactive scrubber navigation controls', () => {
    const unshiftedLogs = [...mockGameLogs].reverse();
    const replay = useMatchReplay(initialPlayers, unshiftedLogs);

    expect(replay.totalSteps.value).toBe(6);
    expect(replay.currentStepIndex.value).toBe(0);
    expect(replay.currentSnapshot.value.phase).toBe('setup');

    replay.nextStep();
    expect(replay.currentStepIndex.value).toBe(1);

    replay.goToStep(4);
    expect(replay.currentStepIndex.value).toBe(4);

    replay.prevStep();
    expect(replay.currentStepIndex.value).toBe(3);

    replay.lastStep();
    expect(replay.currentStepIndex.value).toBe(5);

    replay.firstStep();
    expect(replay.currentStepIndex.value).toBe(0);
  });

  it('supports automatic playback and speed adjustments', () => {
    const unshiftedLogs = [...mockGameLogs].reverse();
    const replay = useMatchReplay(initialPlayers, unshiftedLogs);

    replay.play();
    expect(replay.isPlaying.value).toBe(true);

    vi.advanceTimersByTime(1700);
    expect(replay.currentStepIndex.value).toBe(1);

    replay.setSpeed(2);
    expect(replay.playbackSpeed.value).toBe(2);

    vi.advanceTimersByTime(900);
    expect(replay.currentStepIndex.value).toBe(2);

    replay.pause();
    expect(replay.isPlaying.value).toBe(false);
  });
});
