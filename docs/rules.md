# Mafia Rules & Mechanics

This document provides a comprehensive reference for game mechanics, faction rules, role abilities, Last Word Cards, night resolution priority, and victory conditions in the Mafia Party Game Assistant (MPGA).

---

## 1. Game Factions & Win Conditions

| Faction | Objective | Win Condition | Color Theme |
| :--- | :--- | :--- | :--- |
| **Town (Citizens)** | Identify and eliminate all Mafia members and hostile threats. | All living Mafia and hostile Third-Party (Zodiac) players are eliminated (`livingMafia === 0 && livingHostileThirdParty === 0`). | `text-town` (Blue / `#3B82F6`) |
| **Mafia** | Eliminate Town members and take control of the town. | The number of living Mafia players equals or exceeds the number of living Town players (`livingMafia >= livingTown`), and no hostile third party remains. | `text-mafia` (Red / `#EF4444`) |
| **Third Party (Nostradamus)** | Align with a chosen faction on Night 1 and survive/assist them. | Wins alongside whichever team (`town` or `mafia`) they pledged allegiance to on Night 1. | `text-thirdParty` (Purple / `#A855F7`) |
| **Third Party (Zodiac)** | Solo elimination of all other factions. | Outlasts both Town and Mafia (`livingMafia === 0 && livingTown === 0 && livingHostileThirdParty > 0`). | `text-amber-400` (Amber / `#F59E0B`) |

### Automatic Win Calculation Logic
The calculation engine in [`src/services/useWinCondition.ts`](file:///Users/ali.heristchian/Documents/learning/mpga/src/services/useWinCondition.ts) evaluates live player states on every status change:
1. **Town Victory (`winner: 'town'`):** Triggered when `livingMafiaCount === 0 && livingTownCount > 0 && livingHostileThirdPartyCount === 0`.
2. **Mafia Victory (`winner: 'mafia'`):** Triggered when `livingMafiaCount >= livingNonMafiaCount && livingMafiaCount > 0 && livingHostileThirdPartyCount === 0`.
3. **Third-Party Solo Victory (`winner: 'third-party'`):** Triggered when Town and Mafia have both been eliminated while the Zodiac survives.
4. **Draw / Stalemate (`winner: 'draw'`):** Triggered if both living counts reach `0`.
5. **Nostradamus Co-Victory (`nostradamusWon: true`):** If a Nostradamus is in play and their recorded Night 1 choice matches the calculated `winner`, Nostradamus is credited with a co-victory.
6. **Match Statistics Aggregation:** When game over occurs, the engine automatically collates metrics from `gameLogs` (total Doctor saves, Detective positive hits, total eliminations, total match days, and surviving player list).

---

## 2. Roles Reference

### Town Faction (`sideId: 'town'`)

* **Citizen (`citizen`)**
  * *Description:* Standard town resident with no active night abilities.
  * *Role in Game:* Relies on daytime debate, intuition, voting patterns, and behavior analysis to eliminate Mafia during the Day and Voting phases.
* **Doctor (`doctor`)**
  * *Active Ability (`treat`):* Chooses one player each night to protect from elimination.
  * *Rules:* If the protected target is attacked by Mafia or Vigilante, the target survives.
* **Detective (`detective`)**
  * *Active Ability (`investigate`):* Investigates one player per night to learn if they are Mafia.
  * *Moderator Signal & Gesture Protocol:*
    * The fundamental inquiry question is: **"Is this player a Mafia?"** (*آیا این بازیکن مافیا است؟*)
    * **Thumbs Up (👍):** **YES / Positive Inquiry (`استعلام مثبت`)** $\to$ The target IS a Mafia member.
    * **Thumbs Down (👎):** **NO / Negative Inquiry (`استعلام منفی`)** $\to$ The target is NOT Mafia (Citizen / Town member).
  * *Godfather Exception:* In standard Godfather tournament rules, the Godfather has a clean inquiry (*استعلام منفی*) and appears innocent (Thumbs Down 👎) unless stated otherwise.
* **Constantine (`constantine`)**
  * *Active Ability (`revive`):* Can revive one eliminated player back into the game (typically once per game).
  * *Rules:* Target must be currently dead. The revived player re-enters as an active living player.
* **Leon / Vigilante (`leon`)**
  * *Active Ability (`vigillante-shot`):* Can take a night shot to eliminate a suspected Mafia player.
  * *Rules & Penalty:* High risk. If Leon targets an innocent Town citizen, Leon dies from guilt at sunrise while the innocent citizen survives unharmed. Under Iranian Mafia tournament rules, **Leon's guilt penalty is absolute and unpreventable** — a Doctor cannot save Leon from guilt death. If Leon targets a Mafia player, the Mafia member is eliminated. Leon cannot target themselves.
* **Bodyguard (`bodyguard`)**
  * *Active Ability (`protect`):* Chooses one player each night to protect from lethal attacks.
  * *Passive Ability (`shield`):* Possesses a single-use bulletproof shield that absorbs one deadly shot.
* **Priest (`priest`)**
  * *Active Ability (`absolve`):* Chooses one player each night to cleanse from silence, canceling the Silencer's gag before sunrise.

### Mafia Faction (`sideId: 'mafia'`)

* **Godfather (`godfather`)**
  * *Active Ability (`mafia-shot`):* Directs the Mafia's deadly night shot. Cannot target themselves.
  * *Passive Ability (`shield`):* Possesses a single-use bulletproof shield. Upon taking a deadly night shot, the shield absorbs the attack and shatters (`isShieldBroken = true`). On all subsequent nights, the Godfather's shield is broken and they are vulnerable to lethal shots.
* **Matador (`matador`)**
  * *Active Ability (`block`):* Blocks one player per night, preventing them from using their active night ability. Cannot target themselves.
  * *Rules:* If the Matador blocks a Doctor, Detective, or Vigilante, their action for that night fails.
* **Silencer (`silencer`)**
  * *Active Ability (`silence`):* Gags one player each night, forbidding them from speaking, participating in discussions, or requesting challenge time during the entire upcoming Day phase.
* **Saul Goodman (`saul-goodman`)**
  * *Active Ability (`buy`):* Can bribe or recruit players. In Iranian Mafia tournament rules, if Saul Goodman buys a simple **Citizen (`citizen`)**, that citizen is corrupted and permanently converts to the Mafia team (`sideId: 'mafia'`). If used on roles other than simple Citizen, the bribe fails to recruit. Cannot target themselves.
* **Mafia Grunt (`mafia`)**
  * *Description:* Regular Mafia member who participates in team deliberations and voting during the day.
  * *Night 1 Familiarization:* On Night 1, all Mafia members wake up together silently to recognize their teammates.

### Third Party (`sideId: 'third-party'`)

* **Zodiac (`zodiac`)**
  * *Active Ability (`zodiac-shot`):* Delivers a lethal night shot to eliminate any targeted player.
  * *Passive Abilities:*
    * *Bulletproof Shield (`shield`):* Single-use armor absorbing one deadly attack.
    * *Clean Inquiry (`clean-inquiry`):* Registers as Innocent / Negative inquiry (Thumbs Down 👎) to the Detective.
  * *Win Condition:* Outlasts both Town and Mafia factions. Town cannot claim victory while Zodiac is alive.
* **Nostradamus (`nostradamus`)**
  * *Night 1 3-Player Inquiry:* On Night 1, Nostradamus selects 3 living players. The moderator counts how many of those 3 are Mafia members and silently shows the count using fingers (e.g., 2 fingers = 2 Mafias). The identities of *which* players are Mafia remain hidden.
  * *Majority Threshold & Tactical Rule:* If the count of Mafia members among the 3 choices exceeds half of the total living Mafias in the game ($> N_{\text{mafia}}/2$, e.g., $\ge 2$ Mafias in a 3-Mafia game), Nostradamus is strategically recommended to side with the **Mafia**.
  * *Third-Party Agency:* Nostradamus is an independent 3rd-party role and retains full strategic freedom to choose whichever side (`town` or `mafia`) they wish, and can decide how to play throughout the game.
  * *Passive Ability (`unlimited-shield`):* Permanent night-shot immunity to ensure third-party balance.

---

## 3. Last Word Cards (*کارت حرکت آخر*)

When a player is eliminated during the daytime Voting phase, they enter the **Midday (*Nim-Rouz*) Phase** where they give an exit speech and draw one random card from the remaining deck. Drawn cards are permanently retired.

| Card Name | Identifier | Effect & Peripheral Rules |
| :--- | :--- | :--- |
| **Mind Inquiry (ذهن‌زیبا)** | `mind-inquiry` | The eliminated player can guess the exact roles of up to 2 living players. If correct, special tournament points/rewards apply. |
| **Silence of the Lambs (سکوت بره)** | `silence` | The eliminated player selects one living player who cannot speak during the next Day phase. |
| **Redemption (فرش قرمز)** | `redemption` | The eliminated player designates a candidate who will be automatically brought to the defense stage on the next day's voting. |
| **Final Shot / Double Vote (شلیک نهایی)** | `double-vote` | Grants the player's faction or chosen ally an extra voting point in the next voting phase. |
| **Identity Reveal (افشای هویت)** | `revealed-alignment` | The moderator publicly announces the exact role and alignment of the eliminated player to the town. |
| **Golden Inquiry (ذهن طلایی)** | `beautiful-mind` | The eliminated player asks the moderator whether a specific faction holds a majority in a chosen section of the table. |

---

## 4. Night Action Resolution & Priority Engine

Night actions cannot be resolved simultaneously because dependencies exist (e.g., a **Block** must occur before a **Heal** or **Shot**, and **Heals** prevent **Deaths**).

```mermaid
flowchart TD
    N1["Night 1 Introduction: Mafia Team Familiarization Wake-Up"]
    P99["Priority 99: Passive Shields Active (Godfather / Nostradamus / Zodiac / Bodyguard)"]
    P90["Priority 90: Role Block, Silence & Bribe (Matador 'block', Silencer 'silence', Saul 'buy')"]
    P85["Priority 85: Absolution & Silence Cleansing (Priest 'absolve')"]
    P80["Priority 80: Doctor Save & Bodyguard Protection ('treat', 'protect')"]
    P70["Priority 70: Lethal Night Shots (Godfather 'mafia-shot', Leon 'vigillante-shot', Zodiac 'zodiac-shot')"]
    P50["Priority 50: Inquiries & Information (Detective 'investigate', Nostradamus 'choose-side')"]
    P10["Priority 10: Constantine Revive ('revive')"]
    DEATHS["Dawn Resolution: Passive Shields, Saves, Silences & Leon Penalty -> Actual Deaths & Silences Logged"]

    N1 --> P99 --> P90 --> P85 --> P80 --> P70 --> P50 --> P10 --> DEATHS
```

### Standardized Descending Priority Ladder (Higher Number = Executes First)

| Priority | Action / Ability | Actor | Target Restrictions | Effect / Logic |
| :---: | :--- | :--- | :--- | :--- |
| **N/A** | *Mafia Introduction* | All Living Mafia | Self Team (Night 1 only) | Familiarization wake-up (no shot/kill). |
| **99** | `shield` / `unlimited-shield` | Godfather, Nostradamus, Zodiac, Bodyguard | Self (Passive) | Protects bearer against deadly shots. |
| **90** | `block` | Matador | Other living players | Cancels the target's ability execution for the night. |
| **90** | `silence` | Silencer | Other living players | Gags target; removes speech and challenge rights for the next Day phase. |
| **90** | `buy` | Saul Goodman | Other living players | Applies bribe effect for the night/day. |
| **85** | `absolve` | Priest | Any living player | Cleanses target from silence, lifting the Silencer's gag. |
| **80** | `treat` | Doctor | Any living player (self-target allowed) | Saves target from elimination if shot on the same night. |
| **80** | `protect` | Bodyguard | Any living player | Protects target from lethal attacks on the same night. |
| **70** | `mafia-shot` | Godfather | Other living players | Marks target for elimination unless saved or shielded. |
| **70** | `zodiac-shot` | Zodiac | Any other living player | Marks target for elimination unless saved or shielded. |
| **70** | `vigillante-shot` | Leon (Vigilante) | Other living players | If target is Town: Leon dies, target safe. If target is Mafia: Mafia dies. |
| **50** | `investigate` | Detective | Other living players | Reveals target's faction (`town` vs. `mafia`). Godfather and Zodiac register as negative/innocent. |
| **50** | `choose-side` | Nostradamus | Up to 3 players + Town/Mafia choice | Moderator signals Mafia count; records chosen win condition. |
| **10** | `revive` | Constantine | Dead players only | Restores a dead player back to life (`isDead: false`). |

---

## 5. Game Modes & Balance Rules

Modes are configured in [`src/data/modes.ts`](file:///Users/ali.heristchian/Documents/learning/mpga/src/data/modes.ts):

* **Godfather Mode:**
  * Minimum Players: 4 (recommended: 8–12)
  * Speaking Time: 40 seconds
  * Borrowed / Challenge Time: 25 seconds
  * Defense Speech Time: 60 seconds
  * Daily Turn Shift: 2 seats
  * Voting Rounding: `ceil` (half of alive players rounded up)
  * Balance Constraint: Maximum Mafia ratio is 34% of total player count.
* **Classic Mafia Mode:**
  * **Allowed Roles:** Pure 4-role classic setup: **Mafia (`mafia`)**, **Citizen (`citizen`)**, **Detective / Cop (`detective`)**, and **Doctor (`doctor`)**. Advanced roles are excluded.
  * Minimum Players: 4 (recommended: 6–10)
  * Speaking Time: 60 seconds
  * Borrowed / Challenge Time: 30 seconds
  * Defense Speech Time: 60 seconds
  * Daily Turn Shift: 1 seat
  * Voting Rounding: `half` (standard `Math.round`)
  * Balance Constraint: Maximum Mafia ratio is 33% of total player count.
* **Zodiac Scenario Mode:**
  * **Allowed Roles:** Zodiac, Bodyguard, Godfather, Doctor, Detective, Mafia, Citizen.
  * Minimum Players: 5 (standard: 8–12 players)
  * Speaking Time: 45 seconds
  * Borrowed / Challenge Time: 25 seconds
  * Daily Max Challenges: 2 challenges per day
  * Daily Turn Shift: 2 seats
  * Voting Rounding: `ceil`
  * Balance Constraint: Solo third-party assassin mechanic.
* **Noir Vendetta Mode:**
  * **Allowed Roles:** Silencer, Priest, Godfather, Doctor, Detective, Mafia, Citizen.
  * Minimum Players: 5 (standard: 8–12 players)
  * Speaking Time: 50 seconds
  * Borrowed / Challenge Time: 25 seconds
  * Defense Speech Time: 60 seconds
  * Daily Turn Shift: 1 seat
  * Voting Rounding: `ceil`
  * Balance Constraint: Silencer and Priest tactical counter-play.

---

## 6. Voting Mechanics & Candidate Caps

Voting calculations and constraints are handled by [`src/services/useVotingService.js`](file:///Users/ali.heristchian/Documents/learning/mpga/src/services/useVotingService.js):

1. **Self-Voting Prohibition & Maximum Vote Cap:**
   * In standard Mafia rules, a player under accusation/vote cannot vote to eliminate or qualify themselves.
   * Consequently, the maximum number of votes any single candidate can receive in either Pre-Vote or Final Vote stages is strictly bounded by:
     $$\text{Max Votes} = \max(0, N_{\text{alive}} - 1)$$
   * UI increment controls automatically disable when this ceiling is reached, and vote inputs are clamped within $[0, \text{Max Votes}]$.
2. **Pre-Vote Qualification Threshold:**
   * A player qualifies for the defense stage if their pre-vote tally reaches the mode-defined threshold:
     $$\text{Threshold}_{\text{ceil}} = \lceil N_{\text{alive}} / 2 \rceil \quad \text{or} \quad \text{Threshold}_{\text{round}} = \text{round}(N_{\text{alive}} / 2)$$
3. **Closed-Eye Final Vote:**
   * Defenders who reach the threshold enter defense speeches followed by closed-eye town voting.
   * The defender receiving the highest final vote count is eliminated. Ties trigger the Destiny Spin tie-breaker roulette.

---

## 7. Day Phase Speaking & Challenge Time Protocol

1. **Spotlight Speaking Turns:**
   * Each living player receives an uninterrupted timed speaking turn (e.g., 40s in Godfather mode, 60s in Classic mode).
2. **Challenge Time Request & Transfer:**
   * While a player is speaking, another living player can request "Challenge Time" (وقت چالش) from the active speaker.
   * If granted, the speaker's main countdown timer is paused, and the challenger is placed in the spotlight for a shorter speech duration (`borrowedTimeToTalk`, e.g., 25s).
3. **Single-Use Daily Constraint:**
   * **One Challenge Per Speaker:** At most one challenge can be granted per speaker turn.
   * **One Challenge Per Player Per Day:** Once a player takes challenge time, they are marked as having used their challenge quota for that Day phase and cannot request or take challenge time again until the next day.
4. **Speaker Resume:**
   * When the challenger's time expires or the moderator ends the challenge early, the spotlight returns to the original speaker who finishes their exact remaining paused seconds.
