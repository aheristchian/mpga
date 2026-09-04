<template>
  <div class="space-y-6">
    <!-- ATMOSPHERIC HERO BANNER -->
    <PhaseHeroBanner phase="night" :day="store.currentDay">
      <template #action>
        <!-- VOICE NARRATION TOGGLE & STEP INDICATOR -->
        <div class="flex items-center gap-3">
          <button
            class="px-2.5 py-1 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer"
            :class="
              narration.isEnabled.value
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                : 'bg-gray-900/80 border-gray-700 text-gray-400 hover:text-white'
            "
            :title="$t('tts.voiceNarrationTitle')"
            @click="toggleVoiceNarration"
          >
            <span>🗣️</span>
            <span>{{ narration.isEnabled.value ? $t('tts.voiceOn') : $t('tts.voiceOff') }}</span>
          </button>

          <div
            class="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-gray-900/60 p-1 rounded-xl border border-indigo-500/30 flex-wrap"
          >
            <!-- Step 1: Sleep -->
            <span
              class="px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap"
              :class="
                stage === 'sleep'
                  ? 'bg-indigo-600 text-white font-black shadow-md'
                  : 'text-gray-400'
              "
            >
              {{ $t('nightPhase.stepSleepBadge') }}
            </span>
            <span class="text-gray-600 inline-block rtl:rotate-180 transform transition-transform"
              >→</span
            >

            <!-- Step 2 (Day 1 only): Mafia Intro -->
            <template v-if="store.currentDay === 1">
              <span
                class="px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap"
                :class="
                  stage === 'mafia-intro'
                    ? 'bg-red-600 text-white font-black shadow-md'
                    : 'text-gray-400'
                "
              >
                {{ $t('nightPhase.stepMafiaBadge') }}
              </span>
              <span class="text-gray-600 inline-block rtl:rotate-180 transform transition-transform"
                >→</span
              >
            </template>

            <!-- Step 2 / 3: Role Wakeups -->
            <span
              class="px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap"
              :class="
                stage === 'wizard'
                  ? 'bg-indigo-600 text-white font-black shadow-md'
                  : 'text-gray-400'
              "
            >
              {{
                store.currentDay === 1
                  ? $t('nightPhase.stepRolesBadge')
                  : $t('nightPhase.stepRolesBadgeLater')
              }}
            </span>
            <span class="text-gray-600 inline-block rtl:rotate-180 transform transition-transform"
              >→</span
            >

            <!-- Step 3 / 4: Morning Announcement -->
            <span
              class="px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap"
              :class="
                stage === 'morning'
                  ? 'bg-indigo-600 text-white font-black shadow-md'
                  : 'text-gray-400'
              "
            >
              {{
                store.currentDay === 1
                  ? $t('nightPhase.stepMorningBadge')
                  : $t('nightPhase.stepMorningBadgeLater')
              }}
            </span>
          </div>
        </div>
      </template>
    </PhaseHeroBanner>

    <div
      class="bg-gray-850 rounded-2xl p-4 sm:p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-950/20 text-white"
    >
      <!-- STAGE 0: NIGHT 1 MAFIA TEAM INTRODUCTION -->
      <div
        v-if="stage === 'mafia-intro'"
        class="text-center py-8 space-y-6 bg-gray-900/80 rounded-2xl border-2 border-red-500/40 p-6 sm:p-8"
      >
        <div class="text-6xl animate-pulse">👥</div>
        <h3 class="text-2xl font-black text-red-400">
          {{ $t('nightPhase.mafiaIntroTitle') }}
        </h3>

        <!-- CUE SCRIPT -->
        <div
          class="bg-red-950/40 border border-red-500/50 p-5 rounded-xl max-w-lg mx-auto text-left rtl:text-right space-y-3"
        >
          <div>
            <span class="text-[10px] text-red-400 uppercase font-bold tracking-wider block mb-1">
              {{ $t('common.moderatorScriptCue1') }}
            </span>
            <p class="text-sm text-gray-200 italic leading-relaxed">
              {{ $t('nightPhase.mafiaIntroPrompt') }}
            </p>
          </div>

          <div class="pt-2 border-t border-red-900/50">
            <span class="text-[10px] text-red-400 uppercase font-bold tracking-wider block mb-1">
              {{ $t('common.moderatorScriptCue2') }}
            </span>
            <p class="text-sm text-gray-200 italic leading-relaxed">
              {{ $t('nightPhase.mafiaSleepPrompt') }}
            </p>
          </div>
        </div>

        <!-- MAFIA ROSTER PREVIEW -->
        <div
          class="max-w-md mx-auto bg-gray-800/80 p-4 rounded-xl border border-gray-700 text-left rtl:text-right"
        >
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {{ $t('nightPhase.livingMafiaRoster') }}
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="m in livingMafiaMembers"
              :key="m.name"
              class="p-2.5 bg-gray-900/90 border border-red-900/60 rounded-xl flex items-center gap-2.5"
            >
              <RoleAvatar :role="m.role" size="sm" />
              <div>
                <span class="font-bold text-white text-sm block">{{ m.name }}</span>
                <span class="text-xs text-red-400">
                  {{
                    $te('roles.' + m.role?.id + '.name')
                      ? $t('roles.' + m.role?.id + '.name')
                      : m.role?.name
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button
            class="bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 active:scale-95 text-white px-8 py-3.5 rounded-xl font-black text-base shadow-lg shadow-red-600/30 transition-all cursor-pointer min-h-[44px] select-none"
            @click="startRoleWakeupWizard"
          >
            {{ $t('nightPhase.continueToIndividualRoles') }}
          </button>
        </div>
      </div>

      <!-- STAGE 1: SLEEP TOWN CALL -->
      <div
        v-else-if="stage === 'sleep'"
        class="text-center py-12 space-y-6 bg-gray-900/60 rounded-2xl border border-indigo-500/30 p-6 sm:p-8"
      >
        <div class="text-7xl">🌃</div>
        <div class="bg-indigo-950/40 border border-indigo-500/40 p-5 rounded-xl max-w-lg mx-auto">
          <h4 class="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2">
            {{ $t('common.moderatorScriptCue') }}
          </h4>
          <p class="text-base text-gray-200 italic leading-relaxed">
            {{ $t('nightPhase.sleepTownPrompt') }}
          </p>
        </div>

        <div class="pt-4 flex flex-col sm:flex-row justify-center">
          <button
            class="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white px-8 py-3.5 rounded-xl font-black text-base shadow-lg shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px] select-none text-center"
            @click="handleProceedFromSleep"
          >
            {{
              store.currentDay === 1
                ? $t('nightPhase.proceedToMafiaIntro')
                : actorsWithAbilities.length > 0
                  ? $t('nightPhase.beginRoleWakeups')
                  : $t('nightPhase.calculateNightResolution')
            }}
          </button>
        </div>
      </div>

      <!-- STAGE 2: ROLE WAKEUP TELEPROMPTER WIZARD -->
      <div v-else-if="stage === 'wizard' && currentActor" class="space-y-6">
        <div
          class="bg-gradient-to-b from-gray-800 to-gray-850 p-6 rounded-2xl border-2 border-indigo-500/40 shadow-2xl relative"
        >
          <!-- Progress Counter -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-bold uppercase tracking-widest text-indigo-400">
              {{
                $t('nightPhase.stepProgress', {
                  current: currentActorIndex + 1,
                  total: actorsWithAbilities.length,
                  role: $te('roles.' + currentActor.role?.id + '.name')
                    ? $t('roles.' + currentActor.role?.id + '.name')
                    : currentActor.role?.name,
                })
              }}
            </span>
            <span class="text-xs bg-indigo-900/60 text-indigo-300 px-3 py-1 rounded-full font-bold">
              {{ $t('nightPhase.priority', { priority: getAbilityPriority(currentActor) }) }}
            </span>
          </div>

          <!-- Role Header Card -->
          <div
            class="flex items-center gap-4 bg-gray-900/70 p-4 rounded-xl border border-gray-700 mb-6"
          >
            <RoleAvatar
              :role="
                currentActor.isMafiaTeamShot
                  ? { id: 'mafia-shot', name: 'Mafia Shot', badgeKey: 'roleGuide.factions.mafiaLeader' }
                  : currentActor.role
              "
              size="lg"
            />
            <div>
              <h3 class="text-2xl font-black text-white">
                {{
                  currentActor.isMafiaTeamShot
                    ? $t('nightPhase.mafiaTeamShotTitle')
                    : $te('roles.' + currentActor.role?.id + '.name')
                      ? $t('roles.' + currentActor.role?.id + '.name')
                      : currentActor.role?.name
                }}
              </h3>
              <p class="text-sm text-gray-300">
                {{ $t('common.player') }}:
                <span class="font-bold text-white">{{ currentActor.name }}</span>
                <span v-if="currentActor.isMafiaTeamShot" class="text-xs text-red-400 font-semibold ml-1 rtl:mr-1">
                  ({{ $te('roles.' + currentActor.role?.id + '.name') ? $t('roles.' + currentActor.role?.id + '.name') : currentActor.role?.name }})
                </span>
              </p>
            </div>
          </div>

          <!-- TELEPROMPTER SCRIPT -->
          <div class="space-y-3 mb-6">
            <div class="bg-indigo-950/40 border border-indigo-500/40 p-4 rounded-xl">
              <span
                class="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block mb-1"
                >{{ $t('nightPhase.wakeUpScript') }}</span
              >
              <p class="text-sm text-gray-200 italic">
                {{
                  currentActor.isMafiaTeamShot
                    ? $t('nightPhase.mafiaTeamShotPrompt', { name: currentActor.name })
                    : $t('nightPhase.wakeRolePrompt', {
                        role: $te('roles.' + currentActor.role?.id + '.name')
                          ? $t('roles.' + currentActor.role?.id + '.name')
                          : currentActor.role?.name,
                        player: currentActor.name,
                      })
                }}
              </p>
            </div>
          </div>

          <!-- NOSTRADAMUS 3-PLAYER INQUIRY (Special UI) -->
          <div
            v-if="currentActor.role?.id === 'nostradamus'"
            class="space-y-4 mb-6 bg-purple-950/40 border border-purple-500/50 p-5 rounded-2xl"
          >
            <div>
              <h4 class="text-sm font-bold text-purple-300 uppercase tracking-wider mb-1">
                {{ $t('nightPhase.nostradamusInquiryTitle') }}
              </h4>
              <p class="text-xs text-gray-300">
                {{ $t('nightPhase.nostradamusInquiryPrompt') }}
              </p>
            </div>

            <!-- 3 Player Multi-Select Checkboxes / Buttons -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="target in getValidTargets(currentActor)"
                :key="target.name"
                type="button"
                class="p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer active:scale-95 select-none min-h-[44px]"
                :class="
                  nostradamusSelectedNames.includes(target.name)
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-2 ring-purple-400'
                    : 'bg-gray-850 border-gray-700 text-gray-300 hover:bg-gray-750'
                "
                @click="toggleNostradamusTarget(target.name)"
              >
                <span class="truncate">{{ target.name }}</span>
                <span>{{ nostradamusSelectedNames.includes(target.name) ? '✓' : '+' }}</span>
              </button>
            </div>

            <!-- Moderator Signal Prompt -->
            <div
              class="p-4 bg-purple-900/60 border border-purple-500/70 rounded-xl space-y-2 text-left"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs text-purple-200 font-bold uppercase tracking-wider">
                  {{
                    $t('nightPhase.nostradamusMafiaCount', {
                      count: nostradamusMafiaCount,
                      selected: nostradamusSelectedNames.length,
                    })
                  }}
                </span>
                <span class="text-2xl font-black text-amber-400">{{ nostradamusMafiaCount }}</span>
              </div>
              <p class="text-xs text-gray-200 italic">
                {{ $t('nightPhase.nostradamusSignalPrompt', { count: nostradamusMafiaCount }) }}
              </p>

              <!-- Strategic Threshold & Recommendation -->
              <div class="pt-2 border-t border-purple-700/60 text-xs space-y-1">
                <div class="text-purple-300 font-semibold">
                  {{
                    $t('nightPhase.nostradamusTotalMafiaContext', {
                      total: totalMafiaInGame,
                      threshold: Math.floor(totalMafiaInGame / 2),
                    })
                  }}
                </div>
                <div
                  class="p-2 rounded-lg"
                  :class="
                    isMoreThanHalfMafia
                      ? 'bg-red-950/60 border border-red-500/50 text-red-200 font-semibold'
                      : 'bg-blue-950/60 border border-blue-500/50 text-blue-200 font-semibold'
                  "
                >
                  💡
                  {{
                    isMoreThanHalfMafia
                      ? $t('nightPhase.nostradamusRecommendationMafia', {
                          count: nostradamusMafiaCount,
                          total: totalMafiaInGame,
                        })
                      : $t('nightPhase.nostradamusRecommendationTown', {
                          count: nostradamusMafiaCount,
                          total: totalMafiaInGame,
                        })
                  }}
                </div>
              </div>
            </div>

            <!-- Secret Side Selection (Night 1 Alignment Choice) -->
            <div class="pt-2 space-y-2 text-left">
              <label class="text-xs font-bold text-purple-200 uppercase tracking-wider block">
                {{ $t('nightPhase.nostradamusChooseSideTitle') }}
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 select-none min-h-[44px]"
                  :class="
                    store.nostradamusChoice === 'town'
                      ? 'bg-blue-600 border-blue-300 text-white shadow-lg ring-2 ring-blue-400'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  "
                  @click="store.setNostradamusChoice('town')"
                >
                  <span>🔵</span>
                  <span>{{ $t('nightPhase.nostradamusSideTown') }}</span>
                </button>
                <button
                  type="button"
                  class="p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 select-none min-h-[44px]"
                  :class="
                    store.nostradamusChoice === 'mafia'
                      ? 'bg-red-600 border-red-300 text-white shadow-lg ring-2 ring-red-400'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  "
                  @click="store.setNostradamusChoice('mafia')"
                >
                  <span>🔴</span>
                  <span>{{ $t('nightPhase.nostradamusSideMafia') }}</span>
                </button>
              </div>
              <p class="text-[11px] text-gray-400 italic">
                {{ $t('nightPhase.nostradamusThirdPartyNote') }}
              </p>
            </div>
          </div>

          <!-- TWO-STEP ACTION SELECTION FOR WAKING ROLE -->
          <div v-else class="space-y-6 mb-6 text-left">
            <!-- MOBILE ACTION SYNCED BADGE -->
            <div
              v-if="mobileActionSyncMap[getActorActionKey(currentActor)]"
              class="p-3 bg-indigo-950/70 border border-indigo-500/50 rounded-xl flex items-center justify-between gap-2 shadow-inner"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-xl">📱</span>
                <div>
                  <span class="text-xs font-bold text-indigo-300 block">
                    {{
                      mobileActionSyncMap[getActorActionKey(currentActor)].target
                        ? $t('nightPhase.mobileActionSynced', {
                            player: currentActor.name,
                            target: mobileActionSyncMap[getActorActionKey(currentActor)].target,
                          })
                        : $t('nightPhase.mobileActionPass', { player: currentActor.name })
                    }}
                  </span>
                  <span class="text-[10px] text-gray-400">{{
                    $t('nightPhase.overridePrompt')
                  }}</span>
                </div>
              </div>
              <span
                class="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 px-2.5 py-0.5 rounded-full font-black tracking-wider animate-pulse"
              >
                SYNCED
              </span>
            </div>

            <!-- STEP 1: SELECT ACTION TYPE -->
            <div class="space-y-2">
              <label
                class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>⚡</span> {{ $t('nightPhase.step1Action') }}
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <button
                  v-for="action in getAvailableActionsForActor(currentActor)"
                  :key="action.id"
                  type="button"
                  class="p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none active:scale-98 flex items-start gap-3 min-h-[56px]"
                  :class="
                    getSelectedActionId(getActorActionKey(currentActor)) === action.id
                      ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-950/40 text-white'
                      : 'bg-gray-800/80 border-gray-700 hover:bg-gray-750 text-gray-300 hover:text-white'
                  "
                  @click="selectActorAction(getActorActionKey(currentActor), action.id)"
                >
                  <span class="text-2xl p-1.5 bg-gray-900/80 rounded-lg shrink-0">{{
                    action.icon
                  }}</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-1">
                      <span class="font-bold text-sm text-white truncate">{{
                        $t(action.nameKey)
                      }}</span>
                      <span
                        v-if="getSelectedActionId(getActorActionKey(currentActor)) === action.id"
                        class="text-xs text-indigo-400 font-black bg-indigo-900/60 px-1.5 py-0.5 rounded"
                        >✓</span
                      >
                    </div>
                    <p class="text-[11px] text-gray-400 mt-0.5 leading-snug">
                      {{ $t(action.descriptionKey) }}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <!-- STEP 2: CHOOSE TARGET (IF ACTION REQUIRES TARGET) -->
            <div
              v-if="getSelectedActionId(getActorActionKey(currentActor)) === 'pass'"
              class="p-4 bg-gray-900/80 border border-dashed border-gray-700 rounded-xl text-center space-y-1"
            >
              <span class="text-2xl block">🚫</span>
              <p class="text-sm font-bold text-gray-300">{{ $t('nightPhase.passNotice') }}</p>
            </div>

            <div
              v-else-if="getSelectedActionId(getActorActionKey(currentActor)) === 'treat-self'"
              class="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex items-center gap-3"
            >
              <span class="text-3xl">🛡️</span>
              <div>
                <p class="text-sm font-bold text-emerald-300">
                  {{ $t('nightPhase.selfHealNotice') }}
                </p>
                <p class="text-xs text-emerald-200/80 font-medium mt-0.5">
                  {{ currentActor.name }} ({{
                    $te('roles.' + currentActor.role?.id + '.name')
                      ? $t('roles.' + currentActor.role?.id + '.name')
                      : currentActor.role?.name
                  }})
                </p>
              </div>
            </div>

            <div v-else class="space-y-2">
              <div class="flex items-center justify-between">
                <label
                  class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span>🎯</span> {{ $t('nightPhase.step2Target') }}
                </label>
                <span
                  v-if="getCurrentTargetName(getActorActionKey(currentActor))"
                  class="text-xs text-indigo-300 font-bold bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-700"
                >
                  {{ $t('nightPhase.selectedTarget') }}:
                  <strong class="text-white ml-1">{{
                    getCurrentTargetName(getActorActionKey(currentActor))
                  }}</strong>
                </span>
              </div>

              <!-- CANDIDATE PLAYER CARDS GRID -->
              <div
                v-if="
                  getValidTargetsForAction(
                    currentActor,
                    getSelectedActionId(getActorActionKey(currentActor))
                  ).length === 0
                "
                class="text-center py-6 bg-gray-900/60 border border-dashed border-gray-700 rounded-xl p-4"
              >
                <p class="text-xs text-gray-400">{{ $t('nightPhase.noDeadPlayers') }}</p>
              </div>

              <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                <button
                  v-for="target in getValidTargetsForAction(
                    currentActor,
                    getSelectedActionId(getActorActionKey(currentActor))
                  )"
                  :key="target.name"
                  type="button"
                  class="p-3 rounded-xl border text-left transition-all cursor-pointer select-none active:scale-95 flex items-center gap-2.5 min-h-[52px]"
                  :class="
                    getCurrentTargetName(getActorActionKey(currentActor)) === target.name
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-300 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                      : 'bg-gray-800/90 border-gray-700 text-gray-200 hover:bg-gray-750 hover:border-gray-600'
                  "
                  @click="selectActorTarget(getActorActionKey(currentActor), target.name)"
                >
                  <RoleAvatar :role="target.role" :is-dead="target.isDead" size="sm" />
                  <div class="min-w-0 flex-1">
                    <span class="font-bold text-sm block truncate">{{ target.name }}</span>
                    <span class="text-[10px] block truncate opacity-80">
                      {{
                        $te('roles.' + target.role?.id + '.name')
                          ? $t('roles.' + target.role?.id + '.name')
                          : target.role?.name
                      }}
                    </span>
                  </div>
                  <span
                    v-if="getCurrentTargetName(getActorActionKey(currentActor)) === target.name"
                    class="text-sm font-black text-white shrink-0"
                    >✓</span
                  >
                </button>
              </div>
            </div>
          </div>

          <!-- DETECTIVE INSTANT FEEDBACK -->
          <div
            v-if="
              currentActor.role?.id === 'detective' &&
              getCurrentTargetName(getActorActionKey(currentActor))
            "
            class="bg-blue-950/50 border border-blue-500/50 p-4 rounded-xl space-y-2 mb-6 text-left"
          >
            <span class="text-xs text-blue-400 font-bold uppercase tracking-wider block">
              {{ $t('nightPhase.investigationResult') }}
            </span>
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ detectiveInquiryResult?.isGuilty ? '👍' : '👎' }}</span>
              <div>
                <span
                  class="font-black text-lg block"
                  :class="detectiveInquiryResult?.isGuilty ? 'text-red-400' : 'text-green-400'"
                >
                  {{
                    detectiveInquiryResult?.isGuilty
                      ? $t('nightPhase.guiltyMafia')
                      : $t('nightPhase.innocentTown')
                  }}
                </span>
                <p class="text-xs text-gray-300">
                  {{
                    detectiveInquiryResult?.isGuilty
                      ? $t('nightPhase.inquirySignalMafia')
                      : $t('nightPhase.inquirySignalTown')
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- PUT TO SLEEP SCRIPT -->
          <div
            class="bg-gray-900/60 p-3.5 rounded-xl border border-gray-700 text-xs text-gray-400 italic mb-6"
          >
            {{
              currentActor.isMafiaTeamShot
                ? $t('nightPhase.mafiaTeamSleepPrompt', { name: currentActor.name })
                : $t('nightPhase.putToSleepPrompt', {
                    role: $te('roles.' + currentActor.role?.id + '.name')
                      ? $t('roles.' + currentActor.role?.id + '.name')
                      : currentActor.role?.name,
                  })
            }}
          </div>

          <!-- NAVIGATION CONTROLS -->
          <div
            class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2"
          >
            <button
              class="w-full sm:w-auto px-5 py-3 bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-300 rounded-xl font-semibold transition-all text-sm disabled:opacity-30 min-h-[44px] cursor-pointer select-none flex items-center justify-center gap-1.5"
              :disabled="currentActorIndex === 0"
              @click="prevRole"
            >
              <span class="inline-block rtl:rotate-180 transform transition-transform">←</span>
              <span>{{ $t('nightPhase.prevRole') }}</span>
            </button>

            <button
              class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 active:scale-95 active:brightness-90 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] select-none"
              @click="nextRole"
            >
              <span>{{
                currentActorIndex < actorsWithAbilities.length - 1
                  ? $t('nightPhase.nextRole')
                  : $t('nightPhase.reviewActions')
              }}</span>
              <span class="inline-block rtl:rotate-180 transform transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- STAGE 3: MORNING ANNOUNCEMENT & RESOLUTION RESULTS -->
      <div v-else-if="stage === 'morning' && resolution" class="space-y-6">
        <!-- MORNING TOWN WAKE UP SCRIPT -->
        <div class="bg-indigo-950/40 border-2 border-indigo-500/60 p-5 rounded-2xl">
          <span class="text-xs text-indigo-400 font-bold uppercase tracking-widest block mb-1">{{
            $t('nightPhase.morningWakeUpScript')
          }}</span>
          <p class="text-lg font-bold text-white italic">
            {{ $t('nightPhase.morningTownPrompt') }}
          </p>
        </div>

        <!-- PUBLIC ANNOUNCEMENT -->
        <div class="bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-3">
          <h3 class="text-sm font-bold text-gray-300 uppercase tracking-wider">
            {{ $t('nightPhase.publicAnnouncement') }}
          </h3>

          <div
            v-if="resolution.deaths.length === 0"
            class="text-green-400 font-black p-4 bg-green-950/30 border border-green-600/40 rounded-xl text-center text-lg"
          >
            🕊️ {{ $t('nightPhase.noDeaths') }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="death in resolution.deaths"
              :key="death"
              class="text-red-400 font-black p-4 bg-red-950/30 border border-red-600/40 rounded-xl text-center text-lg"
            >
              💀 {{ death }} {{ $t('nightPhase.wasKilled') }}
            </div>
          </div>

          <div v-if="resolution.revived && resolution.revived.length > 0" class="space-y-2">
            <div
              v-for="revived in resolution.revived"
              :key="revived"
              class="text-green-400 font-black p-4 bg-green-950/30 border border-green-600/40 rounded-xl text-center text-lg"
            >
              💚 {{ revived }} {{ $t('nightPhase.wasRevived') }}
            </div>
          </div>

          <div v-if="resolution.silenced && resolution.silenced.length > 0" class="space-y-2">
            <div
              v-for="silenced in resolution.silenced"
              :key="silenced"
              class="text-amber-400 font-black p-4 bg-amber-950/30 border border-amber-600/40 rounded-xl text-center text-lg"
            >
              🤐 {{ silenced }} {{ $t('nightPhase.wasSilenced') }}
            </div>
          </div>
        </div>

        <!-- MODERATOR PRIVATE LOG -->
        <div class="bg-gray-800/80 p-5 rounded-xl border border-gray-700">
          <h3 class="text-sm font-bold text-indigo-300 mb-3">
            {{ $t('nightPhase.moderatorLog') }}
          </h3>
          <ul class="space-y-1.5 text-xs font-mono text-gray-300">
            <li
              v-for="(log, idx) in resolution.log"
              :key="idx"
              class="p-1.5 bg-gray-900/60 rounded border border-gray-700/60"
            >
              > {{ log }}
            </li>
          </ul>
        </div>

        <!-- START NEXT DAY -->
        <div class="pt-4 flex flex-col sm:flex-row justify-end">
          <button
            class="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 active:scale-95 text-white px-8 py-3.5 rounded-xl font-black text-base shadow-xl shadow-green-600/30 transition-all cursor-pointer min-h-[44px] select-none text-center"
            @click="startNextDay"
          >
            ☀️ {{ $t('nightPhase.startNextDay', { day: store.currentDay + 1 }) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { mockAbilities } from '../../data/abilities';
import { resolveNight, getActiveMafiaShooter } from '../../services/gameEngine';
import { useGameStore } from '../../stores/gameStore';
import { useGameService } from '../../services/useGameService';
import { useAudio } from '../../services/useAudioService';
import { useMultiplayer } from '../../services/useMultiplayerService';
import { useVoiceNarration } from '../../services/useVoiceNarration';
import PhaseHeroBanner from '../PhaseHeroBanner.vue';
import RoleAvatar from '../RoleAvatar.vue';
import type { Player, NightAction, NightResolution } from '../../types';

const { locale, t, te } = useI18n();
const store = useGameStore();
const gameService = useGameService();
const audio = useAudio();
const multiplayer = useMultiplayer();
const narration = useVoiceNarration();

const stage = ref<'sleep' | 'mafia-intro' | 'wizard' | 'morning'>('sleep');
const currentActorIndex = ref(0);
const actionMap = ref<Record<string, NightAction | null>>({});
const selectedActionTypeMap = ref<Record<string, string>>({});
const mobileActionSyncMap = ref<Record<string, any>>({});
const resolution = ref<NightResolution | null>(null);

const toggleVoiceNarration = () => {
  narration.toggleEnabled();
  if (narration.isEnabled.value) {
    narrateCurrentStep();
  }
};

const narrateCurrentStep = () => {
  if (!narration.isEnabled.value) return;
  const lang = locale.value === 'fa' ? 'fa-IR' : 'en-US';

  if (stage.value === 'sleep') {
    const text =
      locale.value === 'fa'
        ? 'شب فرارسیده است. تمامی بازیکنان به خواب بروند.'
        : 'Night has fallen. All players go to sleep.';
    narration.speak(text, lang);
  } else if (stage.value === 'mafia-intro') {
    const text =
      locale.value === 'fa'
        ? 'اعضای مافیا چشمان خود را باز کنند و یکدیگر را شناسایی کنند.'
        : 'Mafia members, open your eyes and identify each other.';
    narration.speak(text, lang);
  } else if (stage.value === 'wizard' && currentActor.value) {
    let text = '';
    if (currentActor.value.isMafiaTeamShot) {
      text =
        locale.value === 'fa'
          ? `شلیک شب مافیا. ${currentActor.value.name}، هدف شلیک مافیا را انتخاب کن.`
          : `Mafia night shot. ${currentActor.value.name}, choose the Mafia's target.`;
    } else {
      const actorRole = currentActor.value.role?.name || '';
      text =
        locale.value === 'fa'
          ? `${actorRole}، بیدار شو و اقدام خود را انتخاب کن.`
          : `${actorRole}, wake up and choose your action.`;
    }
    narration.speak(text, lang);
  } else if (stage.value === 'morning') {
    const text =
      locale.value === 'fa'
        ? 'صبح فرارسیده است. شهروندان بیدار شوید.'
        : 'Dawn breaks. Citizens wake up.';
    narration.speak(text, lang);
  }
};

// Nostradamus state
const nostradamusSelectedNames = ref([]);

const alivePlayers = computed(() => store.livePlayers.filter((p) => !p.isDead));

const livingMafiaMembers = computed(() =>
  alivePlayers.value.filter((p) => p.role?.sideId === 'mafia')
);

const getActorActionKey = (actor: any) => {
  return actor?.actionKey || actor?.name;
};

const actorsWithAbilities = computed(() => {
  const hasAliveGodfather = alivePlayers.value.some((p) => p.role?.id === 'godfather');
  const activeShooter = getActiveMafiaShooter(alivePlayers.value);

  const list: Array<Player & { isMafiaTeamShot?: boolean; actionKey?: string }> = [];
  for (const p of alivePlayers.value) {
    const roleId = p.role?.id;
    const abilities = p.role?.abilityIds || [];

    if (roleId === 'mafia' || roleId === 'simple_mafia') {
      // In Classic mode or when only simple mafia exist, handled via activeShooter below
      continue;
    } else if (abilities.length > 0) {
      list.push({ ...p, actionKey: p.name });
    }
  }

  // If Godfather is absent/dead and living Mafia exist, add the designated Mafia Team Shot step
  if (!hasAliveGodfather && activeShooter) {
    list.push({
      ...activeShooter,
      isMafiaTeamShot: true,
      actionKey: `${activeShooter.name}#mafia-shot`,
      role: {
        id: 'mafia-shot',
        name: `${activeShooter.name} (${t('roles.mafia.name')} Shot)`,
        nameKey: 'nightPhase.mafiaTeamShotTitle',
        sideId: 'mafia',
        abilityIds: ['mafia-shot'],
        badgeKey: 'roleGuide.factions.mafiaLeader',
        descriptionKey: 'roles.mafia.description',
      } as any,
    });
  }

  return list.sort((a, b) => {
    const prioA = getAbilityPriority(a);
    const prioB = getAbilityPriority(b);
    return prioB - prioA; // Descending: 99 > 90 > 80 > 70 > 50 > 10
  });
});

const currentActor = computed(() => {
  return actorsWithAbilities.value[currentActorIndex.value] || null;
});

const getAbilityPriority = (player) => {
  const abilityId = player.role?.abilityIds?.[0];
  const ability = mockAbilities.find((a) => a.id === abilityId);
  return ability ? ability.priority : 99;
};

const getAvailableActionsForActor = (actor: Player | any) => {
  if (!actor || !actor.role) return [];
  if (actor.isMafiaTeamShot) {
    return [
      {
        id: 'mafia-shot',
        nameKey: 'abilities.mafiaShot.name',
        descriptionKey: 'abilities.mafiaShot.desc',
        icon: '🔫',
        priority: 70,
        quota: { totalCharges: 'unlimited' },
      },
      {
        id: 'pass',
        nameKey: 'nightPhase.actionPass',
        descriptionKey: 'nightPhase.actionPassDesc',
        icon: '🚫',
        priority: 0,
      },
    ];
  }
  return gameService.getAvailableNightActions(actor.role);
};

const getSelectedActionId = (actorKey: string) => {
  if (selectedActionTypeMap.value[actorKey]) {
    return selectedActionTypeMap.value[actorKey];
  }
  const baseName = actorKey.includes('#') ? actorKey.split('#')[0] : actorKey;
  const actor =
    actorsWithAbilities.value.find((p) => getActorActionKey(p) === actorKey) ||
    store.livePlayers.find((p) => p.name === baseName);
  const actions = getAvailableActionsForActor(actor);
  return actions[0]?.id || 'pass';
};

const getCurrentTargetName = (actorKey: string) => {
  const val = actionMap.value[actorKey];
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val.target || null;
};

const getValidTargetsForAction = (actor: any, actionId: string) => {
  if (!actor) return [];
  if (actionId === 'revive') {
    return store.livePlayers.filter((p) => p.isDead);
  }
  if (actionId === 'treat-self') {
    return [actor];
  }
  if (actionId === 'treat') {
    return alivePlayers.value.filter((p) => p.name !== actor.name);
  }
  if (actionId === 'mafia-shot') {
    return alivePlayers.value.filter((p) => p.role?.sideId !== 'mafia');
  }
  return alivePlayers.value.filter((p) => p.name !== actor.name);
};

const getValidTargets = (actor: any) => {
  const actorKey = getActorActionKey(actor);
  const actionId = getSelectedActionId(actorKey);
  return getValidTargetsForAction(actor, actionId);
};

const selectActorAction = (actorKey: string, actionId: string) => {
  selectedActionTypeMap.value[actorKey] = actionId;
  if (actionId === 'pass') {
    actionMap.value[actorKey] = null;
  } else if (actionId === 'treat-self') {
    const baseName = actorKey.includes('#') ? actorKey.split('#')[0] : actorKey;
    actionMap.value[actorKey] = { target: baseName, actionId: 'treat' };
  } else {
    const currentTarget = getCurrentTargetName(actorKey);
    const baseName = actorKey.includes('#') ? actorKey.split('#')[0] : actorKey;
    const actor =
      actorsWithAbilities.value.find((p) => getActorActionKey(p) === actorKey) ||
      store.livePlayers.find((p) => p.name === baseName);
    const validTargets = getValidTargetsForAction(actor, actionId).map((p) => p.name);
    if (currentTarget && validTargets.includes(currentTarget)) {
      actionMap.value[actorKey] = { target: currentTarget, actionId };
    } else {
      actionMap.value[actorKey] = null;
    }
  }
};

const selectActorTarget = (actorKey: string, targetName: string) => {
  const actionId = getSelectedActionId(actorKey);
  if (actionId === 'pass') return;
  actionMap.value[actorKey] = { target: targetName, actionId };
};

const detectiveInquiryResult = computed(() => {
  if (!currentActor.value || currentActor.value.role?.id !== 'detective') return null;
  const targetName = getCurrentTargetName(getActorActionKey(currentActor.value));
  if (!targetName) return null;

  const targetPlayer = store.livePlayers.find((p) => p.name === targetName);
  if (!targetPlayer) return null;

  // Godfather and Zodiac appear as innocent in inquiry
  const isGodfather = targetPlayer.role?.id === 'godfather';
  const isZodiac = targetPlayer.role?.id === 'zodiac';
  const appearsClean =
    targetPlayer.role?.inquiryAppearsAs === 'town' ||
    targetPlayer.role?.passiveAbilityIds?.includes('clean-inquiry');
  const isMafia = targetPlayer.role?.sideId === 'mafia';

  return {
    target: targetName,
    isGuilty: isMafia && !isGodfather && !isZodiac && !appearsClean,
  };
});

// Nostradamus calculation
const nostradamusMafiaCount = computed(() => {
  return nostradamusSelectedNames.value.filter((name) => {
    const p = store.livePlayers.find((player) => player.name === name);
    return p?.role?.sideId === 'mafia';
  }).length;
});

const totalMafiaInGame = computed(() => {
  return store.livePlayers.filter((p) => p.role?.sideId === 'mafia').length;
});

const isMoreThanHalfMafia = computed(() => {
  return nostradamusMafiaCount.value > totalMafiaInGame.value / 2;
});

const toggleNostradamusTarget = (name) => {
  const idx = nostradamusSelectedNames.value.indexOf(name);
  if (idx > -1) {
    nostradamusSelectedNames.value.splice(idx, 1);
  } else if (nostradamusSelectedNames.value.length < 3) {
    nostradamusSelectedNames.value.push(name);
  }
};

const handleProceedFromSleep = () => {
  if (store.currentDay === 1) {
    stage.value = 'mafia-intro';
    narrateCurrentStep();
  } else {
    startRoleWakeupWizard();
  }
};

const startRoleWakeupWizard = () => {
  if (actorsWithAbilities.value.length === 0) {
    executeNightResolution();
  } else {
    currentActorIndex.value = 0;
    stage.value = 'wizard';
    narrateCurrentStep();
  }
};

const prevRole = () => {
  if (currentActorIndex.value > 0) {
    currentActorIndex.value--;
    narrateCurrentStep();
  }
};

const nextRole = () => {
  if (currentActorIndex.value < actorsWithAbilities.value.length - 1) {
    currentActorIndex.value++;
    narrateCurrentStep();
  } else {
    executeNightResolution();
  }
};

const executeNightResolution = () => {
  resolution.value = resolveNight(
    store.livePlayers,
    actionMap.value,
    store.activeUniversalPack?.abilities
  );
  stage.value = 'morning';
  audio.playDawnRise();
  narrateCurrentStep();

  store.addLog(
    'night',
    `Night ${store.currentDay} Actions Resolved`,
    `Deaths: ${resolution.value.deaths.length ? resolution.value.deaths.join(', ') : 'None'}. Revived: ${resolution.value.revived.length ? resolution.value.revived.join(', ') : 'None'}. Silenced: ${resolution.value.silenced?.length ? resolution.value.silenced.join(', ') : 'None'}.`
  );
};

const startNextDay = () => {
  if (!resolution.value) return;

  // Commit updated ability quotas / charges
  if (resolution.value.updatedAbilityCharges) {
    store.applyPlayerCharges(resolution.value.updatedAbilityCharges);
  }

  // Commit broken shields
  resolution.value.brokenShields?.forEach((name) => {
    store.breakPlayerShield(name);
  });

  // Commit converted allegiances
  resolution.value.converted?.forEach((conv) => {
    store.convertPlayerSide(conv.playerName, conv.newSideId, conv.reason);
  });

  // Commit death changes
  resolution.value.deaths.forEach((name) => {
    store.setPlayerDeathStatus(name, true, `Killed during Night ${store.currentDay}`);
  });

  // Commit revive changes
  resolution.value.revived.forEach((name) => {
    store.setPlayerDeathStatus(name, false, `Revived during Night ${store.currentDay}`);
  });

  store.proceedToNextDay();

  // Commit silenced status for Day
  if (resolution.value.silenced && resolution.value.silenced.length > 0) {
    store.setSilencedPlayers(resolution.value.silenced);
  }
};

let unregisterMultiplayerListener = null;

onMounted(() => {
  stage.value = 'sleep';
  actionMap.value = {};
  selectedActionTypeMap.value = {};
  mobileActionSyncMap.value = {};
  resolution.value = null;
  nostradamusSelectedNames.value = [];
  audio.playNightFall();

  // Listen for mobile players submitting night actions live
  unregisterMultiplayerListener = multiplayer.onPlayerAction((data) => {
    if (data && (data.action === 'NIGHT_ACTION' || data.type === 'NIGHT_ACTION')) {
      const actorName = data.actor || data.actorName;
      const actionId = data.actionId;
      const targetName = data.target || data.targetPlayerName;
      if (!actorName) return;

      const actor = store.livePlayers.find(
        (p) => p.name.trim().toLowerCase() === actorName.trim().toLowerCase()
      );
      const resolvedActorName = actor ? actor.name : actorName;

      const isMafiaShotAction = actionId === 'mafia-shot';
      const isGodfather = actor?.role?.id === 'godfather';
      const targetActionKey =
        isMafiaShotAction && !isGodfather ? `${resolvedActorName}#mafia-shot` : resolvedActorName;

      mobileActionSyncMap.value[targetActionKey] = {
        actionId: actionId || 'ability',
        target: targetName || null,
        timestamp: Date.now(),
      };

      if (actionId) {
        selectedActionTypeMap.value[targetActionKey] = actionId;
      }

      if (actionId === 'treat-self') {
        actionMap.value[targetActionKey] = { target: resolvedActorName, actionId: 'treat' };
      } else if (actionId === 'pass' || !targetName) {
        actionMap.value[targetActionKey] = null;
      } else {
        actionMap.value[targetActionKey] = {
          target: targetName,
          actionId: actionId || selectedActionTypeMap.value[targetActionKey] || 'ability',
        };
      }

      if (
        currentActor.value &&
        (currentActor.value.name === resolvedActorName ||
          getActorActionKey(currentActor.value) === targetActionKey)
      ) {
        audio.playVoteClick();
      }
    }
  });

  narrateCurrentStep();
});

onUnmounted(() => {
  narration.stop();
  if (typeof unregisterMultiplayerListener === 'function') {
    unregisterMultiplayerListener();
  }
});
</script>
