# Troop Mechanics — per-troop D-11 binding

The mechanical companion to `concept.md` (roster + lore prose) and `INVENTORY.md §3–4`
(asset rosters + ability-FX). This doc binds the **53 archetypes** to the locked combat
systems — chiefly **D-11** (typed resistances + status-immunity) — which the prose rosters
describe only as ad-hoc notes ("fire-immune", "fearless", `MR●●●●`).

Like `TOWERS.md`, this is **qualitative by design** (D-04: each troop is one fixed,
intricately-tuned design — no levels). Resistances are **bands**, not final percentages;
tuning happens in implementation. Behaviours (auras, shields, summons) live in
`INVENTORY.md §4` + `SYSTEMS.md` and are only *referenced* here.

**Status:** conventions + all 5 world matrices **locked (D-17)**. Magic-resist resolved =
Crypt-school bundle; the boss/champion CC conventions are locked. Residual flavour in §7.

---

## 1. Conventions — trait keyword → D-11 **[LOCKED — D-17]**

The point: don't hand-author 53×11 cells. Define keyword rules; the matrix derives.

**Resistance bands** (both PHYS — from old *Armor* — and MAGIC — from old *MR*):
`–` none · `light` · `med` · `high` · `heavy` · `fort` (fortified). Elemental types
(FIRE/FROST/LIGHTNING/CURSE) default **normal**; only specialists deviate
(`resist` / `immune` / `vuln`).

**Keyword rules** (prose trait → D-11 entry):
- **"fearless"** → **FEAR-immune**. (Cursed Soldier, Abyssal Behemoth, Clockwork; granted to allies by FearlessAura emitters, which are themselves FEAR-immune while the aura is up.)
- **"immune to all slow"** (Paladin) → **SLOW-immune + FREEZE-immune** (freeze is hard-slow).
- **"fire-immune / immune to fire & burn"** → **FIRE = immune + BURN-immune**. (Ash-Walker, Hellhound.)
- **"mechanical / automaton"** → **BURN-immune** (no flesh to burn) and, where flagged, **LIGHTNING-vuln**. (Clockwork Sentinel.)
- **"high magic-resist" clergy** ("shrug off magic / ice & curse barely dent") → **resist vs the Crypt school (FROST/CURSE/LIGHTNING)** — the only arcane player damage (D-17); unit-specific FROST/CURSE entries stack on top.

**Role rules** (unit class → D-11, regardless of prose):
- **Boss** (★) → **FEAR-immune + STUN-immune + execute-immune** (the %-max-HP execute already excludes bosses, D-14 Crypt-6); **SLOW = resist** (freeze/slow still bite but can't lock a boss). One life unless noted.
- **Champion** *(per-world elite)* → **execute-immune + STUN-resist** (so a lucky proc can't trivialise the set-piece unit); standing resists per its prose.
- **Mounted gem-carrier** (Golden / Royal Prince) → **dynamic PHYS**: `fort` while mounted → **`–` after the on-grab dismount** (D-09: loses armor while carrying).

These five role rules + five keyword rules generate ~90% of the cells below; only flavour
deviations are spelled out per unit.

**How to read:** `PHYS` = physical-armor band; `MAGIC` = resist vs the Crypt school
(FROST/CURSE/LIGHTNING) band (D-17). `Elem/vuln` = additional elemental deviations that
**stack** on top. `Status-imm` = subset of {FEAR, SLOW, STUN, BURN, CURSE}. `Key mechanic`
→ see `concept.md` / `INVENTORY §4` (not repeated here).

---

## 2. W1 · Great Grasslands — The General's Host (Orc towers → **PHYSICAL**)

| Unit | PHYS | MAGIC | Elem/vuln | Status-imm | Key mechanic |
|---|---|---|---|---|---|
| Peasant | – | – | – | – | swarm fodder |
| Guard | light | – | – | – | line infantry |
| Outrider | – | – | – | – | HP in the horse; very fast |
| Knight | heavy | – | – | – | armor wall |
| Paladin | heavy | – | – | **SLOW, FREEZE** | unslowable bruiser |
| Banner-Sergeant | light | – | – | (self FEAR via own aura) | FearlessAura: allies fearless + speed |
| Pavise Guard | **fort** | – | – | – | Taunt: forces tower targeting |
| Knight-Lieutenant *(champ)* | high | – | – | **execute, STUN-resist** | 2s invuln first time <50% |
| Golden Prince *(carrier)* | **fort→–** | – | – | – | dismounts on gem-grab (D-09) |
| ★ The General *(boss)* | heavy | – | – | **FEAR, STUN, execute; SLOW-resist** | phased summoner (D-10) |

**Design tension:** almost pure PHYS-armor pressure, no elemental/status complexity — the
tutorial world. Answer = Orc armor-pierce (Ballista/Harpoon + Orc skill 7).

---

## 3. W2 · Holy Mountains — High Priest's Procession (Crypt towers → **FROST + CURSE/FEAR (+LIGHTNING)**)

*Returning (full profile in §2): **Outrider**, **Paladin**, **Knight-Lieutenant**, **Pavise Guard**.*

| Unit | PHYS | MAGIC | Elem/vuln | Status-imm | Key mechanic |
|---|---|---|---|---|---|
| Acolyte | – | light | – | – | baseline; faint holy ward |
| Flagellant | – | – | – | **FEAR** | Frenzy: faster as HP drops (burst it) |
| Bard | – | light | – | – | StationaryPerformer: sing = speed buff |
| Temple Guard | heavy | heavy | – | – | anti-Crypt wall (MAGIC band already = FROST/CURSE/LIGHTNING resist) |
| War Cleric | – | med | – | – | HealAura |
| Inquisitor | – | high | – | (CleanseAura strips SLOW/FREEZE/CURSE off allies) | hard-counters the ice spec |
| Monk | light | med | – | – | ascends → Templar at 80% path |
| Templar *(champ; Monk's form)* | high | high | – | **execute, STUN-resist** | invuln + reflect one hit |
| Seraph *(flyer)* | – | heavy | – | – | water-lane flyer (D-15) |
| ★ The High Priest *(boss)* | med | **fort** | – | **FEAR, STUN, execute; SLOW-resist** | Sanctuary cleanse + phased summon |

**Design tension:** the roster *is* the anti-Crypt counter — FEAR-immune zealots, MAGIC/
school-resist clergy, and a cleanser undoing freeze/curse. Answer = mix damage types
(the **Lightning terminal** ignores frost/curse resist) and burst the Inquisitor first.

---

## 4. W3 · Sea of Sand — Chief Rebel's Warband (Demon towers → **FIRE + BURN**)

| Unit | PHYS | MAGIC | Elem/vuln | Status-imm | Key mechanic |
|---|---|---|---|---|---|
| Sand Raider | – | – | – | – | fast fodder |
| Dune Nomad | light | – | – | – | desert line |
| Ash-Walker | – | med | **FIRE-immune** | **BURN** | forces non-fire damage |
| Mirage Dancer | – | – | – | – | Untargetable blink (wastes the beam) |
| Sandstorm Shaman | – | high | – | – | SandstormCover: hides allies 2s |
| Dune Behemoth *(+rider)* | heavy | med | – | – | AoE-soaking mega-tank (CC-able; only Abyssal is fear-immune) |
| Rebel Sapper | – | – | – | – | DeathExplosion disables nearest tower |
| Glass Sentinel | – | high | – | – | DamageToHeal window (punishes raw fire) |
| Giant Vulture *(+rider, flyer)* | – | – | – | – | water-lane flyer; lands on carry |
| Camel Caravan *(group 3–4)* | light | – | – | – | GroupCohesion mutual-heal |
| Renegade Knight *(champ)* | high | med | – | **execute, STUN-resist** | ShieldMode |
| ★ Chief Rebel *(boss)* | high | – | – | **FEAR, STUN, execute; SLOW-resist** | sandstorm summon + gold-steal |

**Design tension:** attacks Demon FIRE directly — a fire-immune, two untargetable
"waste the channel" units, and a damage→heal sentinel. Answer = mix non-fire (Orc/Goblin
PHYS), **Searing Weakness** (Demon skill 10) to crack fire-resist, time bursts past blinks.

---

## 5. W4 · Royal Gardens — King's Royal Guard (Goblin towers → **PHYSICAL engineering**)

| Unit | PHYS | MAGIC | Elem/vuln | Status-imm | Key mechanic |
|---|---|---|---|---|---|
| Household Guard | med | – | – | – | elite baseline |
| Kingsguard | heavy | – | – | – | armor wall (shred bait) |
| Royal Engineer | light | – | – | – | SteamShield: area damage-reduction |
| Court Conjurer | – | heavy | – | – | AllyShield absorb bubble |
| Clockwork Sentinel *(flyer)* | high | med | **LIGHTNING-vuln** | **FEAR, BURN** | automaton; propeller-flies; lands on carry |
| Royal Standard-Bearer | med | – | – | – | FearlessAura + armor buff |
| Royal Falconer *(+hawk, flyer)* | – | light | – | – | pond-lane flyer |
| Royal Prince *(carrier)* | **fort→–** | – | – | – | dismounts on gem-grab (D-09) |
| Siege Wagon *(+crew)* | **fort** | – | – | – | mega-tank; crew pops SteamShields |
| Lord-Commander *(champ)* | high | – | – | **execute, STUN-resist** | rally + ShieldMode |
| ★ The King *(boss, 1 life)* | heavy | – | – | **FEAR, STUN, execute; SLOW-resist** | Royal Decree overcharges power stations |

**Design tension:** attacks Goblin engineering — shielders blunt drone DPS, two flyers test
the anti-air drones (skill 4), heavy armor demands armor-shred (Auger/Doom Driller + skill
3). **Clockwork's LIGHTNING-vuln** is the cross-faction hook: build a Crypt Lightning tower.

---

## 6. W5 · Shadow Realm — The Shadow Legion (**all four families buildable** — "use everything")

| Unit | PHYS | MAGIC | Elem/vuln | Status-imm | Key mechanic |
|---|---|---|---|---|---|
| Shadow Wraith | – | – | – | – | Untargetable phase-flicker; fast |
| Cursed Soldier | med | light | – | **FEAR** | corrupted, fearless |
| Imp Swarm *(flyer)* | – | – | **FIRE-resist** | – | demonic flyer pack; lands on carry |
| Hellhound | – | – | **FIRE-immune** | **BURN** | very fast packs |
| Void Priest | – | heavy | – | – | Resurrect (revives corpses, cap 2, D-10) |
| Abyssal Behemoth *(+rider)* | heavy | high | – | **FEAR** | fear-immune mega-tank |
| Soul-Eater | – | med | – | – | DeathLeech: heals when an ally dies |
| Gem Shade *(carrier)* | – | – | – | – | BlinkToGem on grab (D-09) |
| Doom Knight *(champ)* | heavy | high | – | **execute, STUN-resist** | ShieldMode + reflect |
| ★ Demon Shadow King *(final boss)* | heavy | heavy | – | **FEAR, STUN, execute; SLOW-resist** | per-portal summoner + darkness disable (D-10) |

**Design tension:** the union of W1–W4 stressors (fearless, fire-immune, untargetable,
revive, leech, tower-disable). Since **all four tower families build here**, the player must
deploy the whole toolkit — the campaign's graduation exam.

---

## 7. Resolved — locked as D-17

- **A · magic-resist** = resist vs the Crypt school (FROST/CURSE/LIGHTNING) — the only arcane player damage. Unit-specific FROST/CURSE entries stack on top. (Amends D-11.)
- **B · demonic fire-resist** — Imp Swarm = **FIRE-resist** (not immune, so Demon towers stay relevant); Dune Behemoth stays fully **CC-able** (only Abyssal Behemoth is fear-immune).
- **C · CC conventions** — **boss** = FEAR + STUN + execute-immune, SLOW-resist; **champion** = execute-immune + STUN-resist. Auto-applied to all 5 bosses + 5 champions.
- **D · FearlessAura emitters** (Banner-Sergeant, Royal Standard-Bearer) are themselves FEAR-immune while the aura is up.

**Next:** the qualitative band→% scale is folded into the implementation pass (kept out of these design docs by design, exactly as `TOWERS.md` keeps tower numbers out).
