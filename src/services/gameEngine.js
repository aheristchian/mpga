import { mockAbilities } from '../data/abilities';

/**
 * Resolves all night actions based on their priority.
 *
 * Priorities based on rules:
 * 1. Choose Side (Nostradamus)
 * 2. Mafia Shot (Godfather)
 * 3. Blocks/Buys (Matador/Saul) - Applies limits to lower priority
 * 4. Vig Shot (Leon) & Treat (Doctor)
 * 5. Investigate (Detective)
 * 6. Revive (Constantine)
 *
 * @param {Array} players - Array of player objects with roles.
 * @param {Object} actionMap - Key: Player Name (actor), Value: Player Name (target)
 * @returns {Object} result - { deadPlayers: Array, log: Array }
 */
export const resolveNight = (players, actionMap) => {
  const log = [];
  const killedThisNight = new Set();
  const revivedThisNight = new Set();
  const blockedPlayers = new Set(); // Prevented from using abilities
  const treatedPlayers = new Set(); // Saved from kills

  // Extract and enrich actions with priority data
  const actions = [];
  for (const [actorName, targetName] of Object.entries(actionMap)) {
    if (!targetName) continue; // Skip empty actions

    const actor = players.find((p) => p.name === actorName);
    const target = players.find((p) => p.name === targetName);

    if (!actor || !target || actor.isDead) continue;

    // Get the actor's primary active ability (assuming 1 active per role for simplicity)
    const activeAbilities = actor.role.abilityIds || [];
    if (activeAbilities.length === 0) continue;

    const ability = mockAbilities.find((a) => a.id === activeAbilities[0]);
    if (!ability) continue;

    actions.push({
      actor,
      target,
      ability,
      priority: ability.priority,
    });
  }

  // Sort actions by priority (lowest number = happens first)
  actions.sort((a, b) => a.priority - b.priority);

  // Resolution Loop
  for (const action of actions) {
    const { actor, target, ability } = action;

    // Check if actor was blocked earlier in the resolution queue
    if (blockedPlayers.has(actor.name) && ability.id !== 'block') {
      log.push(`[BLOCKED] ${actor.name} tried to use ${ability.name} but was blocked.`);
      continue;
    }

    log.push(`[ACTION] ${actor.name} used ${ability.name} on ${target.name}`);

    switch (ability.id) {
      case 'choose-side':
        // Informational log for moderator
        log.push(`[INFO] ${actor.name} sided with ${target.name}.`);
        break;

      case 'block':
        blockedPlayers.add(target.name);
        break;

      case 'buy':
        // Specific logic for saul goodman could go here, for now it's just logged
        break;

      case 'treat':
        treatedPlayers.add(target.name);
        break;

      case 'mafia-shot':
      case 'vigillante-shot':
        // Note: Treat happens at the same priority level as Vigilante.
        // We evaluate deaths at the end to allow for saves.
        killedThisNight.add(target.name);
        break;

      case 'investigate':
        // Expose side info in the log for the moderator
        log.push(`[INFO] Detective found out ${target.name} is on team: ${target.role.sideId}`);
        break;

      case 'revive':
        revivedThisNight.add(target.name);
        break;
    }
  }

  // Final Death Calculation
  const actualDeaths = [];
  for (const name of killedThisNight) {
    if (treatedPlayers.has(name)) {
      log.push(`[SAVE] ${name} was shot, but saved by the Doctor.`);
    } else {
      // Check passive shields
      const targetPlayer = players.find((p) => p.name === name);
      const passives = targetPlayer?.role?.passiveAbilityIds || [];

      if (passives.includes('shield') || passives.includes('unlimited-shield')) {
        log.push(`[SAVE] ${name} was shot, but their shield saved them.`);
        // Note: basic shield should break after 1 use, requiring state management for the player.
        // For now, it just protects.
      } else {
        log.push(`[DEATH] ${name} was killed.`);
        actualDeaths.push(name);
      }
    }
  }

  return {
    deaths: actualDeaths,
    revived: Array.from(revivedThisNight),
    log: log,
  };
};
