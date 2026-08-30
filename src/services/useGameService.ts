import { ref } from 'vue';
import { mockRoles } from '../data/roles';
import { mockSides } from '../data/sides';
import { mockAbilities } from '../data/abilities';
import { mockPhases } from '../data/phases';
import { mockModes } from '../data/modes';
import { generateRoleGuideData, generateNightResolutionSteps } from '../data/roleGuideData';
import type {
  Role,
  Side,
  Ability,
  Phase,
  GameMode,
  HydratedRole,
  NightActionOption,
  GuideRole,
  NightResolutionStep,
} from '../types';

// A Vue Composable (conventionally starts with "use")
export function useGameService() {
  const roles = ref<Role[]>([]);
  const sides = ref<Side[]>([]);
  const abilities = ref<Ability[]>([]);
  const phases = ref<Phase[]>([]);
  const modes = ref<GameMode[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // This function simulates fetching from an API
  const fetchGameData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Simulate network delay to see loading states
      await new Promise((resolve) => setTimeout(resolve, 500));

      roles.value = mockRoles;
      sides.value = mockSides;
      abilities.value = mockAbilities;
      phases.value = mockPhases;
      modes.value = mockModes;
    } catch (err) {
      error.value = 'Failed to load game data.';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  // Helper method to "Hydrate" a role (join it with its side & full ability objects)
  const getFullRoleDetails = (roleId: string): HydratedRole | null => {
    const roleList = roles.value.length > 0 ? roles.value : mockRoles;
    const sideList = sides.value.length > 0 ? sides.value : mockSides;
    const abilityList = abilities.value.length > 0 ? abilities.value : mockAbilities;

    const role = roleList.find((r) => r.id === roleId);
    if (!role) return null;

    const side = sideList.find((s) => s.id === role.sideId) || null;
    const roleAbilities: Ability[] = (role.abilityIds || [])
      .map((id) => abilityList.find((a) => a.id === id))
      .filter((a): a is Ability => Boolean(a));
    const passiveAbilities: Ability[] = (role.passiveAbilityIds || [])
      .map((id) => abilityList.find((a) => a.id === id))
      .filter((a): a is Ability => Boolean(a));

    return {
      ...role,
      side,
      abilities: roleAbilities,
      passiveAbilities,
    };
  };

  /**
   * Declaratively resolves available night action options for a given role.
   * Derives active abilities and automatically appends the standard pass option.
   */
  const getAvailableNightActions = (
    role: Role | HydratedRole | undefined | null
  ): NightActionOption[] => {
    if (!role) return [];

    const actionList: NightActionOption[] = [];
    const abilityList = abilities.value.length > 0 ? abilities.value : mockAbilities;
    const abilityIdList = role.abilityIds || [];

    abilityIdList.forEach((abId) => {
      const ability = abilityList.find((a) => a.id === abId);
      if (ability && !ability.isPassive) {
        actionList.push({
          id: ability.id,
          nameKey: ability.actionNameKey || ability.nameKey,
          icon: ability.icon,
          descriptionKey: ability.actionDescKey || ability.descriptionKey,
          ability,
        });
      }
    });

    // Always append pass option
    actionList.push({
      id: 'pass',
      nameKey: 'nightPhase.actionPass',
      icon: '🚫',
      descriptionKey: 'nightPhase.actionPassDesc',
    });

    return actionList;
  };

  const getRoleGuideData = (): GuideRole[] => {
    const roleList = roles.value.length > 0 ? roles.value : mockRoles;
    return generateRoleGuideData(roleList);
  };

  const getNightResolutionSequence = (): NightResolutionStep[] => {
    const roleList = roles.value.length > 0 ? roles.value : mockRoles;
    const abilityList = abilities.value.length > 0 ? abilities.value : mockAbilities;
    return generateNightResolutionSteps(roleList, abilityList);
  };

  return {
    roles,
    sides,
    abilities,
    phases,
    modes,
    isLoading,
    error,
    fetchGameData,
    getFullRoleDetails,
    getAvailableNightActions,
    getRoleGuideData,
    getNightResolutionSequence,
  };
}
