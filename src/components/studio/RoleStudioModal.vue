<template>
  <BaseModal :is-open="isOpen" max-width="max-w-4xl" @close="emit('close')">
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
      <div class="flex flex-wrap border-b border-gray-700 gap-1 sm:gap-2">
        <button
          type="button"
          class="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5"
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
          class="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5"
          :class="
            activeTab === 'factions'
              ? 'border-blue-500 text-blue-300 bg-blue-950/30 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          "
          @click="activeTab = 'factions'"
        >
          <span>🛡️</span>
          <span>{{ $t('studio.tabs.factions') }}</span>
          <span
            v-if="configuredFactions.length > 0"
            class="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30"
          >
            {{ configuredFactions.length }}
          </span>
        </button>

        <button
          type="button"
          class="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5"
          :class="
            activeTab === 'abilities'
              ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          "
          @click="activeTab = 'abilities'"
        >
          <span>⚡</span>
          <span>{{ $t('studio.tabs.abilities') }}</span>
          <span
            v-if="configuredAbilities.length > 0"
            class="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          >
            {{ configuredAbilities.length }}
          </span>
        </button>

        <button
          type="button"
          class="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5"
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
          class="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5"
          :class="
            activeTab === 'pipeline'
              ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          "
          @click="activeTab = 'pipeline'"
        >
          <span>⚙️</span>
          <span>{{ $t('studio.tabs.pipeline') }}</span>
        </button>

        <button
          type="button"
          class="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5"
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
                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 shadow-md'
                  : 'bg-gray-850 border-gray-750 text-gray-400 hover:text-white'
              "
              @click="loadModeToEdit(mode.id)"
            >
              <div class="truncate">{{ mode.name || mode.id }}</div>
              <div class="text-[10px] text-gray-500 mt-0.5">
                {{ mode.timeToTalk }}s talk / {{ mode.challengesPerDay }} chal
              </div>
            </button>
          </div>
        </div>

        <!-- TIMERS & THRESHOLDS EDIT FORM -->
        <div
          v-if="editingMode"
          class="bg-gray-850 border border-gray-750 rounded-2xl p-4 sm:p-5 space-y-4"
        >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.rules.speakingTime') }}
              </label>
              <input
                v-model.number="editingMode.timeToTalk"
                type="number"
                min="10"
                max="300"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.rules.borrowedTime') }}
              </label>
              <input
                v-model.number="editingMode.borrowedTimeToTalk"
                type="number"
                min="5"
                max="180"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.rules.defenseTime') }}
              </label>
              <input
                v-model.number="editingMode.defenseTimeToTalk"
                type="number"
                min="10"
                max="300"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.rules.challengesPerDay') }}
              </label>
              <input
                v-model.number="editingMode.challengesPerDay"
                type="number"
                min="0"
                max="5"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.rules.speakerShift') }}
              </label>
              <input
                v-model.number="editingMode.nextDayShift"
                type="number"
                min="0"
                max="5"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-300">
              {{ $t('studio.rules.votingThreshold') }}
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                class="p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer"
                :class="
                  editingMode.votingThresholdRounding === 'ceil'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                    : 'bg-gray-900 border-gray-750 text-gray-400 hover:text-white'
                "
                @click="editingMode.votingThresholdRounding = 'ceil'"
              >
                <div>{{ $t('studio.rules.thresholdCeil') }}</div>
                <div class="text-[10px] opacity-75 mt-0.5">e.g. 5 of 9 votes</div>
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer"
                :class="
                  editingMode.votingThresholdRounding === 'half'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                    : 'bg-gray-900 border-gray-750 text-gray-400 hover:text-white'
                "
                @click="editingMode.votingThresholdRounding = 'half'"
              >
                <div>{{ $t('studio.rules.thresholdHalf') }}</div>
                <div class="text-[10px] opacity-75 mt-0.5">e.g. 4.5 of 9 votes</div>
              </button>

              <button
                type="button"
                class="p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer"
                :class="
                  editingMode.votingThresholdRounding === 'floor'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                    : 'bg-gray-900 border-gray-750 text-gray-400 hover:text-white'
                "
                @click="editingMode.votingThresholdRounding = 'floor'"
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

      <!-- TAB 2: FACTIONS & WIN CONDITIONS -->
      <div v-if="activeTab === 'factions'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- FORM COLUMN -->
          <div
            class="lg:col-span-7 bg-gray-850 border border-gray-750 rounded-2xl p-4 sm:p-5 space-y-4"
          >
            <h4
              class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>{{ $t('studio.factions.title') }}</span>
            </h4>

            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2 space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.factions.name') }}
                </label>
                <input
                  v-model="newFaction.name"
                  type="text"
                  placeholder="e.g. Blue Team, Syndicate, Rogue AI"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.factions.badge') }}
                </label>
                <input
                  v-model="newFaction.badgeIcon"
                  type="text"
                  maxlength="4"
                  class="w-full text-center bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-base text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.factions.color') }}
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="newFaction.color"
                    type="color"
                    class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    v-model="newFaction.color"
                    type="text"
                    class="w-full bg-gray-900 border border-gray-750 rounded-xl px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.factions.alignment') }}
                </label>
                <select
                  v-model="newFaction.alignment"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="town">Town</option>
                  <option value="mafia">Mafia</option>
                  <option value="third-party">Third-Party</option>
                </select>
              </div>
            </div>

            <!-- WIN CONDITION -->
            <div class="space-y-2 pt-2 border-t border-gray-750">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.factions.winType') }}
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  class="p-2 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer"
                  :class="
                    newFaction.winConditionType === 'elimination'
                      ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400'
                  "
                  @click="newFaction.winConditionType = 'elimination'"
                >
                  ⚔️ Elimination
                </button>
                <button
                  type="button"
                  class="p-2 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer"
                  :class="
                    newFaction.winConditionType === 'parity'
                      ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400'
                  "
                  @click="newFaction.winConditionType = 'parity'"
                >
                  ⚖️ Parity
                </button>
                <button
                  type="button"
                  class="p-2 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer"
                  :class="
                    newFaction.winConditionType === 'last_standing'
                      ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400'
                  "
                  @click="newFaction.winConditionType = 'last_standing'"
                >
                  🏹 Solo Survivor
                </button>
              </div>

              <div v-if="newFaction.winConditionType === 'elimination'" class="space-y-1">
                <label class="block text-[11px] text-gray-400 font-semibold">
                  {{ $t('studio.factions.targetFactions') }}
                </label>
                <input
                  v-model="newFaction.targetFactionIds"
                  type="text"
                  placeholder="e.g. mafia, red-team"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div v-if="newFaction.winConditionType === 'parity'" class="space-y-1">
                <label class="block text-[11px] text-gray-400 font-semibold">
                  {{ $t('studio.factions.parityRatio') }}
                </label>
                <input
                  v-model.number="newFaction.minParityRatio"
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="button"
              :disabled="!newFaction.name.trim()"
              class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              @click="saveFaction"
            >
              <span>+</span>
              <span>{{ $t('studio.factions.createFaction') }}</span>
            </button>
          </div>

          <!-- LIST COLUMN -->
          <div class="lg:col-span-5 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">
              {{ $t('studio.factions.factionList', { count: configuredFactions.length }) }}
            </h4>
            <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <div
                v-for="fac in configuredFactions"
                :key="fac.id"
                class="p-3 bg-gray-850 border rounded-xl flex items-center justify-between gap-3 shadow-sm"
                :style="{ borderColor: fac.color || '#374151' }"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="text-xl">{{ fac.badgeIcon || '🛡️' }}</span>
                  <div class="min-w-0">
                    <div class="font-bold text-xs text-white truncate flex items-center gap-1.5">
                      <span>{{ fac.name }}</span>
                      <span
                        class="w-2.5 h-2.5 rounded-full inline-block"
                        :style="{ backgroundColor: fac.color }"
                      ></span>
                    </div>
                    <div class="text-[10px] text-gray-400 capitalize">
                      {{ fac.alignment }} • {{ fac.winCondition?.type || 'Standard' }}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  class="text-gray-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                  @click="deleteFaction(fac.id)"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: ABILITIES & QUOTAS -->
      <div v-if="activeTab === 'abilities'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- FORM COLUMN -->
          <div
            class="lg:col-span-7 bg-gray-850 border border-gray-750 rounded-2xl p-4 sm:p-5 space-y-4"
          >
            <h4
              class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>{{ $t('studio.abilitiesTab.title') }}</span>
            </h4>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.abilitiesTab.name') }}
                </label>
                <input
                  v-model="newAbility.name"
                  type="text"
                  placeholder="e.g. EMP Shield, Zero-Day Exploit"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.abilitiesTab.primitive') }}
                </label>
                <select
                  v-model="newAbility.primitive"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="protect">Protect (Heal / Shield)</option>
                  <option value="lethal_hit">Lethal Hit (Eliminate)</option>
                  <option value="inquire">Inquire (Inspect Alignment)</option>
                  <option value="block">Block (Prevent Action)</option>
                  <option value="silence">Silence (Prevent Speech)</option>
                  <option value="absolve">Absolve (Remove Warnings)</option>
                  <option value="revive">Revive (Resurrect)</option>
                  <option value="convert">Convert (Change Alignment)</option>
                </select>
              </div>
            </div>

            <!-- TIMING & PRIORITY -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.abilitiesTab.timing') }}
                </label>
                <select
                  v-model="newAbility.timing"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="night_action">Night Action</option>
                  <option value="passive">Passive (Continuous)</option>
                  <option value="day_action">Day Action</option>
                  <option value="on_elimination">On Elimination</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-gray-300">
                  {{ $t('studio.abilitiesTab.priority') }}
                </label>
                <input
                  v-model.number="newAbility.priority"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <!-- USAGE QUOTAS (FINITE VS UNLIMITED) -->
            <div class="space-y-2 pt-2 border-t border-gray-750">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.abilitiesTab.quotaType') }}
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer"
                  :class="
                    newAbility.quotaType === 'unlimited'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400'
                  "
                  @click="newAbility.quotaType = 'unlimited'"
                >
                  ♾️ {{ $t('studio.abilitiesTab.quotaUnlimited') }}
                </button>
                <button
                  type="button"
                  class="p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer"
                  :class="
                    newAbility.quotaType === 'finite'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-gray-900 border-gray-750 text-gray-400'
                  "
                  @click="newAbility.quotaType = 'finite'"
                >
                  🔢 {{ $t('studio.abilitiesTab.quotaFinite') }}
                </button>
              </div>

              <div v-if="newAbility.quotaType === 'finite'" class="grid grid-cols-2 gap-3 pt-1">
                <div class="space-y-1">
                  <label class="block text-[11px] text-gray-400 font-semibold">
                    {{ $t('studio.abilitiesTab.chargeCount') }}
                  </label>
                  <input
                    v-model.number="newAbility.totalCharges"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div class="space-y-1">
                  <label class="block text-[11px] text-gray-400 font-semibold"
                    >Per Phase Limit</label
                  >
                  <input
                    v-model.number="newAbility.chargesPerPhase"
                    type="number"
                    min="1"
                    max="5"
                    class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <!-- TARGET RESTRICTION -->
            <div class="space-y-1 pt-2 border-t border-gray-750">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.abilitiesTab.targetFilter') }}
              </label>
              <select
                v-model="newAbility.targetRestriction"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="any">{{ $t('studio.abilitiesTab.filterAny') }}</option>
                <option value="self_only">{{ $t('studio.abilitiesTab.filterSelfOnly') }}</option>
                <option value="exclude_self">
                  {{ $t('studio.abilitiesTab.filterExcludeSelf') }}
                </option>
              </select>
            </div>

            <button
              type="button"
              :disabled="!newAbility.name.trim()"
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              @click="saveAbility"
            >
              <span>+</span>
              <span>{{ $t('studio.abilitiesTab.createAbility') }}</span>
            </button>
          </div>

          <!-- LIST COLUMN -->
          <div class="lg:col-span-5 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">
              {{ $t('studio.abilitiesTab.abilityList', { count: configuredAbilities.length }) }}
            </h4>
            <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <div
                v-for="ab in configuredAbilities"
                :key="ab.id"
                class="p-3 bg-gray-850 border border-gray-755 rounded-xl flex items-center justify-between gap-3 shadow-sm"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="text-lg">
                    {{
                      ab.primitive === 'protect'
                        ? '🛡️'
                        : ab.primitive === 'lethal_hit'
                          ? '🗡️'
                          : ab.primitive === 'inquire'
                            ? '🔍'
                            : '⚡'
                    }}
                  </span>
                  <div class="min-w-0">
                    <div class="font-bold text-xs text-white truncate">{{ ab.name }}</div>
                    <div class="text-[10px] text-gray-400 capitalize">
                      {{ ab.primitive }} •
                      {{
                        ab.quota?.totalCharges === 'unlimited'
                          ? 'Unlimited'
                          : `${ab.quota?.totalCharges} charges`
                      }}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  class="text-gray-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                  @click="deleteAbility(ab.id)"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: ROLE STUDIO -->
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

            <!-- ALIGNMENT / FACTION -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-gray-300">
                {{ $t('studio.roles.alignment') }}
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="fac in roleFactionOptions"
                  :key="fac.id"
                  type="button"
                  class="p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 truncate"
                  :class="
                    newRole.side === fac.id
                      ? 'bg-indigo-950/80 border-indigo-400 text-white'
                      : 'bg-gray-900 border-gray-750 text-gray-400 hover:text-white'
                  "
                  :style="newRole.side === fac.id && fac.color ? { borderColor: fac.color } : {}"
                  @click="newRole.side = fac.id"
                >
                  <span>{{ fac.badgeIcon || '🛡️' }}</span>
                  <span class="truncate">{{ fac.name }}</span>
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
                  v-for="ability in combinedAbilityOptions"
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
                  <span class="truncate">{{ ability.icon }} {{ ability.label }}</span>
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
                  ? 'bg-red-950/40 border-red-500/60 shadow-red-950/40'
                  : newRole.side === 'third-party'
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-amber-950/40'
                    : 'bg-emerald-950/40 border-emerald-500/60 shadow-emerald-950/40'
              "
            >
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ newRole.icon || '❓' }}</span>
                <div class="min-w-0">
                  <div class="font-black text-sm text-white truncate">
                    {{ newRole.name || 'Role Name' }}
                  </div>
                  <div
                    class="text-[10px] uppercase font-bold tracking-wider text-gray-400 capitalize"
                  >
                    {{ newRole.side }} • max {{ newRole.limit || 1 }}
                  </div>
                </div>
              </div>

              <p class="text-xs text-gray-300 leading-relaxed italic">
                "{{ newRole.description || 'Describe role mission and night action...' }}"
              </p>

              <div v-if="newRole.abilities.length" class="flex flex-wrap gap-1">
                <span
                  v-for="abId in newRole.abilities"
                  :key="abId"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-900/60 border border-indigo-500/40 text-indigo-200"
                >
                  {{ abId }}
                </span>
              </div>
            </div>

            <!-- SAVED ROLES LIST -->
            <div class="space-y-2 pt-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">
                {{ $t('studio.roles.customRolesList', { count: customRolesCount }) }}
              </h4>

              <div
                v-if="customRoles.length === 0"
                class="p-4 bg-gray-900 border border-gray-800 rounded-xl text-center text-xs text-gray-500"
              >
                No custom roles saved yet.
              </div>

              <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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

      <!-- TAB 5: PIPELINE & THEMES -->
      <div
        v-if="activeTab === 'pipeline'"
        class="bg-gray-850 border border-gray-750 rounded-2xl p-4 sm:p-5 space-y-5"
      >
        <h4
          class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"
        >
          <span>⚙️</span>
          <span>{{ $t('studio.pipelineTab.title') }}</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- SPEAKING ORDER -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-gray-300">
              {{ $t('studio.pipelineTab.speakingOrder') }}
            </label>
            <select
              v-model="pipelineConfig.speakingOrder"
              class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="clockwise">{{ $t('studio.pipelineTab.orderClockwise') }}</option>
              <option value="counter-clockwise">
                {{ $t('studio.pipelineTab.orderCounterClockwise') }}
              </option>
              <option value="random">{{ $t('studio.pipelineTab.orderRandom') }}</option>
            </select>
          </div>

          <!-- TIE RESOLUTION -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-gray-300">
              {{ $t('studio.pipelineTab.tieResolution') }}
            </label>
            <select
              v-model="pipelineConfig.tieResolution"
              class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="roulette">{{ $t('studio.pipelineTab.tieRoulette') }}</option>
              <option value="no_elimination">
                {{ $t('studio.pipelineTab.tieNoElimination') }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- ENABLE EXIT CARDS -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-gray-300">
              {{ $t('studio.pipelineTab.enableExitCards') }}
            </label>
            <div class="flex items-center gap-3 pt-1">
              <input
                id="enable-exit-cards"
                v-model="pipelineConfig.enableExitCards"
                type="checkbox"
                class="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <label for="enable-exit-cards" class="text-xs text-gray-300 cursor-pointer">
                Allow eliminated players to draw Last Word exit cards
              </label>
            </div>
          </div>

          <!-- PENALTY LIMIT -->
          <div class="space-y-1">
            <label class="block text-xs font-bold text-gray-300">
              {{ $t('studio.pipelineTab.penaltyWarningLimit') }}
            </label>
            <input
              v-model.number="pipelineConfig.penaltyWarningLimit"
              type="number"
              min="1"
              max="5"
              class="w-full bg-gray-900 border border-gray-750 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <!-- SOUNDTRACK CUSTOMIZATION -->
        <div class="space-y-3 pt-3 border-t border-gray-750">
          <h5 class="text-xs font-bold text-gray-200">🎵 Custom Theme Music URLs</h5>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="block text-[11px] text-gray-400 font-semibold">{{
                $t('studio.pipelineTab.customTrackNight')
              }}</label>
              <input
                v-model="customSoundtracks.night"
                type="text"
                placeholder="https://.../night.mp3"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-[11px] text-gray-400 font-semibold">{{
                $t('studio.pipelineTab.customTrackDay')
              }}</label>
              <input
                v-model="customSoundtracks.day"
                type="text"
                placeholder="https://.../day.mp3"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-[11px] text-gray-400 font-semibold">{{
                $t('studio.pipelineTab.customTrackVictory')
              }}</label>
              <input
                v-model="customSoundtracks.victory"
                type="text"
                placeholder="https://.../victory.mp3"
                class="w-full bg-gray-900 border border-gray-750 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="button"
            class="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            @click="applyPipelineSettings"
          >
            <span>💾</span>
            <span>{{ $t('studio.pipelineTab.savePipeline') }}</span>
          </button>
        </div>
      </div>

      <!-- TAB 6: GAME PACKS IMPORT / EXPORT -->
      <div v-if="activeTab === 'packs'" class="space-y-6">
        <!-- EXPORT PACK -->
        <div
          class="p-4 bg-gray-850 border border-gray-750 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
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
              placeholder='{ "version": "2.0.0", "factions": [...], "abilities": [...] }'
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
            <div
              v-for="preset in availablePresets"
              :key="preset.id"
              class="p-3.5 bg-gray-850 border border-gray-750 rounded-xl flex items-center justify-between gap-3 shadow-sm"
            >
              <div class="min-w-0">
                <div class="font-bold text-xs text-white truncate">{{ preset.name }}</div>
                <div class="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
                  {{ preset.description }}
                </div>
              </div>
              <button
                type="button"
                class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-amber-300 text-xs font-bold rounded-lg border border-gray-700 cursor-pointer active:scale-95 transition-all shrink-0"
                @click="loadPreset(preset.id)"
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
import { useGameStore } from '../../stores/gameStore';
import { useAudio } from '../../services/useAudioService';
import type {
  GameMode,
  Role,
  FactionDefinition,
  AbilityDefinition,
  UniversalGamePack,
  UniversalPipelineConfig,
} from '../../types';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'packUpdated'): void;
}>();

const { t } = useI18n();
const packService = useGamePackService();
const store = useGameStore();
const audio = useAudio();

const activeTab = ref<'rules' | 'factions' | 'abilities' | 'roles' | 'pipeline' | 'packs'>('rules');
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

// TAB 2: FACTIONS
const configuredFactions = ref<FactionDefinition[]>(
  store.activeUniversalPack?.factions || [
    {
      id: 'town',
      name: 'Town (Citizens)',
      alignment: 'town',
      color: '#3b82f6',
      badgeIcon: '🛡️',
      winCondition: { type: 'elimination', targetFactionIds: ['mafia'] },
    },
    {
      id: 'mafia',
      name: 'Mafia (Syndicate)',
      alignment: 'mafia',
      color: '#ef4444',
      badgeIcon: '🕶️',
      winCondition: { type: 'parity', minParityRatio: 0.5 },
    },
  ]
);

const newFaction = reactive({
  name: '',
  badgeIcon: '🛡️',
  color: '#3b82f6',
  alignment: 'town' as 'town' | 'mafia' | 'third-party',
  winConditionType: 'elimination' as 'elimination' | 'parity' | 'last_standing',
  targetFactionIds: 'mafia',
  minParityRatio: 0.5,
});

const saveFaction = () => {
  if (!newFaction.name.trim()) return;
  const slug = newFaction.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
  const facId = `fac-${slug}-${Date.now().toString().slice(-4)}`;

  const createdFaction: FactionDefinition = {
    id: facId,
    name: newFaction.name.trim(),
    alignment: newFaction.alignment,
    color: newFaction.color,
    badgeIcon: newFaction.badgeIcon,
    winCondition: {
      type: newFaction.winConditionType,
      targetFactionIds: newFaction.targetFactionIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      minParityRatio: newFaction.minParityRatio,
    },
  };

  configuredFactions.value.push(createdFaction);
  newFaction.name = '';
  showToast('Faction added to active game pack!', 'success');
};

const deleteFaction = (id: string) => {
  configuredFactions.value = configuredFactions.value.filter((f) => f.id !== id);
};

// TAB 3: ABILITIES
const configuredAbilities = ref<AbilityDefinition[]>(
  store.activeUniversalPack?.abilities || [
    {
      id: 'heal',
      name: 'Doctor Heal',
      primitive: 'protect',
      timing: 'night_action',
      priority: 2,
      quota: { totalCharges: 'unlimited', chargesPerPhase: 1 },
      targeting: { restriction: 'any' },
    },
    {
      id: 'shot',
      name: 'Mafia Lethal Shot',
      primitive: 'lethal_hit',
      timing: 'night_action',
      priority: 1,
      quota: { totalCharges: 'unlimited', chargesPerPhase: 1 },
      targeting: { restriction: 'exclude_self' },
    },
  ]
);

const newAbility = reactive({
  name: '',
  primitive: 'protect' as any,
  timing: 'night_action' as any,
  priority: 2,
  quotaType: 'unlimited' as 'unlimited' | 'finite',
  totalCharges: 2,
  chargesPerPhase: 1,
  targetRestriction: 'any' as 'any' | 'self_only' | 'exclude_self',
});

const saveAbility = () => {
  if (!newAbility.name.trim()) return;
  const slug = newAbility.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
  const abId = `ab-${slug}-${Date.now().toString().slice(-4)}`;

  const createdAbility: AbilityDefinition = {
    id: abId,
    name: newAbility.name.trim(),
    primitive: newAbility.primitive,
    timing: newAbility.timing,
    priority: newAbility.priority,
    quota: {
      totalCharges: newAbility.quotaType === 'unlimited' ? 'unlimited' : newAbility.totalCharges,
      chargesPerPhase: newAbility.chargesPerPhase,
    },
    targeting: {
      restriction: newAbility.targetRestriction,
    },
  };

  configuredAbilities.value.push(createdAbility);
  newAbility.name = '';
  showToast('Ability configured successfully!', 'success');
};

const deleteAbility = (id: string) => {
  configuredAbilities.value = configuredAbilities.value.filter((a) => a.id !== id);
};

// TAB 4: ROLE STUDIO
const customRoles = ref<Role[]>(
  packService.getAllRoles().filter((r) => r.id.startsWith('custom-'))
);
const customRolesCount = computed(() => customRoles.value.length);

const emojiPalette = [
  '🤠',
  '🕵️',
  '🧙',
  '🥷',
  '🤖',
  '👮',
  '🧑‍⚖️',
  '🎯',
  '🧬',
  '💉',
  '🎭',
  '🔮',
  '🛡️',
  '⚡',
];

const standardAbilityOptions = [
  { id: 'kill', icon: '🗡️', label: 'Lethal Shot' },
  { id: 'protect', icon: '🛡️', label: 'Heal / Shield' },
  { id: 'investigate', icon: '🔍', label: 'Detective Scan' },
  { id: 'silence', icon: '🤐', label: 'Silence Mute' },
  { id: 'block', icon: '🚫', label: 'Ability Block' },
  { id: 'revive', icon: '✨', label: 'Revive Player' },
];

const combinedAbilityOptions = computed(() => {
  const customOptions = configuredAbilities.value.map((a) => ({
    id: a.id,
    icon: a.primitive === 'protect' ? '🛡️' : a.primitive === 'lethal_hit' ? '🗡️' : '⚡',
    label: a.name,
  }));
  return [...standardAbilityOptions, ...customOptions];
});

const roleFactionOptions = computed(() => {
  if (configuredFactions.value.length > 0) {
    return configuredFactions.value;
  }
  return [
    { id: 'town', name: 'Town', badgeIcon: '🛡️', color: '#3b82f6', alignment: 'town' },
    { id: 'mafia', name: 'Mafia', badgeIcon: '🗡️', color: '#ef4444', alignment: 'mafia' },
    {
      id: 'third-party',
      name: 'Third Party',
      badgeIcon: '🏹',
      color: '#f59e0b',
      alignment: 'third-party',
    },
  ];
});

const newRole = reactive<{
  name: string;
  side: string;
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
  const slug = newRole.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
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

// TAB 5: PIPELINE & THEMES
const pipelineConfig = reactive<UniversalPipelineConfig>({
  speakingOrder: store.activeUniversalPack?.pipeline?.speakingOrder || 'clockwise',
  tieResolution: store.activeUniversalPack?.pipeline?.tieResolution || 'roulette',
  enableExitCards: store.activeUniversalPack?.pipeline?.enableExitCards ?? true,
  penaltyWarningLimit: store.activeUniversalPack?.pipeline?.penaltyWarningLimit ?? 2,
  enabledPhases: store.activeUniversalPack?.pipeline?.enabledPhases || [
    'day',
    'voting',
    'midday',
    'night',
  ],
});

const customSoundtracks = reactive({
  night: '',
  day: '',
  victory: '',
});

const applyPipelineSettings = () => {
  if (store.activeUniversalPack) {
    store.activeUniversalPack.pipeline = {
      ...store.activeUniversalPack.pipeline,
      ...pipelineConfig,
    };
  }

  // Register custom soundtracks if URLs provided
  if (customSoundtracks.night.trim()) {
    audio.registerCustomSoundtrack('night', customSoundtracks.night.trim(), 'Custom Night Theme');
  }
  if (customSoundtracks.day.trim()) {
    audio.registerCustomSoundtrack('day', customSoundtracks.day.trim(), 'Custom Day Theme');
  }
  if (customSoundtracks.victory.trim()) {
    audio.registerCustomSoundtrack(
      'victory',
      customSoundtracks.victory.trim(),
      'Custom Victory Theme'
    );
  }

  showToast('Pipeline & Theme configuration updated!', 'success');
};

// TAB 6: PACKS
const availablePresets = computed(() => {
  return packService.communityUniversalPresets.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
  }));
});

const exportPack = () => {
  const currentUniversalPack: UniversalGamePack = store.activeUniversalPack || {
    version: '2.0.0',
    id: `pack-${Date.now()}`,
    name: 'Custom Universal Game Pack',
    description: 'Exported from MPGA Role Studio',
    theme: {
      primaryColor: '#ef4444',
      accentColor: '#f87171',
      phasePalettes: {
        day: '#0f172a',
        voting: '#1e1b4b',
        night: '#090d16',
        gameOver: '#030712',
      },
    },
    factions: configuredFactions.value,
    abilities: configuredAbilities.value,
    roles: customRoles.value.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      factionId: r.side,
      abilities: r.abilities || [],
      limit: r.limit,
    })),
    pipeline: pipelineConfig,
  };

  packService.exportPackAsJson(currentUniversalPack);
  showToast('Universal game pack downloaded!', 'success');
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
  const result = packService.importPackFromJson(importJsonText.value);
  if (result.valid) {
    showToast(t('studio.packs.importSuccess'), 'success');
    importJsonText.value = '';
    availableModes.value = packService.getAllModes();
    customRoles.value = packService.getAllRoles().filter((r) => r.id.startsWith('custom-'));
    if (result.universalPack) {
      configuredFactions.value = result.universalPack.factions;
      configuredAbilities.value = result.universalPack.abilities;
    }
    emit('packUpdated');
  } else {
    showToast(`Failed to import pack: ${result.errors.join(' ')}`, 'error');
  }
};

const loadPreset = (presetId: string) => {
  const universalPreset = packService.communityUniversalPresets.find((p) => p.id === presetId);
  if (universalPreset) {
    store.setActiveUniversalPack(universalPreset);
    configuredFactions.value = [...universalPreset.factions];
    configuredAbilities.value = [...universalPreset.abilities];
    pipelineConfig.tieResolution = universalPreset.pipeline.tieResolution;
    pipelineConfig.enableExitCards = universalPreset.pipeline.enableExitCards;
    pipelineConfig.speakingOrder = universalPreset.pipeline.speakingOrder;
    pipelineConfig.speakingDurationSec = universalPreset.pipeline.speakingDurationSec;
    pipelineConfig.challengeDurationSec = universalPreset.pipeline.challengeDurationSec;
    pipelineConfig.defenseDurationSec = universalPreset.pipeline.defenseDurationSec;
    pipelineConfig.votingThresholdFormula = universalPreset.pipeline.votingThresholdFormula;
    pipelineConfig.penaltyWarningLimit = universalPreset.pipeline.penaltyWarningLimit;
    if (universalPreset.theme?.soundtracks) {
      audio.applyUniversalThemeSoundtracks(universalPreset.theme.soundtracks);
    }
    showToast(`Loaded preset "${universalPreset.name}"!`, 'success');
    emit('packUpdated');
    return;
  }

  const legacyPreset = packService.communityPresets.find((p) => p.id === presetId);
  if (!legacyPreset) return;

  const result = packService.importPackFromJson(JSON.stringify(legacyPreset));
  if (result.valid) {
    showToast(`Loaded preset "${legacyPreset.name}"!`, 'success');
    availableModes.value = packService.getAllModes();
    loadModeToEdit(legacyPreset.modes[0]?.id || 'godfather');
    emit('packUpdated');
  }
};

const resetFactoryDefaults = () => {
  if (confirm(t('studio.packs.resetConfirm'))) {
    packService.resetCustomizations();
    availableModes.value = packService.getAllModes();
    loadModeToEdit(availableModes.value[0]?.id || 'godfather');
    customRoles.value = [];
    store.setActiveUniversalPack(null as any);
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
      if (store.activeUniversalPack) {
        configuredFactions.value = [...store.activeUniversalPack.factions];
        configuredAbilities.value = [...store.activeUniversalPack.abilities];
      }
    }
  },
  { immediate: true }
);
</script>
