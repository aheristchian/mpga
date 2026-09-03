<template>
  <BaseModal
    :is-open="isOpen"
    max-width="max-w-4xl"
    @close="emit('close')"
  >
    <template #title>
      <div class="flex items-center gap-2.5">
        <span class="text-2xl">🎨</span>
        <div>
          <h3 class="text-lg font-black text-white tracking-wide">
            {{ $t('studio.title') }}
          </h3>
          <p class="text-xs text-gray-400 font-normal">
            {{ $t('studio.subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- SUCCESS / ERROR TOAST NOTIFICATION -->
      <div
        v-if="toastMessage"
        class="p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 animate-fade-in"
        :class="
          toastType === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
            : 'bg-red-950/80 border-red-500/60 text-red-200'
        "
      >
        <span class="flex items-center gap-2">
          <span>{{ toastType === 'success' ? '✓' : '⚠️' }}</span>
          <span>{{ toastMessage }}</span>
        </span>
        <button
          type="button"
          class="text-xs opacity-75 hover:opacity-100 p-1 cursor-pointer"
          @click="toastMessage = ''"
        >
          ✕
        </button>
      </div>

      <!-- TABS NAVIGATION -->
      <div class="flex border-b border-gray-700 gap-2">
        <button
          type="button"
          class="px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2"
          :class="
            activeTab === 'rules'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          "
          @click="activeTab = 'rules'"
        >
          <span>⏱️</span>
          <span>{{ $t('studio.tabs.rules') }}</span>
        </button>

        <button
          type="button"
          class="px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2"
          :class="
            activeTab === 'roles'
              ? 'border-amber-500 text-amber-300 bg-amber-950/30 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          "
          @click="activeTab = 'roles'"
        >
          <span>🎭</span>
          <span>{{ $t('studio.tabs.roles') }}</span>
          <span
            v-if="customRolesCount > 0"
            class="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30"
          >
            {{ customRolesCount }}
          </span>
        </button>

        <button
          type="button"
          class="px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2"
          :class="
            activeTab === 'packs'
              ? 'border-purple-500 text-purple-300 bg-purple-950/30 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          "
          @click="activeTab = 'packs'"
        >
          <span>📦</span>
          <span>{{ $t('studio.tabs.packs') }}</span>
        </button>
      </div>

      <!-- TAB 1: RULES & TIMERS -->
      <div v-if="activeTab === 'rules'" class="space-y-5">
        <!-- MODE SELECTOR -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider">
            {{ $t('studio.rules.selectMode') }}
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="mode in availableModes"
              :key="mode.id"
              type="button"
              class="p-2.5 rounded-xl border text-left rtl:text-right transition-all text-xs font-bold cursor-pointer active:scale-95"
              :class="
                selectedModeId === mode.id
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                  : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-750'
              "
              @click="loadModeToEdit(mode.id)"
            >
              <div class="truncate font-black">{{ mode.name }}</div>
              <div class="text-[10px] opacity-80 mt-0.5">{{ mode.speakingTime }}s / {{ mode.challengeTime }}s</div>
            </button>
          </div>
        </div>

        <!-- TIMERS & SLIDERS FORM -->
        <div v-if="editingMode" class="bg-gray-850 border border-gray-750 p-4 rounded-2xl space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- SPEAKING TIME -->
            <div class="space-y-1.5 bg-gray-900/70 p-3 rounded-xl border border-gray-800">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-gray-300">{{ $t('studio.rules.speakingTime') }}</span>
                <span class="font-mono text-amber-400 text-sm font-black">{{ editingMode.speakingTime }}s</span>
              </div>
              <input
                v-model.number="editingMode.speakingTime"
                type="range"
                min="30"
                max="120"
                step="5"
                class="w-full accent-amber-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>30s</span>
                <span>60s</span>
                <span>120s</span>
              </div>
            </div>

            <!-- BORROWED / CHALLENGE TIME -->
            <div class="space-y-1.5 bg-gray-900/70 p-3 rounded-xl border border-gray-800">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-gray-300">{{ $t('studio.rules.borrowedTime') }}</span>
                <span class="font-mono text-blue-400 text-sm font-black">{{ editingMode.challengeTime }}s</span>
              </div>
              <input
                v-model.number="editingMode.challengeTime"
                type="range"
                min="15"
                max="60"
                step="5"
                class="w-full accent-blue-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>15s</span>
                <span>30s</span>
                <span>60s</span>
              </div>
            </div>

            <!-- DEFENSE TIME -->
            <div class="space-y-1.5 bg-gray-900/70 p-3 rounded-xl border border-gray-800">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-gray-300">{{ $t('studio.rules.defenseTime') }}</span>
                <span class="font-mono text-emerald-400 text-sm font-black">{{ editingMode.defenseTime }}s</span>
              </div>
              <input
                v-model.number="editingMode.defenseTime"
                type="range"
                min="30"
                max="120"
                step="5"
                class="w-full accent-emerald-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>30s</span>
                <span>60s</span>
                <span>120s</span>
              </div>
            </div>
          </div>

          <!-- QUOTAS & FORMULAS -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <!-- DAILY CHALLENGES QUOTA -->
            <div class="space-y-1.5 bg-gray-900/70 p-3 rounded-xl border border-gray-800">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-gray-300">{{ $t('studio.rules.challengesPerDay') }}</span>
                <span class="font-mono text-indigo-400 text-sm font-black">
                  {{ editingMode.challengesPerDay ?? 2 }}
                </span>
              </div>
              <input
                v-model.number="editingMode.challengesPerDay"
                type="range"
                min="0"
                max="5"
                step="1"
                class="w-full accent-indigo-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>0 (None)</span>
                <span>2</span>
                <span>5 (Unlimited)</span>
              </div>
            </div>

            <!-- SPEAKER SHIFT -->
            <div class="space-y-1.5 bg-gray-900/70 p-3 rounded-xl border border-gray-800">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-gray-300">{{ $t('studio.rules.speakerShift') }}</span>
                <span class="font-mono text-purple-400 text-sm font-black">
                  +{{ editingMode.speakerShift ?? 1 }}
                </span>
              </div>
              <input
                v-model.number="editingMode.speakerShift"
                type="range"
                min="1"
                max="3"
                step="1"
                class="w-full accent-purple-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>+1 seat</span>
                <span>+2 seats</span>
                <span>+3 seats</span>
              </div>
            </div>
          </div>

          <!-- VOTING THRESHOLD ROUNDING -->
          <div class="space-y-1.5 bg-gray-900/70 p-3 rounded-xl border border-gray-800">
            <label class="block text-xs font-bold text-gray-300">
              {{ $t('studio.rules.votingThreshold') }}
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                class="p-2.5 rounded-xl border text-xs font-bold transition-all text-left rtl:text-right cursor-pointer"
                :class="
                  (editingMode.thresholdRounding || 'ceil') === 'ceil'
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                "
                @click="editingMode.thresholdRounding = 'ceil'"
              >
                <div>{{ $t('studio.rules.thresholdCeil') }}</div>
                <div class="text-[10px] opacity-75 mt-0.5">e.g. 5 of 9 votes</div>
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl border text-xs font-bold transition-all text-left rtl:text-right cursor-pointer"
                :class="
                  editingMode.thresholdRounding === 'half'
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                "
                @click="editingMode.thresholdRounding = 'half'"
              >
                <div>{{ $t('studio.rules.thresholdHalf') }}</div>
                <div class="text-[10px] opacity-75 mt-0.5">e.g. 4.5 of 9 votes</div>
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl border text-xs font-bold transition-all text-left rtl:text-right cursor-pointer"
                :class="
                  editingMode.thresholdRounding === 'floor'
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                "
                @click="editingMode.thresholdRounding = 'floor'"
              >
                <div>{{ $t('studio.rules.thresholdFloor') }}</div>
                <div class="text-[10px] opacity-75 mt-0.5">e.g. 4 of 9 votes</div>
              </button>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="button"
              class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              @click="saveModeRules"
            >
              <span>💾</span>
              <span>{{ $t('studio.rules.saveRuleChanges') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 2: ROLE STUDIO -->
      <div v-if="activeTab === 'roles'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- FORM COLUMN (7 COLS) -->
          <div class="lg:col-span-7 space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">
              {{ $t('studio.roles.createNew') }}
            </h4>

            <!-- NAME & ICON -->
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2 space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.roles.roleName') }}
                </label>
                <input
                  v-model="newRole.name"
                  type="text"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  :placeholder="$t('studio.roles.roleNamePlaceholder')"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.roles.icon') }}
                </label>
                <input
                  v-model="newRole.icon"
                  type="text"
                  maxlength="4"
                  class="w-full text-center bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-base text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <!-- QUICK EMOJI BAR -->
            <div class="flex flex-wrap gap-1.5 items-center">
              <span class="text-[10px] text-gray-400 font-medium">Suggestions:</span>
              <button
                v-for="emoji in emojiPalette"
                :key="emoji"
                type="button"
                class="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                @click="newRole.icon = emoji"
              >
                {{ emoji }}
              </button>
            </div>

            <!-- ALIGNMENT / SIDE -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.roles.alignment') }}
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  class="p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer"
                  :class="
                    newRole.side === 'town'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400 hover:text-white'
                  "
                  @click="newRole.side = 'town'"
                >
                  🛡️ {{ $t('studio.roles.alignmentTown') }}
                </button>

                <button
                  type="button"
                  class="p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer"
                  :class="
                    newRole.side === 'mafia'
                      ? 'bg-red-950/80 border-red-500 text-red-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400 hover:text-white'
                  "
                  @click="newRole.side = 'mafia'"
                >
                  🗡️ {{ $t('studio.roles.alignmentMafia') }}
                </button>

                <button
                  type="button"
                  class="p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer"
                  :class="
                    newRole.side === 'third-party'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400 hover:text-white'
                  "
                  @click="newRole.side = 'third-party'"
                >
                  🏹 {{ $t('studio.roles.alignmentThirdParty') }}
                </button>
              </div>
            </div>

            <!-- DETECTIVE INQUIRY & LIMIT -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.roles.inquiry') }}
                </label>
                <select
                  v-model="newRole.inquiry"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="town">{{ $t('studio.roles.inquiryTown') }}</option>
                  <option value="mafia">{{ $t('studio.roles.inquiryMafia') }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.roles.limit') }}
                </label>
                <input
                  v-model.number="newRole.limit"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <!-- ABILITIES CHECKLIST -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.roles.abilities') }}
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  v-for="ability in abilityOptions"
                  :key="ability.id"
                  type="button"
                  class="p-2 rounded-xl border text-[11px] font-bold text-left rtl:text-right transition-all cursor-pointer flex items-center justify-between"
                  :class="
                    newRole.abilities.includes(ability.id)
                      ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400 hover:text-white'
                  "
                  @click="toggleAbility(ability.id)"
                >
                  <span>{{ ability.icon }} {{ ability.label }}</span>
                  <span v-if="newRole.abilities.includes(ability.id)" class="text-xs">✓</span>
                </button>
              </div>
            </div>

            <!-- DESCRIPTION -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.roles.description') }}
              </label>
              <textarea
                v-model="newRole.description"
                rows="2"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                :placeholder="$t('studio.roles.descriptionPlaceholder')"
              ></textarea>
            </div>

            <!-- TACTICS -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.roles.tactics') }}
              </label>
              <textarea
                v-model="newRole.tactics"
                rows="2"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                :placeholder="$t('studio.roles.tacticsPlaceholder')"
              ></textarea>
            </div>

            <!-- SAVE BUTTON -->
            <div class="pt-2">
              <button
                type="button"
                :disabled="!newRole.name.trim()"
                class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                @click="saveRole"
              >
                <span>✨</span>
                <span>{{ $t('studio.roles.saveRole') }}</span>
              </button>
            </div>
          </div>

          <!-- CARD PREVIEW & LIBRARY COLUMN (5 COLS) -->
          <div class="lg:col-span-5 space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">
              {{ $t('studio.roles.preview') }}
            </h4>

            <!-- LIVE CARD PREVIEW -->
            <div
              class="p-4 rounded-2xl border transition-all shadow-xl space-y-3"
              :class="
                newRole.side === 'mafia'
                  ? 'bg-gradient-to-br from-red-950/60 to-gray-900 border-red-800/60'
                  : newRole.side === 'third-party'
                    ? 'bg-gradient-to-br from-amber-950/60 to-gray-900 border-amber-800/60'
                    : 'bg-gradient-to-br from-indigo-950/60 to-gray-900 border-indigo-800/60'
              "
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl p-2 bg-gray-900 rounded-xl border border-gray-750 shadow-inner">
                  {{ newRole.icon || '❓' }}
                </span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h5 class="font-black text-sm text-white truncate">
                      {{ newRole.name || 'Unnamed Role' }}
                    </h5>
                    <span
                      class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0"
                      :class="
                        newRole.side === 'mafia'
                          ? 'bg-red-900/60 text-red-300 border border-red-700/60'
                          : newRole.side === 'third-party'
                            ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60'
                            : 'bg-blue-900/60 text-blue-300 border border-blue-700/60'
                      "
                    >
                      {{ newRole.side }}
                    </span>
                  </div>
                  <div class="text-[10px] text-gray-400 mt-0.5">
                    Limit: {{ newRole.limit }} | Inquiry: {{ newRole.inquiry }}
                  </div>
                </div>
              </div>

              <!-- ABILITY TAGS -->
              <div v-if="newRole.abilities.length" class="flex flex-wrap gap-1">
                <span
                  v-for="ab in newRole.abilities"
                  :key="ab"
                  class="px-2 py-0.5 rounded-lg text-[10px] bg-gray-800 border border-gray-700 text-gray-300 font-mono"
                >
                  ⚡ {{ ab }}
                </span>
              </div>

              <p class="text-xs text-gray-300 leading-relaxed font-normal">
                {{ newRole.description || 'Enter description to see preview...' }}
              </p>

              <div
                v-if="newRole.tactics"
                class="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800 text-[11px] text-amber-300/90 italic"
              >
                💡 {{ newRole.tactics }}
              </div>
            </div>

            <!-- CUSTOM ROLES LIBRARY -->
            <div class="space-y-2 pt-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span>{{ $t('studio.roles.customRolesList', { count: customRoles.length }) }}</span>
              </h4>

              <div v-if="customRoles.length === 0" class="p-4 bg-gray-850/50 rounded-xl border border-dashed border-gray-750 text-center text-xs text-gray-500">
                No custom roles saved yet.
              </div>

              <div v-else class="space-y-2 max-h-56 overflow-y-auto pr-1">
                <div
                  v-for="role in customRoles"
                  :key="role.id"
                  class="p-2.5 bg-gray-850 border border-gray-755 rounded-xl flex items-center justify-between gap-2"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg">{{ role.icon }}</span>
                    <div class="min-w-0">
                      <div class="font-bold text-xs text-white truncate">{{ role.name }}</div>
                      <div class="text-[10px] text-gray-400 capitalize">{{ role.side }}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                    :title="$t('studio.roles.deleteRole')"
                    @click="deleteRole(role.id)"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: GAME PACKS IMPORT / EXPORT -->
      <div v-if="activeTab === 'packs'" class="space-y-6">
        <!-- EXPORT PACK -->
        <div class="p-4 bg-gray-850 border border-gray-750 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <h4 class="font-bold text-sm text-white flex items-center gap-2">
              <span>💾</span>
              <span>{{ $t('studio.packs.exportTitle') }}</span>
            </h4>
            <p class="text-xs text-gray-400 leading-relaxed">
              {{ $t('studio.packs.exportDesc') }}
            </p>
          </div>
          <button
            type="button"
            class="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
            @click="exportPack"
          >
            <span>📥</span>
            <span>{{ $t('studio.packs.exportBtn') }}</span>
          </button>
        </div>

        <!-- IMPORT PACK -->
        <div class="p-4 bg-gray-850 border border-gray-750 rounded-2xl space-y-4">
          <div class="space-y-1">
            <h4 class="font-bold text-sm text-white flex items-center gap-2">
              <span>📤</span>
              <span>{{ $t('studio.packs.importTitle') }}</span>
            </h4>
            <p class="text-xs text-gray-400 leading-relaxed">
              {{ $t('studio.packs.importDesc') }}
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <!-- FILE UPLOAD -->
            <label class="block cursor-pointer">
              <span class="text-xs font-bold text-gray-300 block mb-1">
                {{ $t('studio.packs.chooseFile') }}
              </span>
              <input
                type="file"
                accept=".json"
                class="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-indigo-300 hover:file:bg-gray-700 cursor-pointer"
                @change="handleFileUpload"
              />
            </label>
          </div>

          <!-- PASTE JSON TEXTAREA -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-gray-300">
              {{ $t('studio.packs.pasteJson') }}
            </label>
            <textarea
              v-model="importJsonText"
              rows="3"
              class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-purple-500"
              placeholder="{ &quot;version&quot;: &quot;1.0.0&quot;, &quot;modes&quot;: [...], &quot;roles&quot;: [...] }"
            ></textarea>
          </div>

          <button
            type="button"
            :disabled="!importJsonText.trim()"
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            @click="importPack"
          >
            <span>✓</span>
            <span>{{ $t('studio.packs.importBtn') }}</span>
          </button>
        </div>

        <!-- COMMUNITY PRESETS -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">
            {{ $t('studio.packs.presetsTitle') }}
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3.5 bg-gray-850 border border-gray-750 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div class="font-bold text-xs text-white">🏆 Tehran Pro League</div>
                <div class="text-[10px] text-gray-400 mt-0.5">45s turns, 1 challenge/day, strict ceil rounding</div>
              </div>
              <button
                type="button"
                class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-amber-300 text-xs font-bold rounded-lg border border-gray-700 cursor-pointer active:scale-95 transition-all"
                @click="loadPreset('tehran-pro-league')"
              >
                {{ $t('studio.packs.loadPreset') }}
              </button>
            </div>

            <div class="p-3.5 bg-gray-850 border border-gray-750 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div class="font-bold text-xs text-white">⚡ Speed Blitz (30s)</div>
                <div class="text-[10px] text-gray-400 mt-0.5">30s rapid turns, 2 daily challenges</div>
              </div>
              <button
                type="button"
                class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-indigo-300 text-xs font-bold rounded-lg border border-gray-700 cursor-pointer active:scale-95 transition-all"
                @click="loadPreset('speed-blitz-mafia')"
              >
                {{ $t('studio.packs.loadPreset') }}
              </button>
            </div>
          </div>
        </div>

        <!-- FACTORY RESET -->
        <div class="p-4 bg-red-950/30 border border-red-900/50 rounded-2xl space-y-2">
          <h4 class="font-bold text-xs text-red-300 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>{{ $t('studio.packs.resetTitle') }}</span>
          </h4>
          <p class="text-[11px] text-red-400/80 leading-relaxed">
            {{ $t('studio.packs.resetDesc') }}
          </p>
          <button
            type="button"
            class="px-3 py-2 bg-red-900/70 hover:bg-red-800 border border-red-700 text-red-100 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
            @click="resetFactoryDefaults"
          >
            {{ $t('studio.packs.resetBtn') }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '../BaseModal.vue';
import { useGamePackService } from '../../services/useGamePackService';
import type { GameMode, Role } from '../../types';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'packUpdated'): void;
}>();

const { t } = useI18n();
const packService = useGamePackService();

const activeTab = ref<'rules' | 'roles' | 'packs'>('rules');
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');
const importJsonText = ref('');

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  setTimeout(() => {
    if (toastMessage.value === message) toastMessage.value = '';
  }, 4000);
};

// TAB 1: RULES
const availableModes = ref<GameMode[]>(packService.getAllModes());
const selectedModeId = ref(availableModes.value[0]?.id || 'godfather');
const editingMode = ref<GameMode | null>(null);

const loadModeToEdit = (id: string) => {
  selectedModeId.value = id;
  const mode = availableModes.value.find((m) => m.id === id);
  if (mode) {
    editingMode.value = JSON.parse(JSON.stringify(mode));
  }
};

const saveModeRules = () => {
  if (!editingMode.value) return;
  packService.saveCustomMode(editingMode.value);
  availableModes.value = packService.getAllModes();
  showToast(t('studio.rules.rulesSaved'), 'success');
  emit('packUpdated');
};

// TAB 2: ROLE STUDIO
const customRoles = ref<Role[]>(packService.getAllRoles().filter((r) => r.id.startsWith('custom-')));
const customRolesCount = computed(() => customRoles.value.length);

const emojiPalette = ['🤠', '🕵️', '🧙', '🥷', '🤖', '👮', '🧑‍⚖️', '🎯', '🧬', '💉', '🎭', '🔮', '🛡️', '⚡'];

const abilityOptions = [
  { id: 'kill', icon: '🗡️', label: 'Lethal Shot' },
  { id: 'protect', icon: '🛡️', label: 'Heal / Shield' },
  { id: 'investigate', icon: '🔍', label: 'Detective Scan' },
  { id: 'silence', icon: '🤐', label: 'Silence Mute' },
  { id: 'block', icon: '🚫', label: 'Ability Block' },
  { id: 'revive', icon: '✨', label: 'Revive Player' },
];

const newRole = reactive<{
  name: string;
  side: 'town' | 'mafia' | 'third-party';
  icon: string;
  limit: number;
  description: string;
  tactics: string;
  abilities: string[];
  inquiry: 'town' | 'mafia';
}>({
  name: '',
  side: 'town',
  icon: '🤠',
  limit: 1,
  description: '',
  tactics: '',
  abilities: [],
  inquiry: 'town',
});

const toggleAbility = (id: string) => {
  const index = newRole.abilities.indexOf(id);
  if (index > -1) {
    newRole.abilities.splice(index, 1);
  } else {
    newRole.abilities.push(id);
  }
};

const saveRole = () => {
  if (!newRole.name.trim()) return;
  const slug = newRole.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const roleId = `custom-${slug}-${Date.now().toString().slice(-4)}`;

  const roleToSave: Role = {
    id: roleId,
    name: newRole.name.trim(),
    side: newRole.side,
    icon: newRole.icon || '❓',
    limit: newRole.limit || 1,
    description: newRole.description.trim(),
    tactics: newRole.tactics.trim(),
    abilities: [...newRole.abilities],
    inquiry: newRole.inquiry,
  };

  packService.saveCustomRole(roleToSave);
  customRoles.value = packService.getAllRoles().filter((r) => r.id.startsWith('custom-'));

  // Reset form
  newRole.name = '';
  newRole.description = '';
  newRole.tactics = '';
  newRole.abilities = [];

  showToast(t('studio.roles.roleSaved'), 'success');
  emit('packUpdated');
};

const deleteRole = (id: string) => {
  packService.deleteCustomRole(id);
  customRoles.value = packService.getAllRoles().filter((r) => r.id.startsWith('custom-'));
  emit('packUpdated');
};

// TAB 3: PACKS
const exportPack = () => {
  packService.exportPackAsJson();
  showToast('Game pack downloaded!', 'success');
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    importJsonText.value = (evt.target?.result as string) || '';
  };
  reader.readAsText(file);
};

const importPack = () => {
  if (!importJsonText.value.trim()) return;
  const success = packService.importPackFromJson(importJsonText.value);
  if (success) {
    showToast(t('studio.packs.importSuccess'), 'success');
    importJsonText.value = '';
    availableModes.value = packService.getAllModes();
    customRoles.value = packService.getAllRoles().filter((r) => r.id.startsWith('custom-'));
    emit('packUpdated');
  } else {
    showToast('Failed to import pack: invalid JSON format or schema.', 'error');
  }
};

const loadPreset = (presetId: string) => {
  const presets = packService.getPresetPacks();
  const preset = presets.find((p) => p.id === presetId);
  if (!preset) return;

  const success = packService.importPackFromJson(JSON.stringify(preset));
  if (success) {
    showToast(`Loaded preset "${preset.name}"!`, 'success');
    availableModes.value = packService.getAllModes();
    loadModeToEdit(preset.modes[0]?.id || 'godfather');
    emit('packUpdated');
  }
};

const resetFactoryDefaults = () => {
  if (confirm(t('studio.packs.resetConfirm'))) {
    packService.resetCustomizations();
    availableModes.value = packService.getAllModes();
    loadModeToEdit(availableModes.value[0]?.id || 'godfather');
    customRoles.value = [];
    showToast('Factory reset complete.', 'success');
    emit('packUpdated');
  }
};

// INITIALIZE
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      availableModes.value = packService.getAllModes();
      loadModeToEdit(selectedModeId.value);
      customRoles.value = packService.getAllRoles().filter((r) => r.id.startsWith('custom-'));
    }
  },
  { immediate: true }
);
</script>
