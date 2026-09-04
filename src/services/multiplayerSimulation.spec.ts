import { describe, it, expect, beforeEach } from 'vitest';
import { MultiplayerSimulationHost, VirtualPlayerClient } from './multiplayerSimulation';
import { resolveNight } from './gameEngine';
import { evaluateGameStatus } from './useWinCondition';
import type { Player, Role } from '../types';

describe('Multiplayer Multi-Device E2E Simulation (1 Host + 10 Virtual Players)', () => {
  let host: MultiplayerSimulationHost;
  let virtualClients: VirtualPlayerClient[];

  const playerNames = [
    'Alice',
    'Bob',
    'Charlie',
    'David',
    'Emma',
    'Frank',
    'Grace',
    'Henry',
    'Ivy',
    'Jack',
  ];

  const roles: Role[] = [
    {
      id: 'godfather',
      name: 'Godfather',
      sideId: 'mafia',
      description: 'Mafia boss',
      abilities: ['kill'],
    },
    {
      id: 'dr_lecter',
      name: 'Dr. Lecter',
      sideId: 'mafia',
      description: 'Mafia doctor',
      abilities: ['protect'],
    },
    {
      id: 'mafia_simple',
      name: 'Simple Mafia',
      sideId: 'mafia',
      description: 'Mafia member',
      abilities: [],
    },
    {
      id: 'detective',
      name: 'Detective',
      sideId: 'town',
      description: 'Investigates players',
      abilities: ['investigate'],
    },
    {
      id: 'doctor',
      name: 'Doctor',
      sideId: 'town',
      description: 'Saves players',
      abilities: ['protect'],
    },
    { id: 'armored', name: 'Armored', sideId: 'town', description: 'Has 2 lives', abilities: [] },
    {
      id: 'sniper',
      name: 'Sniper',
      sideId: 'town',
      description: 'Can shoot mafia',
      abilities: ['snipe'],
    },
    {
      id: 'citizen_1',
      name: 'Citizen',
      sideId: 'town',
      description: 'Town citizen',
      abilities: [],
    },
    {
      id: 'citizen_2',
      name: 'Citizen',
      sideId: 'town',
      description: 'Town citizen',
      abilities: [],
    },
    {
      id: 'citizen_3',
      name: 'Citizen',
      sideId: 'town',
      description: 'Town citizen',
      abilities: [],
    },
  ];

  beforeEach(() => {
    host = new MultiplayerSimulationHost('ROOM42');
    virtualClients = playerNames.map((name) => new VirtualPlayerClient(name));
  });

  it('connects 10 virtual player clients to 1 host and claims seats 1 through 10', () => {
    // 1. All 10 clients connect to host
    virtualClients.forEach((client) => {
      client.connect(host);
      expect(client.isConnected).toBe(true);
      expect(client.host).toBe(host);
    });

    expect(host.clients.size).toBe(10);

    // 2. Setup mock store in setup phase
    const mockStore: any = {
      gamePhase: 'setup',
      subPhase: 'day',
      currentDay: 1,
      players: playerNames.map((name, i) => ({
        name,
        seat: i + 1,
        role: null,
      })),
      livePlayers: [],
      eliminatedPlayer: null,
      drawnLastWordCards: [],
      isGameOver: false,
      winner: null,
    };

    // 3. Broadcast initial un-claimed setup state
    let publicState = host.broadcastPublicState(mockStore);
    expect(publicState.setupPlayers?.every((p) => p.isClaimed === false)).toBe(true);

    // 4. All 10 virtual clients claim their respective seats
    virtualClients.forEach((client) => {
      client.claimSeat();
    });

    expect(host.claimedSeats.size).toBe(10);

    // 5. Broadcast state after seat claiming
    publicState = host.broadcastPublicState(mockStore);
    expect(publicState.claimedPlayers.length).toBe(10);
    expect(publicState.setupPlayers?.every((p) => p.isClaimed === true)).toBe(true);

    // Verify each client received and synchronized the public state
    virtualClients.forEach((client) => {
      expect(client.currentPublicState?.claimedPlayers.length).toBe(10);
      expect(client.currentPublicState?.gamePhase).toBe('setup');
    });
  });

  it('guarantees complete role secrecy across all 10 virtual clients (zero leaks)', () => {
    virtualClients.forEach((client) => client.connect(host));
    virtualClients.forEach((client) => client.claimSeat());

    const assignedPlayers: Player[] = playerNames.map((name, idx) => ({
      name,
      seat: idx + 1,
      isDead: false,
      role: roles[idx],
    }));

    const mockStore: any = {
      gamePhase: 'playing',
      subPhase: 'night',
      currentDay: 1,
      players: assignedPlayers,
      livePlayers: assignedPlayers,
      eliminatedPlayer: null,
      drawnLastWordCards: [],
      isGameOver: false,
      winner: null,
    };

    // Broadcast public state and distribute private payloads
    host.broadcastPublicState(mockStore);
    host.broadcastPrivatePayloads(mockStore, true);

    // 1. Verify every client has their OWN role
    virtualClients.forEach((client, idx) => {
      expect(client.privatePayload?.name).toBe(playerNames[idx]);
      expect(client.privatePayload?.role?.name).toBe(roles[idx].name);
      expect(client.privatePayload?.role?.sideId).toBe(roles[idx].sideId);
    });

    // 2. CRITICAL AUDIT: Verify that no client's public state leaks any player's role or sideId!
    virtualClients.forEach((client) => {
      const publicState = client.currentPublicState!;
      expect(publicState.livingPlayers.length).toBe(10);

      // Living players must contain ONLY name, seat, isClaimed — NEVER role or sideId!
      publicState.livingPlayers.forEach((p: any) => {
        expect(p.role).toBeUndefined();
        expect(p.sideId).toBeUndefined();
        expect(p.secretPrivateNotes).toBeUndefined();
      });

      // All players list must also be sanitized
      publicState.allPlayers.forEach((p: any) => {
        expect(p.role).toBeUndefined();
        expect(p.sideId).toBeUndefined();
      });
    });
  });

  it('simulates daytime voting: virtual clients cast ballots and host tallies them', () => {
    virtualClients.forEach((client) => {
      client.connect(host);
      client.claimSeat();
    });

    const receivedVotes: any[] = [];
    host.onPlayerAction((action) => {
      if (action.type === 'CAST_VOTE') {
        receivedVotes.push(action);
      }
    });

    // Alice, Bob, Charlie vote for David
    // David, Emma vote for Alice
    // Frank, Grace, Henry vote for Bob
    const voteMap: Record<string, string> = {
      Alice: 'David',
      Bob: 'David',
      Charlie: 'David',
      David: 'Alice',
      Emma: 'Alice',
      Frank: 'Bob',
      Grace: 'Bob',
      Henry: 'Bob',
    };

    Object.entries(voteMap).forEach(([voter, candidate]) => {
      const client = virtualClients.find((c) => c.name === voter)!;
      client.castVote(candidate, 'pre');
    });

    expect(receivedVotes.length).toBe(8);

    // Tally votes
    const tallies: Record<string, number> = {};
    receivedVotes.forEach((v) => {
      tallies[v.candidateName] = (tallies[v.candidateName] || 0) + 1;
    });

    expect(tallies['David']).toBe(3);
    expect(tallies['Alice']).toBe(2);
    expect(tallies['Bob']).toBe(3);
  });

  it('simulates night phase: virtual clients submit actions and host resolves them with gameEngine', () => {
    virtualClients.forEach((client) => {
      client.connect(host);
      client.claimSeat();
    });

    const assignedPlayers: Player[] = playerNames.map((name, idx) => ({
      name,
      seat: idx + 1,
      isDead: false,
      role: roles[idx],
    }));

    const mockStore: any = {
      gamePhase: 'playing',
      subPhase: 'night',
      currentDay: 1,
      players: assignedPlayers,
      livePlayers: assignedPlayers,
      eliminatedPlayer: null,
      drawnLastWordCards: [],
      isGameOver: false,
      winner: null,
    };

    host.broadcastPrivatePayloads(mockStore, true);

    const receivedActions: any[] = [];
    host.onPlayerAction((action) => {
      if (action.type === 'NIGHT_ACTION') {
        receivedActions.push(action);
      }
    });

    // 1. Godfather (Alice) submits kill on Charlie
    const alice = virtualClients.find((c) => c.name === 'Alice')!;
    alice.submitNightAction('mafia-shot', 'Charlie');

    // 2. Doctor (Emma) protects Charlie (successful save!)
    const emma = virtualClients.find((c) => c.name === 'Emma')!;
    emma.submitNightAction('protect', 'Charlie');

    // 3. Detective (David) investigates Bob (Mafia Dr. Lecter)
    const david = virtualClients.find((c) => c.name === 'David')!;
    david.submitNightAction('investigate', 'Bob');

    expect(receivedActions.length).toBe(3);

    // Convert mobile actions to actionMap for pure game engine resolution
    const actionMap: Record<string, { target: string; actionId: string }> = {};
    receivedActions.forEach((act) => {
      actionMap[act.actorName] = { target: act.targetPlayerName, actionId: act.actionId };
    });

    const resolution = resolveNight(mockStore.livePlayers, actionMap);

    // Verify engine outcome: Charlie was shot by Godfather but protected by Doctor -> 0 deaths!
    expect(resolution.deaths).not.toContain('Charlie');
    expect(resolution.deaths.length).toBe(0);

    // Check log verifies save occurred and inquiry was positive for mafia
    const hasDoctorSave = resolution.log.some((l) => l.includes('Charlie') && l.includes('saved'));
    const hasGuiltyInquiry = resolution.log.some((l) => l.includes('Bob') && l.includes('Guilty'));
    expect(hasDoctorSave).toBe(true);
    expect(hasGuiltyInquiry).toBe(true);
  });

  it('handles client disconnection and reconnection without losing game integrity', () => {
    virtualClients.forEach((client) => {
      client.connect(host);
      client.claimSeat();
    });

    expect(host.clients.size).toBe(10);
    expect(host.claimedSeats.size).toBe(10);

    // Emma's phone goes into tunnel/disconnects
    const emma = virtualClients.find((c) => c.name === 'Emma')!;
    emma.disconnect();

    expect(host.clients.size).toBe(9);
    expect(host.claimedSeats.has(emma.peerId)).toBe(false);

    // Emma reconnects and re-claims her seat
    emma.connect(host);
    emma.claimSeat('Emma');

    expect(host.clients.size).toBe(10);
    expect(host.claimedSeats.get(emma.peerId)).toBe('Emma');
  });

  it('executes a complete multi-round match simulation through Game Over and winner broadcast', () => {
    virtualClients.forEach((client) => {
      client.connect(host);
      client.claimSeat();
    });

    const players: Player[] = playerNames.map((name, idx) => ({
      name,
      seat: idx + 1,
      isDead: false,
      role: roles[idx],
    }));

    const mockStore: any = {
      gamePhase: 'playing',
      subPhase: 'day',
      currentDay: 1,
      players,
      livePlayers: players,
      eliminatedPlayer: null,
      drawnLastWordCards: [],
      isGameOver: false,
      winner: null,
    };

    // Distribute roles
    host.broadcastPrivatePayloads(mockStore, true);

    // ROUND 1: Day Voting -> Eliminate Simple Mafia (Charlie)
    const charlie = mockStore.livePlayers.find((p: Player) => p.name === 'Charlie')!;
    charlie.isDead = true;
    mockStore.eliminatedPlayer = charlie;

    let evalStatus = evaluateGameStatus(mockStore.livePlayers);
    expect(evalStatus.isGameOver).toBe(false);
    expect(evalStatus.livingMafia.length).toBe(2); // Alice & Bob remaining

    // Advance to Night 1: Godfather kills Henry (Citizen 1)
    mockStore.subPhase = 'night';
    const henry = mockStore.livePlayers.find((p: Player) => p.name === 'Henry')!;
    henry.isDead = true;

    // Advance to Day 2: Eliminate Dr. Lecter (Bob)
    mockStore.subPhase = 'day';
    mockStore.currentDay = 2;
    const bob = mockStore.livePlayers.find((p: Player) => p.name === 'Bob')!;
    bob.isDead = true;

    evalStatus = evaluateGameStatus(mockStore.livePlayers);
    expect(evalStatus.isGameOver).toBe(false);
    expect(evalStatus.livingMafia.length).toBe(1); // Only Godfather (Alice) remaining

    // Advance to Night 2: Godfather kills Ivy (Citizen 2)
    mockStore.subPhase = 'night';
    const ivy = mockStore.livePlayers.find((p: Player) => p.name === 'Ivy')!;
    ivy.isDead = true;

    // Advance to Day 3: Town votes to eliminate Godfather (Alice)
    mockStore.subPhase = 'day';
    mockStore.currentDay = 3;
    const alice = mockStore.livePlayers.find((p: Player) => p.name === 'Alice')!;
    alice.isDead = true;

    // Evaluate Win Condition
    evalStatus = evaluateGameStatus(mockStore.livePlayers);
    expect(evalStatus.isGameOver).toBe(true);
    expect(evalStatus.winner).toBe('town');

    // Host updates store and broadcasts final game over state to all 10 virtual devices
    mockStore.isGameOver = true;
    mockStore.winner = 'town';
    mockStore.gamePhase = 'game-over';

    const finalPublicState = host.broadcastPublicState(mockStore);

    // Verify all 10 virtual player clients receive game over and town victory
    virtualClients.forEach((client) => {
      expect(client.currentPublicState?.isGameOver).toBe(true);
      expect(client.currentPublicState?.winner).toBe('town');
      expect(client.currentPublicState?.gamePhase).toBe('game-over');
    });

    expect(finalPublicState.isGameOver).toBe(true);
    expect(finalPublicState.winner).toBe('town');
  });
});
