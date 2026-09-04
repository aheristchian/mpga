import { mockAbilities } from '../data/abilities';
import type { Player, Ability, UniversalAbilityDefinition, EffectPrimitive } from '../types';

export interface ActionPayload {
  target?: string;
  actionId?: string;
  abilityId?: string;
  targets?: string[];
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
  updatedAbilityCharges?: Record<string, Record<string, number | 'unlimited'>>;
}

interface QueuedAction {
  actor: Player;
  target: Player;
  ability: Ability | UniversalAbilityDefinition;
  priority: number;
  payload?: ActionPayload;
}

/**
 * Resolves all night actions based on their priority in descending order (highest executes first).
 * Supports both legacy hardcoded role behaviors and universal declarative Effect Primitives.
 *
 * Standardized Priority Scale:
 * - 99: Passive Immunity & Sixth Sense (Shields, Unlimited Shields)
 * - 90: Blocks, Buys & Silences (Block, Bribe, Silence)
 * - 85: Cleansing & Absolutions (Absolve, Fortify)
 * - 80: Medical Treatments & Saves (Treat, Protect, Patch Sandbox)
 * - 70: Lethal Night Shots (Kills, Hits, Exploit)
 * - 50: Inquiries & Allegiances (Inquiries, Scans, Allegiances)
 * - 10: Revivals (Revive)
 */
export const resolveNight = (
  players: Player[],
  actionMap: ActionMap,
  customAbilities: (Ability | UniversalAbilityDefinition)[] = []
): NightResolutionResult => {
  const log: string[] = [];
  const killedThisNight = new Set<string>();
  const unpreventableDeaths = new Set<string>();
  const revivedThisNight = new Set<string>();
  const silencedPlayers = new Set<string>();
  const blockedPlayers = new Set<string>(); // Prevented from using abilities
  const treatedPlayers = new Set<string>(); // Saved from kills
  const brokenShields: string[] = [];
  const converted: ConvertedPlayer[] = [];
  const updatedAbilityCharges: Record<string, Record<string, number | 'unlimited'>> = {};

  // Clone player charges so we can track and return changes immutably
  for (const player of players) {
    if (player.abilityCharges) {
      updatedAbilityCharges[player.name] = { ...player.abilityCharges };
    }
  }

  // Combined ability lookup pool (custom definitions take priority over default mockAbilities)
  const allAbilities = [...customAbilities, ...mockAbilities];

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

    let ability: (Ability | UniversalAbilityDefinition) | undefined;
    if (specifiedActionId) {
      ability = allAbilities.find((a) => a.id === specifiedActionId);
    }
    if (!ability && actor.role?.abilityIds?.length) {
      ability = allAbilities.find((a) => {
        return actor.role?.abilityIds.some((aid: any) => {
          const id = typeof aid === 'string' ? aid : aid?.abilityId;
          return id === a.id;
        });
      });
    }

    if (ability) {
      actions.push({
        actor,
        target,
        ability,
        priority: ability.priority || 50,
        payload: typeof rawPayload === 'object' ? rawPayload : undefined,
      });
    }
  }

  // Sort descending by priority: highest priority executes first
  actions.sort((a, b) => b.priority - a.priority);

  // Execute actions
  for (const { actor, target, ability, payload } of actions) {
    if (blockedPlayers.has(actor.name)) {
      log.push(`[BLOCKED] ${actor.name} tried to use ${ability.id}, but was blocked.`);
      continue;
    }

    const universalEffects: EffectPrimitive[] = (ability as any).effects || [];

    // --- 1. DECLARATIVE PRIMITIVE RESOLUTION (If effects are defined) ---
    if (universalEffects.length > 0) {
      for (const effect of universalEffects) {
        switch (effect.type) {
          case 'block':
            blockedPlayers.add(target.name);
            log.push(`[BLOCKED] ${actor.name} blocked ${target.name}'s action.`);
            break;

          case 'silence':
            silencedPlayers.add(target.name);
            log.push(`[SILENCE] ${actor.name} silenced ${target.name} for the upcoming day.`);
            break;

          case 'absolve':
            if (silencedPlayers.has(target.name)) {
              silencedPlayers.delete(target.name);
              log.push(`[ABSOLVE] ${actor.name} restored ${target.name}'s status.`);
            } else {
              log.push(`[ABSOLVE] ${actor.name} cleansed ${target.name}.`);
            }
            break;

          case 'protect':
            treatedPlayers.add(target.name);
            log.push(`[PROTECT] ${actor.name} shielded ${target.name} against attacks.`);
            break;

          case 'lethal_hit':
            if (effect.isUnpreventable) {
              unpreventableDeaths.add(target.name);
            }
            killedThisNight.add(target.name);
            log.push(`[LETHAL_HIT] ${actor.name} launched a lethal strike on ${target.name}.`);
            break;

          case 'convert': {
            const newSide = String(effect.value || 'mafia');
            converted.push({
              playerName: target.name,
              newSideId: newSide,
              reason: `${actor.name} recruited ${target.name}`,
            });
            log.push(`[CONVERT] ${actor.name} converted ${target.name} to ${newSide}!`);
            break;
          }

          case 'inquire': {
            const apparentSide =
              target.role?.inquiryAppearsAs ||
              (target.role as any)?.inquiryAppearsAsFactionId ||
              target.role?.sideId ||
              'town';
            log.push(`[INQUIRY] ${actor.name} scanned ${target.name}. Result: ${apparentSide}.`);
            break;
          }

          case 'count_faction_inquiry': {
            const targetNames = payload?.targets || [target.name];
            const targetSide = String(effect.value || 'mafia');
            const matchCount = targetNames.filter((tName) => {
              const p = players.find((x) => x.name === tName);
              return p?.role?.sideId === targetSide;
            }).length;
            log.push(
              `[COUNT_INQUIRY] ${actor.name} scanned ${targetNames.length} targets: ${matchCount} match ${targetSide}.`
            );
            break;
          }

          case 'revive':
            revivedThisNight.add(target.name);
            log.push(`[REVIVE] ${actor.name} revived ${target.name}!`);
            break;

          case 'status_effect':
            log.push(
              `[STATUS] ${actor.name} applied ${effect.value || 'effect'} on ${target.name}.`
            );
            break;
        }
      }
      continue;
    }

    // --- 2. BACKWARD-COMPATIBLE FALLBACK (Legacy hardcoded role behaviors) ---
    switch (ability.id) {
      case 'side-with':
        log.push(`[INFO] ${actor.name} sided with ${target.name}.`);
        break;

      case 'block':
      case 'ddos-flood':
        blockedPlayers.add(target.name);
        if (ability.id === 'ddos-flood') {
          log.push(
            `[DDOS_FLOOD] ${actor.name} (Botnet Operator) flooded ${target.name}'s node, blocking their action.`
          );
        }
        break;

      case 'silence':
      case 'credential-lock':
        silencedPlayers.add(target.name);
        if (ability.id === 'credential-lock') {
          log.push(
            `[CREDENTIAL_LOCK] ${actor.name} (Phisher) locked ${target.name}'s credentials for the upcoming day.`
          );
        } else {
          log.push(`[SILENCE] ${actor.name} (Silencer) muted ${target.name} for the upcoming day.`);
        }
        break;

      case 'absolve':
      case 'auth-restore':
        if (silencedPlayers.has(target.name)) {
          silencedPlayers.delete(target.name);
          if (ability.id === 'auth-restore') {
            log.push(
              `[AUTH_RESTORE] ${actor.name} restored credentials and unblocked ${target.name}!`
            );
          } else {
            log.push(`[ABSOLVE] ${actor.name} absolved and restored ${target.name}'s voice!`);
          }
        } else {
          if (ability.id === 'auth-restore') {
            log.push(
              `[AUTH_RESTORE] ${actor.name} verified and fortified ${target.name}'s access.`
            );
          } else {
            log.push(`[ABSOLVE] ${actor.name} blessed ${target.name}, but they were not silenced.`);
          }
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
      case 'patch-sandbox':
        treatedPlayers.add(target.name);
        if (ability.id === 'patch-sandbox') {
          log.push(
            `[PATCH_SANDBOX] ${actor.name} (Firewall) isolated ${target.name} in a secure sandbox.`
          );
        } else {
          log.push(`[PROTECT] ${actor.name} (Bodyguard) guarded ${target.name} against attacks.`);
        }
        break;

      case 'treat':
        treatedPlayers.add(target.name);
        break;

      case 'mafia-shot':
      case 'zero-day-exploit':
        if (ability.id === 'zero-day-exploit') {
          log.push(
            `[ZERO_DAY_EXPLOIT] ${actor.name} (Black-Hat) deployed zero-day payload against ${target.name}.`
          );
        }
        killedThisNight.add(target.name);
        break;

      case 'zodiac-shot':
      case 'malware-purge':
        if (ability.id === 'malware-purge') {
          log.push(
            `[MALWARE_PURGE] ${actor.name} (Rogue AI) initiated polymorphic malware purge on ${target.name}.`
          );
        } else {
          log.push(
            `[ZODIAC_SHOT] ${actor.name} (Zodiac) unleashed a lethal night strike on ${target.name}.`
          );
        }
        killedThisNight.add(target.name);
        break;

      case 'vigillante-shot':
      case 'counter-hack':
        // If shooting Town citizen, shooter dies from penalty/guilt and the innocent target survives
        if (target.role?.sideId === 'town') {
          const penaltyTag =
            ability.id === 'counter-hack' ? '[COUNTER_HACK_PENALTY]' : '[LEON_PENALTY]';
          log.push(
            `${penaltyTag} ${actor.name} compromised innocent node ${target.name}. Fatal authorization revoke triggered; ${target.name} survives.`
          );
          killedThisNight.add(actor.name);
          unpreventableDeaths.add(actor.name); // Guilt penalty cannot be saved by heal
        } else {
          // Neutralized Mafia or Third-Party
          const hitTag = ability.id === 'counter-hack' ? '[COUNTER_HACK_HIT]' : '[VIGILANTE_HIT]';
          log.push(
            `${hitTag} ${actor.name} successfully neutralized malicious node ${target.name} (${target.role?.sideId || 'mafia'}).`
          );
          killedThisNight.add(target.name);
        }
        break;

      case 'investigate':
      case 'port-scan':
        // Expose side info in the log for the moderator (Godfather, Zodiac, Zero-Day, Rogue AI appear clean/innocent)
        {
          const tag = ability.id === 'port-scan' ? '[PORT_SCAN]' : '[INQUIRY]';
          if (
            target.role?.id === 'godfather' ||
            target.role?.id === 'zodiac' ||
            target.role?.id === 'zero-day' ||
            target.role?.id === 'rogue-ai' ||
            target.role?.inquiryAppearsAs === 'town' ||
            (target.role as any)?.inquiryAppearsAsFactionId === 'town' ||
            target.role?.passiveAbilityIds?.includes('clean-inquiry')
          ) {
            log.push(
              `${tag} ${actor.name} scanned ${target.name} (${target.role?.name || target.role?.id}). Result: Innocent/Clean (Town).`
            );
          } else {
            const isGuilty = target.role?.sideId === 'mafia';
            log.push(
              `${tag} ${actor.name} scanned ${target.name}. Result: ${
                isGuilty
                  ? ability.id === 'port-scan'
                    ? 'Guilty (Mafia/Black-Hat)'
                    : 'Guilty (Mafia)'
                  : 'Innocent (Town)'
              }.`
            );
          }
        }
        break;

      case 'revive':
        revivedThisNight.add(target.name);
        break;
    }
  }

  // --- 3. FINAL DEATH & SHIELD CALCULATION ---
  const actualDeaths: string[] = [];
  for (const name of killedThisNight) {
    if (treatedPlayers.has(name) && !unpreventableDeaths.has(name)) {
      log.push(`[SAVE] ${name} was shot, but saved by medical treatment or bodyguard protection.`);
    } else {
      const targetPlayer = players.find((p) => p.name === name);
      const passives = targetPlayer?.role?.passiveAbilityIds || [];
      const charges = updatedAbilityCharges[name] || targetPlayer?.abilityCharges || {};
      const shieldKey = Object.keys(charges).find(
        (k) =>
          k === 'shield' ||
          k.toLowerCase().includes('shield') ||
          k.toLowerCase().includes('firewall') ||
          k.toLowerCase().includes('armor') ||
          k.toLowerCase().includes('invulnerable')
      );
      const shieldCharges = shieldKey ? charges[shieldKey] : undefined;

      // Check dynamic quota charges first
      if (!unpreventableDeaths.has(name) && shieldCharges !== undefined && shieldKey) {
        if (shieldCharges === 'unlimited') {
          log.push(`[SAVE] ${name} was attacked, but their unlimited shield absorbed the strike.`);
          continue;
        } else if (typeof shieldCharges === 'number' && shieldCharges > 0) {
          const nextCharges = shieldCharges - 1;
          charges[shieldKey] = nextCharges;
          updatedAbilityCharges[name] = charges;
          log.push(`[SAVE] ${name}'s shield absorbed the attack (${nextCharges} charge(s) left).`);
          if (nextCharges === 0) {
            brokenShields.push(name);
            log.push(`[SHIELD_BROKEN] ${name}'s shield has completely shattered.`);
          }
          continue;
        }
      }

      // Fallback to legacy passive flags
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
    updatedAbilityCharges:
      Object.keys(updatedAbilityCharges).length > 0 ? updatedAbilityCharges : undefined,
  };
};
