# Mafia Rules & Mechanics

This document provides a comprehensive reference for game mechanics, faction rules, role abilities, Last Word Cards, night resolution priority, and victory conditions in the Mafia Party Game Assistant (MPGA).

---

## 1. Game Factions & Win Conditions

| Faction | Objective | Win Condition | Color Theme |
| :--- | :--- | :--- | :--- |
| **Town (Citizens)** | Identify and eliminate all Mafia members. | All living Mafia players are eliminated (`livingMafia === 0`). | `text-town` (Blue / `#3B82F6`) |
| **Mafia** | Eliminate Town members and take control of the town. | The number of living Mafia players equals or exceeds the number of living Town players (`livingMafia >= livingTown`). | `text-mafia` (Red / `#EF4444`) |
| **Third Party (Nostradamus)** | Align with a chosen faction on Night 1 and survive/assist them. | Wins alongside whichever team (`town` or `mafia`) they pledged allegiance to on Night 1. | `text-thirdParty` (Purple / `#A855F7`) |

### Automatic Win Calculation Logic
The calculation engine in [`src/services/useWinCondition.js`](file:///Users/ali.heristchian/Documents/learning/mpga/src/services/useWinCondition.js) evaluates live player states on every status change:
1. **Town Victory (`winner: 'town'`):** Triggered when `livingMafiaCount === 0 && livingTownCount > 0`.
2. **Mafia Victory (`winner: 'mafia'`):** Triggered when `livingMafiaCount >= livingTownCount && livingMafiaCount > 0`.
3. **Draw / Stalemate (`winner: 'draw'`):** Triggered if both living counts reach `0`.
4. **Nostradamus Co-Victory (`nostradamusWon: true`):** If a Nostradamus is in play and their recorded Night 1 choice matches the calculated `winner`, Nostradamus is credited with a co-victory.
5. **Match Statistics Aggregation:** When game over occurs, the engine automatically collates metrics from `gameLogs` (total Doctor saves, Detective positive hits, total eliminations, total match days, and surviving player list).

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
  * *Active Ability (`investigate`):* Investigates one player per night to learn their alignment (`town` or `mafia`).
  * *Rules:* In standard Godfather mode, the Godfather may appear innocent (or have a protective shield depending on mode settings).
* **Constantine (`constantine`)**
  * *Active Ability (`revive`):* Can revive one eliminated player back into the game (typically once per game).
  * *Rules:* Target must be currently dead. The revived player re-enters as an active living player.
* **Leon / Vigilante (`leon`)**
  * *Active Ability (`vigillante-shot`):* Can take a night shot to eliminate a suspected Mafia player.
  * *Rules:* High risk; eliminating an innocent town member harms the Town's majority.

### Mafia Faction (`sideId: 'mafia'`)

* **Godfather (`godfather`)**
  * *Active Ability (`mafia-shot`):* Directs the Mafia's deadly night shot.
  * *Passive Ability (`shield`):* Possesses a bulletproof shield that absorbs one night shot before breaking.
* **Matador (`matador`)**
  * *Active Ability (`block`):* Blocks one player per night, preventing them from using their active night ability.
  * *Rules:* If the Matador blocks a Doctor, Detective, or Vigilante, their action for that night fails.
* **Saul Goodman (`saul-goodman`)**
  * *Active Ability (`buy`):* Can bribe or influence players, creating strategic advantages for the Mafia.
* **Mafia Grunt (`mafia`)**
  * *Description:* Regular Mafia member who participates in team deliberations and voting during the day.

### Third Party (`sideId: 'third-party'`)

* **Nostradamus (`nostradamus`)**
  * *Active Ability (`choose-side`):* On Night 1, Nostradamus secretly chooses which team (Town or Mafia) they want to align with.
  * *Passive Ability (`unlimited-shield`):* Permanent night-shot immunity to ensure fair third-party gameplay.

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

The engine in [`src/services/gameEngine.js`](file:///Users/ali.heristchian/Documents/learning/mpga/src/services/gameEngine.js) processes actions in strict ascending numerical priority:

```mermaid
flowchart TD
    P0["Priority 0: Passive Shields Active (Godfather / Nostradamus)"]
    P1["Priority 1: Alignment Choice (Nostradamus 'choose-side')"]
    P2["Priority 2: Mafia Night Shot (Godfather 'mafia-shot')"]
    P3["Priority 3: Role Block & Bribe (Matador 'block', Saul 'buy')"]
    P4["Priority 4: Doctor Heal & Vigilante Shot ('treat', 'vigillante-shot')"]
    P5["Priority 5: Detective Investigation ('investigate')"]
    P6["Priority 6: Constantine Revive ('revive')"]
    DEATHS["Final Calculation: Passive Shields & Doctor Saves evaluated -> Actual Deaths Logged"]

    P0 --> P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> DEATHS
```

### Resolution Order Table

| Priority | Action / Ability | Actor | Target Restrictions | Effect / Logic |
| :---: | :--- | :--- | :--- | :--- |
| **0** | `shield` / `unlimited-shield` | Godfather, Nostradamus | Self (Passive) | Protects bearer against deadly shots. |
| **1** | `choose-side` | Nostradamus | Town or Mafia player | Records Nostradamus's chosen win condition. |
| **2** | `mafia-shot` | Godfather | Any other living player | Marks target for elimination unless protected or shielded. |
| **3** | `block` | Matador | Any other living player | Cancels the target's ability if priority > 3. |
| **3** | `buy` | Saul Goodman | Any other living player | Applies bribe effect for the night/day. |
| **4** | `treat` | Doctor | Any living player | Saves target from elimination if shot on the same night. |
| **4** | `vigillante-shot` | Leon (Vigilante) | Any other living player | Marks target for elimination unless healed or shielded. |
| **5** | `investigate` | Detective | Any other living player | Reveals target's faction (`town` vs. `mafia`) in moderator log. |
| **6** | `revive` | Constantine | Dead players only | Restores a dead player back to life (`isDead: false`). |

---

## 5. Game Modes & Balance Rules

Modes are configured in [`src/data/modes.js`](file:///Users/ali.heristchian/Documents/learning/mpga/src/data/modes.js):

* **Godfather Mode:**
  * Minimum Players: 4 (recommended: 8–12)
  * Speaking Time: 40 seconds
  * Borrowed / Challenge Time: 25 seconds
  * Defense Speech Time: 60 seconds
  * Daily Turn Shift: 2 seats
  * Voting Rounding: `ceil` (half of alive players rounded up)
  * Balance Constraint: Maximum Mafia ratio is 34% of total player count.
* **Classic Mafia Mode:**
  * Minimum Players: 4 (recommended: 6–10)
  * Speaking Time: 60 seconds
  * Borrowed / Challenge Time: 30 seconds
  * Defense Speech Time: 60 seconds
  * Daily Turn Shift: 1 seat
  * Voting Rounding: `half` (standard `Math.round`)
  * Balance Constraint: Maximum Mafia ratio is 33% of total player count.

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
