import { ref } from 'vue';
import { mockRoles } from '../data/roles';
import { mockSides } from '../data/sides';
import { mockAbilities } from '../data/abilities';
import { mockPhases } from '../data/phases';
import { mockModes } from '../data/modes';

// A Vue Composable (conventionally starts with "use")
export function useGameService() {
  // `ref` makes these variables "reactive". If their data changes,
  // Vue will automatically update any UI that uses them.
  const roles = ref([]);
  const sides = ref([]);
  const abilities = ref([]);
  const phases = ref([]);
  const modes = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // This function simulates fetching from an API
  const fetchGameData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Simulate network delay to see loading states
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In the future with Strapi, this will look like:
      // const response = await fetch('https://api.strapi.com/roles');
      // roles.value = await response.json();

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

  // Helper method to "Hydrate" a role (join it with its side data)
  const getFullRoleDetails = (roleId) => {
    const role = roles.value.find((r) => r.id === roleId);
    if (!role) return null;

    const side = sides.value.find((s) => s.id === role.sideId);

    // Return a new object that combines the role and its side object
    return {
      ...role,
      side: side || null,
    };
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
  };
}
