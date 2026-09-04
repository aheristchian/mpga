<template>
  <BaseModal
    :is-open="isOpen"
    :title="$t('tournament.modalTitle')"
    max-width="max-w-5xl"
    @close="$emit('close')"
  >
    <div class="space-y-4 py-1">
      <!-- HEADER SUBTITLE & TAB BAR -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-700 pb-3"
      >
        <div>
          <p class="text-xs text-gray-400">
            {{ $t('tournament.modalSubtitle') }}
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span
              class="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-2.5 py-0.5 rounded-full"
            >
              {{ tournamentName }}
            </span>
            <span class="text-[11px] text-gray-400 font-semibold">
              ({{ totalMatchesCount }} {{ $t('tournament.matchesPlayedFull') }})
            </span>
          </div>
        </div>

        <!-- TABS SWITCHER -->
        <div
          class="flex bg-gray-900 p-1 rounded-xl border border-gray-700 text-xs font-bold shrink-0"
        >
          <button
            v-if="hasCurrentMatch"
            class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            :class="
              activeTab === 'current-match'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            "
            @click="activeTab = 'current-match'"
          >
            <span>🎯</span>
            <span>{{ $t('tournament.tabCurrentMatch') }}</span>
          </button>
          <button
            class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            :class="
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            "
            @click="activeTab = 'leaderboard'"
          >
            <span>🏆</span>
            <span>{{ $t('tournament.tabLeaderboard') }}</span>
          </button>
          <button
            class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            :class="
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            "
            @click="activeTab = 'rules'"
          >
            <span>⚙️</span>
            <span>{{ $t('tournament.tabRules') }}</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: CURRENT MATCH SCORING -->
      <div v-if="activeTab === 'current-match'" class="space-y-4 animate-fade-in">
        <!-- MVP & SECOND MVP SELECTORS -->
        <div
          class="bg-gray-800/80 border border-gray-700 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <!-- 1st MVP -->
            <div>
              <label
                class="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1"
              >
                <span>🥇</span> {{ $t('tournament.selectMvp') }} (+{{ scoringRules.mvpPoints }} pts)
              </label>
              <select
                v-model="selectedMvp"
                class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- {{ $t('tournament.noMvpSelected') }} --</option>
                <option v-for="p in currentPlayers" :key="p.name" :value="p.name">
                  {{ p.name }} ({{ p.role?.name || p.role?.id }})
                </option>
              </select>
            </div>

            <!-- 2nd MVP -->
            <div>
              <label
                class="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1"
              >
                <span>🥈</span> {{ $t('tournament.selectSecondMvp') }} (+{{
                  scoringRules.secondMvpPoints
                }}
                pts)
              </label>
              <select
                v-model="selectedSecondMvp"
                class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">-- {{ $t('tournament.noMvpSelected') }} --</option>
                <option v-for="p in currentPlayers" :key="p.name" :value="p.name">
                  {{ p.name }} ({{ p.role?.name || p.role?.id }})
                </option>
              </select>
            </div>
          </div>

          <!-- COMMIT MATCH BUTTON -->
          <div class="shrink-0 flex sm:flex-col justify-end items-center sm:items-end">
            <button
              :disabled="isMatchRecorded"
              class="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="
                isMatchRecorded
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white'
              "
              @click="handleSaveMatch"
            >
              <span>{{ isMatchRecorded ? '✅' : '💾' }}</span>
              <span>{{
                isMatchRecorded ? $t('tournament.matchAlreadySaved') : $t('tournament.saveMatchBtn')
              }}</span>
            </button>
            <p
              v-if="matchSavedToast"
              class="text-[11px] text-emerald-400 font-bold mt-1 animate-pulse"
            >
              {{ $t('tournament.saveMatchSuccess') }}
            </p>
          </div>
        </div>

        <!-- SCORES BREAKDOWN TABLE -->
        <div class="overflow-x-auto rounded-xl border border-gray-700 bg-gray-850">
          <table class="w-full text-xs text-start rtl:text-right">
            <thead
              class="bg-gray-900 text-gray-400 uppercase font-bold text-[11px] border-b border-gray-700"
            >
              <tr>
                <th class="p-3">{{ $t('tournament.playerColumn') }}</th>
                <th class="p-3">{{ $t('tournament.roleColumn') }}</th>
                <th class="p-3">{{ $t('tournament.statusColumn') }}</th>
                <th class="p-3">{{ $t('tournament.breakdownColumn') }}</th>
                <th class="p-3 text-end">{{ $t('tournament.totalColumn') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr
                v-for="score in currentMatchScores"
                :key="score.playerName"
                class="hover:bg-gray-800/50 transition-colors"
                :class="{ 'bg-amber-950/20': score.isMvp, 'bg-indigo-950/20': score.isSecondMvp }"
              >
                <!-- Player Name -->
                <td class="p-3 font-bold text-white flex items-center gap-2">
                  <span v-if="score.isMvp" class="text-base" title="MVP">🥇</span>
                  <span v-else-if="score.isSecondMvp" class="text-base" title="2nd MVP">🥈</span>
                  <span>{{ score.playerName }}</span>
                </td>

                <!-- Role & Team -->
                <td class="p-3">
                  <span class="font-semibold text-gray-300">{{
                    score.roleName || score.roleId
                  }}</span>
                  <span
                    class="block text-[10px] font-bold uppercase tracking-wider mt-0.5"
                    :class="
                      score.sideId === 'mafia'
                        ? 'text-red-400'
                        : score.sideId === 'town'
                          ? 'text-blue-400'
                          : 'text-purple-400'
                    "
                  >
                    {{ score.sideId }}
                  </span>
                </td>

                <!-- Status Badges -->
                <td class="p-3">
                  <div class="flex flex-wrap gap-1">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold"
                      :class="
                        score.isWinner
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                          : 'bg-gray-800 text-gray-400'
                      "
                    >
                      {{
                        score.isWinner
                          ? $t('tournament.winnerBadge', { points: scoringRules.winPoints })
                          : $t('tournament.loserBadge')
                      }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold"
                      :class="
                        score.isAlive
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-600/40'
                          : 'bg-red-950/80 text-red-400 border border-red-700/40'
                      "
                    >
                      {{
                        score.isAlive
                          ? $t('tournament.survivedBadge', { points: scoringRules.survivalBonus })
                          : $t('tournament.deadBadge')
                      }}
                    </span>
                    <span
                      v-if="score.warnings > 0"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/40"
                    >
                      ⚠️ {{ score.warnings }} ({{
                        $t('tournament.warningPenalty', { points: score.warningPenalty })
                      }})
                    </span>
                  </div>
                </td>

                <!-- Itemized Breakdown -->
                <td class="p-3 text-[11px] font-mono text-gray-300">
                  <span v-if="score.baseWinPoints > 0" class="text-emerald-400 font-bold"
                    >+{{ score.baseWinPoints }}W
                  </span>
                  <span v-if="score.survivalPoints > 0" class="text-blue-400 font-bold"
                    >+{{ score.survivalPoints }}S
                  </span>
                  <span v-if="score.mvpPoints > 0" class="text-amber-400 font-bold"
                    >+{{ score.mvpPoints }}MVP
                  </span>
                  <span v-if="score.specialBonusPoints > 0" class="text-purple-400 font-bold"
                    >+{{ score.specialBonusPoints }}Bonus
                  </span>
                  <span v-if="score.warningPenalty > 0" class="text-red-400 font-bold"
                    >-{{ score.warningPenalty }}Pen
                  </span>
                </td>

                <!-- Total Points -->
                <td class="p-3 text-end font-mono font-black text-sm">
                  <span
                    class="px-2.5 py-1 rounded-lg"
                    :class="
                      score.totalPoints > 0
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                        : score.totalPoints < 0
                          ? 'bg-red-950 text-red-300 border border-red-700/50'
                          : 'bg-gray-800 text-gray-300'
                    "
                  >
                    {{ score.totalPoints > 0 ? '+' : '' }}{{ score.totalPoints }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: TOURNAMENT STANDINGS (LEADERBOARD) -->
      <div v-else-if="activeTab === 'leaderboard'" class="space-y-4 animate-fade-in">
        <!-- ACTION BAR: CSV / JSON EXPORT / RESET -->
        <div
          class="flex flex-wrap justify-between items-center gap-3 bg-gray-800/80 p-3 rounded-2xl border border-gray-700"
        >
          <!-- SEARCH FILTER -->
          <div class="relative flex-1 min-w-[200px] max-w-xs">
            <span class="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400 text-xs"
              >🔍</span
            >
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Filter players..."
              class="w-full bg-gray-900 border border-gray-700 rounded-xl ps-8 pe-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <!-- EXPORT BUTTONS -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              @click="downloadCsv"
            >
              <span>📥</span>
              <span>{{ $t('tournament.exportCsvBtn') }}</span>
            </button>
            <button
              class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              @click="downloadJson"
            >
              <span>💾</span>
              <span>{{ $t('tournament.exportJsonBtn') }}</span>
            </button>
            <label
              class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📂</span>
              <span>{{ $t('tournament.importJsonBtn') }}</span>
              <input type="file" accept=".json" class="hidden" @change="handleFileImport" />
            </label>
            <button
              class="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 active:scale-95 text-red-200 border border-red-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              @click="confirmResetTournament"
            >
              <span>🗑️</span>
              <span>{{ $t('tournament.resetTournamentBtn') }}</span>
            </button>
          </div>
        </div>

        <!-- STANDINGS TABLE -->
        <div
          v-if="filteredStandings.length > 0"
          class="overflow-x-auto rounded-xl border border-gray-700 bg-gray-850"
        >
          <table class="w-full text-xs text-start rtl:text-right">
            <thead
              class="bg-gray-900 text-gray-400 uppercase font-bold text-[11px] border-b border-gray-700"
            >
              <tr>
                <th class="p-3 w-16 text-center">{{ $t('tournament.rankColumn') }}</th>
                <th class="p-3">{{ $t('tournament.playerColumn') }}</th>
                <th class="p-3 text-center" :title="$t('tournament.matchesPlayedFull')">
                  {{ $t('tournament.matchesPlayedColumn') }}
                </th>
                <th class="p-3 text-center" :title="$t('tournament.winsFull')">
                  {{ $t('tournament.winsColumn') }}
                </th>
                <th class="p-3 text-center" :title="$t('tournament.lossesFull')">
                  {{ $t('tournament.lossesColumn') }}
                </th>
                <th class="p-3 text-center" :title="$t('tournament.winRateFull')">
                  {{ $t('tournament.winRateColumn') }}
                </th>
                <th class="p-3 text-center">{{ $t('tournament.mvpColumn') }}</th>
                <th class="p-3 text-center">{{ $t('tournament.warningsColumn') }}</th>
                <th class="p-3 text-center">{{ $t('tournament.avgPointsColumn') }}</th>
                <th class="p-3 text-end">{{ $t('tournament.totalColumn') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr
                v-for="st in filteredStandings"
                :key="st.playerName"
                class="hover:bg-gray-800/50 transition-colors"
                :class="
                  st.rank === 1
                    ? 'bg-amber-950/20'
                    : st.rank === 2
                      ? 'bg-slate-800/40'
                      : st.rank === 3
                        ? 'bg-amber-900/10'
                        : ''
                "
              >
                <!-- Rank Medal -->
                <td class="p-3 text-center font-bold">
                  <span v-if="st.rank === 1" class="text-base">🥇</span>
                  <span v-else-if="st.rank === 2" class="text-base">🥈</span>
                  <span v-else-if="st.rank === 3" class="text-base">🥉</span>
                  <span v-else class="text-gray-400 font-mono">#{{ st.rank }}</span>
                </td>

                <!-- Player Name -->
                <td class="p-3 font-bold text-white">
                  {{ st.playerName }}
                </td>

                <!-- Stats Columns -->
                <td class="p-3 text-center font-mono">{{ st.matchesPlayed }}</td>
                <td class="p-3 text-center font-mono text-emerald-400 font-bold">{{ st.wins }}</td>
                <td class="p-3 text-center font-mono text-red-400">{{ st.losses }}</td>
                <td class="p-3 text-center font-mono font-bold">{{ st.winRate }}%</td>
                <td class="p-3 text-center font-mono text-amber-400 font-bold">
                  {{ st.mvpCount }}
                  <span v-if="st.secondMvpCount > 0" class="text-gray-500 text-[10px]">
                    (+{{ st.secondMvpCount }})</span
                  >
                </td>
                <td class="p-3 text-center font-mono text-yellow-400">{{ st.totalWarnings }}</td>
                <td class="p-3 text-center font-mono text-gray-300">
                  {{ st.averagePointsPerMatch }}
                </td>

                <!-- Total Score -->
                <td class="p-3 text-end font-mono font-black text-sm text-amber-400">
                  {{ st.totalPoints }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-else
          class="bg-gray-850 p-8 rounded-2xl border border-gray-800 text-center space-y-3"
        >
          <div class="text-4xl">🏆</div>
          <p class="text-xs text-gray-400 max-w-sm mx-auto">
            {{ $t('tournament.emptyStandings') }}
          </p>
        </div>

        <!-- RECORDED MATCHES HISTORY ACCORDION -->
        <div v-if="matches.length > 0" class="space-y-2 pt-2">
          <h4
            class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between"
          >
            <span>📜 {{ $t('tournament.matchHistoryTitle', { count: matches.length }) }}</span>
            <button
              class="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              @click="showMatchHistory = !showMatchHistory"
            >
              {{ showMatchHistory ? '▲ Hide' : '▼ Show' }}
            </button>
          </h4>

          <div v-if="showMatchHistory" class="space-y-2">
            <div
              v-for="m in matches"
              :key="m.id"
              class="bg-gray-800/60 p-3 rounded-xl border border-gray-700 flex justify-between items-center text-xs"
            >
              <div>
                <span class="font-bold text-white">{{
                  $t('tournament.matchCardTitle', { number: m.matchNumber, mode: m.gameModeId })
                }}</span>
                <span class="text-gray-400 text-[11px] ms-2"
                  >({{ m.totalDays }} Days • Winner: {{ m.winnerFaction.toUpperCase() }})</span
                >
                <p v-if="m.mvpPlayerName" class="text-amber-400 text-[11px] mt-0.5">
                  🥇 MVP: {{ m.mvpPlayerName }}
                  <span v-if="m.secondMvpPlayerName">| 🥈 2nd: {{ m.secondMvpPlayerName }}</span>
                </p>
              </div>

              <button
                class="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg text-xs transition-colors cursor-pointer"
                :title="$t('tournament.deleteMatch')"
                @click="handleDeleteMatch(m.id)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: SCORING RULES CONFIG -->
      <div v-else-if="activeTab === 'rules'" class="space-y-4 animate-fade-in">
        <!-- PRESET SELECTOR -->
        <div class="bg-gray-800/80 p-4 rounded-2xl border border-gray-700 space-y-2">
          <label class="block text-xs font-bold text-white uppercase tracking-wider">
            {{ $t('tournament.scoringPresets') }}
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              class="p-2.5 rounded-xl border text-xs font-bold transition-all text-start"
              :class="
                activePresetKey === 'iranianLeague'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'
              "
              @click="applyPreset('iranianLeague')"
            >
              {{ $t('tournament.presetIranianLeague') }}
            </button>
            <button
              type="button"
              class="p-2.5 rounded-xl border text-xs font-bold transition-all text-start"
              :class="
                activePresetKey === 'standardTournament'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'
              "
              @click="applyPreset('standardTournament')"
            >
              {{ $t('tournament.presetStandard') }}
            </button>
            <button
              type="button"
              class="p-2.5 rounded-xl border text-xs font-bold transition-all text-start"
              :class="
                activePresetKey === 'simplePoints'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'
              "
              @click="applyPreset('simplePoints')"
            >
              {{ $t('tournament.presetSimple') }}
            </button>
          </div>
        </div>

        <!-- NUMERIC RULES INPUTS GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <label class="block text-[11px] font-bold text-gray-300 mb-1">{{
              $t('tournament.ruleWinPoints')
            }}</label>
            <input
              v-model.number="localRules.winPoints"
              type="number"
              step="0.5"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono font-bold text-white"
            />
          </div>
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <label class="block text-[11px] font-bold text-gray-300 mb-1">{{
              $t('tournament.ruleSurvivalBonus')
            }}</label>
            <input
              v-model.number="localRules.survivalBonus"
              type="number"
              step="0.5"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono font-bold text-white"
            />
          </div>
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <label class="block text-[11px] font-bold text-gray-300 mb-1">{{
              $t('tournament.ruleMvpPoints')
            }}</label>
            <input
              v-model.number="localRules.mvpPoints"
              type="number"
              step="0.5"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono font-bold text-white"
            />
          </div>
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <label class="block text-[11px] font-bold text-gray-300 mb-1">{{
              $t('tournament.ruleSecondMvpPoints')
            }}</label>
            <input
              v-model.number="localRules.secondMvpPoints"
              type="number"
              step="0.5"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono font-bold text-white"
            />
          </div>
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <label class="block text-[11px] font-bold text-gray-300 mb-1">{{
              $t('tournament.ruleWarningDeduction')
            }}</label>
            <input
              v-model.number="localRules.warningDeduction"
              type="number"
              step="0.25"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono font-bold text-white"
            />
          </div>
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <label class="block text-[11px] font-bold text-gray-300 mb-1">{{
              $t('tournament.ruleDoctorSaveBonus')
            }}</label>
            <input
              v-model.number="localRules.doctorSaveBonus"
              type="number"
              step="0.25"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs font-mono font-bold text-white"
            />
          </div>
        </div>

        <!-- SAVE RULES BUTTON -->
        <div class="flex justify-end items-center gap-3 pt-2">
          <p v-if="rulesSavedToast" class="text-xs text-emerald-400 font-bold animate-pulse">
            {{ $t('tournament.rulesSaved') }}
          </p>
          <button
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            @click="handleSaveRules"
          >
            {{ $t('tournament.saveRulesBtn') }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseModal from '../BaseModal.vue';
import { useTournamentService, TOURNAMENT_RULE_PRESETS } from '../../services/useTournamentService';
import type { Player, GameLog, GameMode, TournamentScoringRules } from '../../types';

interface Props {
  isOpen?: boolean;
  initialTab?: 'current-match' | 'leaderboard' | 'rules';
  currentPlayers?: Player[];
  gameLogs?: GameLog[];
  winnerFaction?: string | null;
  currentDay?: number;
  gameMode?: GameMode | null;
  nostradamusChoice?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  initialTab: 'leaderboard',
  currentPlayers: () => [],
  gameLogs: () => [],
  winnerFaction: 'town',
  currentDay: 1,
  gameMode: null,
  nostradamusChoice: null,
});

defineEmits<{
  (e: 'close'): void;
}>();

const tournament = useTournamentService();
const {
  scoringRules,
  matches,
  tournamentName,
  standings,
  totalMatchesCount,
  updateScoringRules,
  applyRulePreset,
  calculatePlayerScores,
  recordMatch,
  deleteMatch,
  resetTournament,
  exportAsJson,
  importFromJson,
  exportAsCsv,
} = tournament;

const activeTab = ref<'current-match' | 'leaderboard' | 'rules'>('leaderboard');
const selectedMvp = ref<string>('');
const selectedSecondMvp = ref<string>('');
const matchSavedToast = ref<boolean>(false);
const rulesSavedToast = ref<boolean>(false);
const isMatchRecorded = ref<boolean>(false);
const searchQuery = ref<string>('');
const showMatchHistory = ref<boolean>(false);
const activePresetKey = ref<string>('iranianLeague');

const localRules = ref<TournamentScoringRules>({ ...scoringRules.value });

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      activeTab.value =
        props.initialTab || (props.currentPlayers.length > 0 ? 'current-match' : 'leaderboard');
      localRules.value = { ...scoringRules.value };
      matchSavedToast.value = false;
      rulesSavedToast.value = false;
    }
  }
);

const hasCurrentMatch = computed(() => props.currentPlayers && props.currentPlayers.length > 0);

const currentMatchScores = computed(() => {
  if (!hasCurrentMatch.value) return [];
  return calculatePlayerScores(props.currentPlayers, props.gameLogs, props.winnerFaction, {
    mvpPlayerName: selectedMvp.value,
    secondMvpPlayerName: selectedSecondMvp.value,
    rules: scoringRules.value,
    nostradamusChoice: props.nostradamusChoice,
  });
});

const filteredStandings = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return standings.value;
  return standings.value.filter((s) => s.playerName.toLowerCase().includes(query));
});

const handleSaveMatch = () => {
  if (isMatchRecorded.value || !hasCurrentMatch.value) return;

  recordMatch({
    gameModeId: props.gameMode?.id || 'standard',
    gameModeName: props.gameMode?.nameKey || 'Standard',
    winnerFaction: props.winnerFaction || 'town',
    totalDays: props.currentDay,
    scores: currentMatchScores.value,
    mvpPlayerName: selectedMvp.value || undefined,
    secondMvpPlayerName: selectedSecondMvp.value || undefined,
  });

  isMatchRecorded.value = true;
  matchSavedToast.value = true;
  setTimeout(() => {
    matchSavedToast.value = false;
  }, 4000);
};

const handleDeleteMatch = (matchId: string) => {
  if (window.confirm('Are you sure you want to remove this match from tournament history?')) {
    deleteMatch(matchId);
  }
};

const applyPreset = (key: keyof typeof TOURNAMENT_RULE_PRESETS) => {
  activePresetKey.value = key;
  applyRulePreset(key);
  localRules.value = { ...scoringRules.value };
};

const handleSaveRules = () => {
  updateScoringRules(localRules.value);
  rulesSavedToast.value = true;
  setTimeout(() => {
    rulesSavedToast.value = false;
  }, 3000);
};

const downloadCsv = () => {
  const csv = exportAsCsv();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mpga_tournament_standings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadJson = () => {
  const json = exportAsJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mpga_tournament_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleFileImport = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (content) {
      const ok = importFromJson(content);
      if (ok) {
        alert('Tournament data imported successfully!');
      } else {
        alert('Failed to parse tournament JSON file.');
      }
    }
  };
  reader.readAsText(file);
};

const confirmResetTournament = () => {
  if (
    window.confirm(
      'Are you sure you want to clear all tournament match history? This action cannot be undone.'
    )
  ) {
    resetTournament();
    isMatchRecorded.value = false;
  }
};
</script>
