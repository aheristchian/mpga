import { mockAbilities } from '../data/abilities';
import type { Player, Ability } from '../types';

export interface ActionPayload {
  target?: string;
  actionId?: string;
  abilityId?: string;
  [key: string]: any;
}

export type ActionMap = Record<string, string | ActionPayload | null | undefined>;

export interface ConvertedPlayer {
  playerName: string;
  newSideId: string;
  reason: string;
}

export interface NightResolutionResult {
  deaths: string[];
  revived: string[];
  silenced: string[];
  brokenShields: string[];
  converted: ConvertedPlayer[];
  log: string[];
}

interface QueuedAction {
  actor: Player;
  target: Player;
  ability: Ability;
  priority: number;
}

/**
 * Resolves all night actions based on their priority in descending order (highest executes first).
 *
 * Standardized Priority Scale:
 * - 99: Passive Immunity & Sixth Sense (Shields, Unlimited Shields)
 * - 90: Blocks, Buys & Silences (Matador Block, Saul Goodman Bribe, Silencer Silence)
 * - 85: Cleansing & Absolutions (Priest Absolve)
 * - 80: Medical Treatments & Bodyguard Saves (Doctor Treat, Bodyguard Protect)
 * - 70: Lethal Night Shots (Godfather Shot, Leon Vigilante Shot, Zodiac Shot)
 * - 50: Inquiries & Allegiances (Detective Inquiry, Nostradamus Choice)
 * - 10: Revivals (Constantine Revival)
 */
export const resolveNight = (players: Player[], actionMap: ActionMap): NightResolutionResult => {
  const log: string[] = [];
  const killedThisNight = new Set<string>();
  const unpreventableDeaths = new Set<string>();
  const revivedThisNight = new Set<string>();
  const silencedPlayers = new Set<string>();
  const blockedPlayers = new Set<string>(); // Prevented from using abilities
  const treatedPlayers = new Set<string>(); // Saved from kills
  const brokenShields: string[] = [];
  const converted: ConvertedPlayer[] = [];

  // Extract and enrich actions with priority data
  const actions: QueuedAction[] = [];
  for (const [actorName, rawPayload] of Object.entries(actionMap)) {
    if (!rawPayload) continue;

    const actor = players.find((p) => p.name === actorName);
    if (!actor || actor.isDead) continue;

    const targetName = typeof rawPayload === 'string' ? rawPayload : rawPayload.target;
    if (!targetName) continue;

    const target = players.find((p) => p.name === targetName);
    if (!target) continue;

    // Determine the specific ability being used
    const specifiedActionId =
      typeof rawPayload === 'object' ? rawPayload.actionId || rawPayload.abilityId : undefined;

    let ability: Ability | undefined;
    if (specifiedActionId) {
      ability = mockAbilities.find((a) => a.id === specifiedActionId);
    }
    if (!ability && actor.role?.abilityIds?.length) {
      ability = mockAbilities.find((a) => actor.role?.abilityIds.includes(a.id));
    }

    if (ability) {
      actions.push({
        actor,
        target,
        ability,
        priority: ability.priority || 50,
      });
    }
  }

  // Sort descending by priority: highest priority executes first
  actions.sort((a, b) => b.priority - a.priority);

  // Execute actions
  for (const { actor, target, ability } of actions) {
    if (blockedPlayers.has(actor.name)) {
      log.push(`[BLOCKED] ${actor.name} tried to use ${ability.id}, but was blocked.`);
      continue;
    }

    switch (ability.id) {
      case 'side-with':
        log.push(`[INFO] ${actor.name} sided with ${target.name}.`);
        break;

      case 'block':
        blockedPlayers.add(target.name);
        break;

      case 'silence':
        silencedPlayers.add(target.name);
        log.push(
          `[SILENCE] ${actor.name} (Silencer) muted ${target.name} for the upcoming day.`
        );
        break;

      case 'absolve':
        if (silencedPlayers.has(target.name)) {
          silencedPlayers.delete(target.name);
          log.push(
            `[ABSOLVE] ${actor.name} (Priest) purified ${target.name}, breaking the silence penalty!`
          );
        } else {
          log.push(
            `[ABSOLVE] ${actor.name} (Priest) granted spiritual sanctuary to ${target.name}.`
          );
        }
        break;

      case 'buy':
        if (target.role?.sideId === 'town') {
          converted.push({
            playerName: target.name,
            newSideId: 'mafia',
            reason: 'Saul Goodman buy recruitment',
          });
          log.push(
            `[BRIBE] ${actor.name} (Saul Goodman) successfully recruited ${target.name} into the Mafia!`
          );
        } else {
          log.push(
            `[BRIBE_FAILED] ${actor.name} (Saul Goodman) attempted to recruit ${target.name}, but the target could not be bought.`
          );
        }
        break;

      case 'protect':
        treatedPlayers.add(target.name);
        log.push(
          `[PROTECT] ${actor.name} (Bodyguard) guarded ${target.name} against attacks.`
        );
        break;

      case 'treat':
        treatedPlayers.add(target.name);
        break;

      case 'mafia-shot':
        killedThisNight.add(target.name);
        break;

      case 'zodiac-shot':
        log.push(
          `[ZODIAC_SHOT] ${actor.name} (Zodiac) unleashed a lethal night strike on ${target.name}.`
        );
        killedThisNight.add(target.name);
        break;

      case 'vigillante-shot':
        // If Leon shoots Town citizen, Leon dies from penalty/guilt and the innocent target survives
        if (target.role?.sideId === 'town') {
          log.push(
            `[LEON_PENALTY] ${actor.name} (Leon) shot innocent Town citizen ${target.name}. Leon suffers fatal penalty/guilt, and ${target.name} survives.`
          );
          killedThisNight.add(actor.name);
          unpreventableDeaths.add(actor.name); // Guilt penalty cannot be saved by Doctor heal
        } else {
          // Leon shot Mafia or Third-Party
          log.push(
            `[VIGILANTE_HIT] ${actor.name} (Leon) successfully shot suspect ${target.name} (${target.role?.sideId || 'mafia'}).`
          );
          killedThisNight.add(target.name);
        }
        break;

      case 'investigate':
        // Expose side info in the log for the moderator (Godfather and Zodiac appear clean/innocent)
        if (
          target.role?.id === 'godfather' ||
          target.role?.id === 'zodiac' ||
          target.role?.inquiryAppearsAs === 'town' ||
          target.role?.passiveAbilityIds?.includes('clean-inquiry')
        ) {
          log.push(
            `[INQUIRY] ${actor.name} (Detective) investigated ${target.name} (${target.role?.name || target.role?.id}). Result: Innocent/Clean (Town).`
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
  const actualDeaths: string[] = [];
  for (const name of killedThisNight) {
    if (treatedPlayers.has(name) && !unpreventableDeaths.has(name)) {
      log.push(`[SAVE] ${name} was shot, but saved by medical treatment or bodyguard protection.`);
    } else {
      // Check passive shields
      const targetPlayer = players.find((p) => p.name === name);
      const passives = targetPlayer?.role?.passiveAbilityIds || [];
      const hasShield = passives.includes('shield') && !targetPlayer?.isShieldBroken;
      const hasUnlimitedShield = passives.includes('unlimited-shield');

      if (!unpreventableDeaths.has(name) && (hasShield || hasUnlimitedShield)) {
        log.push(`[SAVE] ${name} was shot, but their shield saved them.`);
        if (hasShield && !hasUnlimitedShield) {
          brokenShields.push(name);
          log.push(`[SHIELD_BROKEN] ${name}'s bulletproof shield has shattered.`);
        }
      } else {
        log.push(`[DEATH] ${name} was killed.`);
        actualDeaths.push(name);
      }
    }
  }

  return {
    deaths: actualDeaths,
    revived: Array.from(revivedThisNight),
    silenced: Array.from(silencedPlayers),
    brokenShields,
    converted,
    log,
  };
};
