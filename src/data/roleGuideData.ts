/**
 * Comprehensive in-game guide data for roles, abilities, and resolution sequence.
 * 100% Declaratively derived from mockRoles & mockAbilities (Single Source of Truth).
 * 100% Internationalized via translation keys for English and Persian.
 */

import { mockRoles } from './roles';
import { mockAbilities } from './abilities';
import type { Role, Ability, GuideRole, GuideAbility, NightResolutionStep } from '../types';

export type { GuideRole, GuideAbility, NightResolutionStep } from '../types';

const abilityMap = new Map<string, Ability>(mockAbilities.map((a) => [a.id, a]));

export function buildGuideAbility(ability: Ability): GuideAbility {
  return {
    id: ability.id,
    nameKey: ability.nameKey,
    descKey: ability.descriptionKey,
    typeKey: ability.typeKey,
    typeColor: ability.typeColor,
    priority: ability.priority,
    icon: ability.icon,
    selfAllowed: ability.target.selfAllowed,
    livingOnly: ability.target.livingOnly,
    chargesKey: ability.chargesKey,
  };
}

export function buildGuideRole(role: Role): GuideRole {
  const allAbilityIds = [...(role.abilityIds || []), ...(role.passiveAbilityIds || [])];
  const abilities: GuideAbility[] = [];

  allAbilityIds.forEach((id) => {
    const ab = abilityMap.get(id);
    if (ab) {
      abilities.push(buildGuideAbility(ab));
    }
  });

  return {
    id: role.id,
    sideId: role.sideId,
    nameKey: role.nameKey,
    descKey: role.descriptionKey,
    badgeKey: role.badgeKey,
    svgKey: role.svgKey,
    abilities,
    tacticsKey: role.tacticsKey,
  };
}

export function generateRoleGuideData(roles: Role[] = mockRoles): GuideRole[] {
  return roles.map(buildGuideRole);
}

export const roleGuideData: GuideRole[] = generateRoleGuideData();

export const stepMetaMap: Record<
  number,
  { titleKey: string; descKey: string; icon: string; color: string }
> = {
  99: {
    titleKey: 'roleGuide.nightSteps.step1.title',
    descKey: 'roleGuide.nightSteps.step1.desc',
    icon: '🛡️',
    color: 'amber',
  },
  90: {
    titleKey: 'roleGuide.nightSteps.step2.title',
    descKey: 'roleGuide.nightSteps.step2.desc',
    icon: '🛑',
    color: 'purple',
  },
  80: {
    titleKey: 'roleGuide.nightSteps.step3.title',
    descKey: 'roleGuide.nightSteps.step3.desc',
    icon: '💉',
    color: 'emerald',
  },
  70: {
    titleKey: 'roleGuide.nightSteps.step4.title',
    descKey: 'roleGuide.nightSteps.step4.desc',
    icon: '🔫',
    color: 'red',
  },
  50: {
    titleKey: 'roleGuide.nightSteps.step5.title',
    descKey: 'roleGuide.nightSteps.step5.desc',
    icon: '🔍',
    color: 'blue',
  },
  10: {
    titleKey: 'roleGuide.nightSteps.step6.title',
    descKey: 'roleGuide.nightSteps.step6.desc',
    icon: '✨',
    color: 'yellow',
  },
  0: {
    titleKey: 'roleGuide.nightSteps.step7.title',
    descKey: 'roleGuide.nightSteps.step7.desc',
    icon: '🌅',
    color: 'amber',
  },
};

export function generateNightResolutionSteps(
  roles: Role[] = mockRoles,
  _abilities: Ability[] = mockAbilities
): NightResolutionStep[] {
  const priorityMap = new Map<number, Set<string>>();

  // Seed the standard step priorities
  [99, 90, 80, 70, 50, 10].forEach((p) => priorityMap.set(p, new Set<string>()));

  roles.forEach((role) => {
    const allIds = [...(role.abilityIds || []), ...(role.passiveAbilityIds || [])];
    allIds.forEach((abId) => {
      const ab = abilityMap.get(abId);
      if (ab && priorityMap.has(ab.priority)) {
        priorityMap.get(ab.priority)!.add(role.id);
      }
    });
  });

  const sortedPriorities = [99, 90, 80, 70, 50, 10, 0];
  let stepNumber = 1;

  return sortedPriorities.map((priority) => {
    const meta = stepMetaMap[priority] || {
      titleKey: `Priority ${priority}`,
      descKey: '',
      icon: '⚡',
      color: 'slate',
    };

    const actors = priority === 0 ? ['moderator'] : Array.from(priorityMap.get(priority) || []);

    return {
      step: stepNumber++,
      priority,
      titleKey: meta.titleKey,
      descKey: meta.descKey,
      icon: meta.icon,
      actors,
      color: meta.color,
    };
  });
}

export const nightResolutionSteps: NightResolutionStep[] = generateNightResolutionSteps();
