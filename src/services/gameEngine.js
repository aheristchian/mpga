import { mockAbilities } from '../data/abilities';

/**
 * Resolves all night actions based on their priority in descending order (highest executes first).
 *
 * Standardized Priority Scale:
 * - 99: Passive Immunity & Sixth Sense (Shields, Unlimited Shields)
 * - 90: Blocks & Buys (Matador Block, Saul Goodman Bribe)
 * - 80: Medical Treatments & Saves (Doctor Treat)
 * - 70: Lethal Night Shots (Godfather Shot, Leon Vigilante Shot)
 * - 50: Inquiries & Allegiances (Detective Inquiry, Nostradamus Choice)
 * - 10: Revivals (Constantine Revival)
 *
 * @param {Array} players - Array of player objects with roles.
 * @param {Object} actionMap - Key: Player Name (actor), Value: Player Name (target) or Action Payload Object
 * @returns {Object} result - { deaths: Array, revived: Array, log: Array }
 */
export const resolveNight = (players, actionMap) => {
  const log = [];
  const killedThisNight = new Set();
  const revivedThisNight = new Set();
  const blockedPlayers = new Set(); // Prevented from using abilities
  const treatedPlayers = new Set(); // Saved from kills

  // Extract and enrich actions with priority data
  const actions = [];
  for (const [actorName, actionValue] of Object.entries(actionMap)) {
    if (!actionValue) continue; // Skip empty actions

    let targetName = null;
    let explicitAbilityId = null;

    if (typeof actionValue === 'string') {
      targetName = actionValue;
    } else if (typeof actionValue === 'object') {
      targetName = actionValue.target || null;
      explicitAbilityId = actionValue.actionId || actionValue.abilityId || null;
    }

    if (!targetName) continue;

    const actor = players.find((p) => p.name === actorName);
    const target = players.find((p) => p.name === targetName);

    if (!actor || !target || actor.isDead) continue;

    // Determine the active ability
    const activeAbilities = actor.role?.abilityIds || [];
    const targetAbilityId = explicitAbilityId || activeAbilities[0];
    if (!targetAbilityId) continue;

    const ability = mockAbilities.find((a) => a.id === targetAbilityId);
    if (!ability) continue;

    actions.push({
      actor,
      target,
      ability,
      priority: ability.priority ?? 50,
    });
  }

  // Sort actions descending by priority (higher priority number executes first: 99 > 90 > 80 > 70 > 50 > 10)
  actions.sort((a, b) => b.priority - a.priority);

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
        killedThisNight.add(target.name);
        break;

      case 'vigillante-shot':
        // If Leon shoots Town citizen, Leon dies from penalty/guilt and the innocent target survives
        if (target.role?.sideId === 'town') {
          log.push(
            `[LEON_PENALTY] ${actor.name} (Leon) shot innocent Town citizen ${target.name}. Leon suffers fatal penalty/guilt, and ${target.name} survives.`
          );
          killedThisNight.add(actor.name);
        } else {
          // Leon shot Mafia or Third-Party
          log.push(
            `[VIGILANTE_HIT] ${actor.name} (Leon) successfully shot suspect ${target.name} (${target.role?.sideId || 'mafia'}).`
          );
          killedThisNight.add(target.name);
        }
        break;

      case 'investigate':
        // Expose side info in the log for the moderator (Godfather appears clean/innocent)
        if (target.role?.id === 'godfather') {
          log.push(
            `[INQUIRY] ${actor.name} (Detective) investigated ${target.name} (Godfather). Result: Innocent/Clean (Town).`
          );
        } else {
          const isGuilty = target.role?.sideId === 'mafia';
          log.push(
            `[INQUIRY] ${actor.name} (Detective) investigated ${target.name}. Result: ${
              isGuilty ? 'Guilty (Mafia)' : 'Innocent (Town)'
            }.`
          );
        }
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
