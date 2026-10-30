# CURSED TREASURE 3

## Lore
-King is married to wife. 
-Queen wants gems. 
-King is reluctant. 
-Queen pressures King. 
-King sends his 4 officials and last himself to fetch the gems. 
-Main Characters: The General; The High Priest; Kings Chief Rebel; His Majesty himself; Demon Shadow King

## Great Grasslands
### Design
-Obstacle: oak trees
-earthen path
### Towers
-Orc based (bombs and bolts, either high dpm or splash)
### Enemies — The General's Host
Roster ladder fodder → line → tank → support → elite → boss. Stat columns are
relative design intent (●=low ●●●●●=high), not final numbers.

| Unit | HP | Spd | Armor | Trait | Anims |
|---|---|---|---|---|---|
| **Peasant** | ● | ●●● | – | Fragile fodder, comes in swarms. | walk |
| **Guard** | ●● | ●● | ● | Baseline line infantry (the "ruler" unit). | walk |
| **Outrider** | ●●●● | ●●●●● | – | Mounted scout: no armor, but big HP pool from the **horse**. | **ride** |
| **Knight** | ●●● | ●● | ●●●● | Heavy physical armor. | walk |
| **Paladin** | ●●●●● | ●● | ●●●● | Burlier than Knight; **immune to ALL slow effects**. | walk |
| **Banner-Sergeant** | ●●● | ●● | ● | Support **aura**: nearby allies gain +speed & become fearless. **Aura must be visibly rendered** (ring/banner pulse). | walk + aura FX |
| **Pavise Guard** | ●●● | ● | ●●●●● | Slow, very heavy armor. **Taunt**: forces every tower in a radius to target him — must be killed first. | walk + taunt pulse |
| **Knight-Lieutenant** *(champion)* | ●●●● | ●●● | ●●● | **2s invulnerability** the moment he first drops below 50% HP. | walk + invuln shimmer |
| **Golden Prince** *(gem-carrier)* | ●●●● | ●●●●● | ●●●●● | **Mounted**: fast + heavily armored. On grabbing a gem he **dismounts** → becomes **slow + loses armor** while carrying. | **ride** + walk |
| ★ **The General** *(boss)* | ●●●●● | ●● | ●●●● | **Phased summoner.** P1 (>50%): Knight every 6s, cap 4. P2 (≤50%): one-time burst **4× Knight-Lieutenant**, then maintains Lieutenants every 8s, cap 4 (burst seeds the new cap). | walk + summon/cast |

### Buildings
-Village
-Castle

## Holy Mountains
### Design

### Towers
-Crypt based (powerful orbiting charges above the tempel to strike down, ice and fear)
### Enemies — The High Priest's Procession
Towers here are Crypt (ice + fear). The roster is built to *attack that identity*:
zealots ignore fear, clergy shrug off magic, cleansers undo ice/curse. No enemy
has levels — each is one fixed, intricate design. Every listed ability ships its
own FX sprite.

**Returning from Great Grasslands** (same designs): **Outrider** · **Paladin** ·
**Knight-Lieutenant** · **Pavise Guard**.

**World 2 troops**
- **Acolyte** `HP●● Spd●● Arm– MR●●` — temple rank-and-file, the world's baseline. Faint magic-resist hints at the holy ward. *Anim:* walk.
- **Flagellant** `HP●● Spd●●●→●●●●● Arm– MR–` — fear-immune zealot; **the lower its HP, the faster it moves** (frenzy), so chip damage backfires — you want a clean burst kill. *Anim:* walk (self-lashing). *Ability FX:* blood-frenzy aura when low.
- **Bard** `HP●● Spd●● Arm– MR●` — periodically **plants himself and sings** (sing anim), buffing nearby allies' speed for a few seconds, then moves on; immobile and exposed mid-song. *Anim:* walk + **sing**. *Ability FX:* musical-note buff ring.
- **Temple Guard** `HP●●●● Spd● Arm●●● MR●●●●` — the anti-Crypt wall: heavy armor **and** high magic-resist; ice/curse barely dents it. *Anim:* walk (shielded).
- **War Cleric** `HP●●● Spd●● Arm– MR●●` — heal-over-time aura on nearby allies. *Anim:* walk. *Ability FX:* holy heal-glow aura.
- **Inquisitor** `HP●●● Spd●● Arm– MR●●●` — **cleanse aura**: strips slow/freeze/curse off nearby allies each tick; hard-counters the ice spec. *Anim:* walk. *Ability FX:* purifying flash.
- **Monk** `HP●●● Spd●● Arm● MR●●` — modest on its own, but if it survives into the **last 20% of the path it ascends into a full Templar**. Top kill-priority. *Anim:* walk + **ascension/transformation** sprite (godly light pillar).
- **Templar** *(champion; also the Monk's ascended form)* `HP●●●● Spd●● Arm●●● MR●●●` — brief invuln + reflects one hit. *Anim:* walk + invuln shimmer.
- **Seraph** *(flying)* `HP●●● Spd●●● Arm– MR●●●●` — winged; **flies along waterways** rather than the ground path, slipping past ground-locked towers (maps for this world author water lanes — detail later). *Anim:* **fly** (wing flap).
- ★ **The High Priest** *(boss)* `HP●●●●● Spd●● Arm●● MR●●●●●` — **Phased summoner.** P1 (>50%): Templar every 12s, cap 2; "Sanctuary" (cleanse fear/slow/curse + shield) every 8s. First time below 50%: 3s invuln window + burst **2× Templar**. P2 (≤50%): Templar every 9s, cap 3; Sanctuary every 6s. *Anim:* walk + **cast/summon** FX.
### Buildings
-Tavern
-Holy citadel

## Sea of Sand (more hot and scorching)
### Design
-Every desert map is an **oasis**: it has **waterways** so flying troops have lanes.
-Scorching dunes; obstacle: cacti / palm clusters.
### Towers
-Demon tower based (hellish flame continuously burns enemies, either area around temple or as beam from far aways)
### Enemies — The Chief Rebel's Warband
Towers here are Demon (continuous burn — temple AoE or long beam). The roster
attacks that identity: fire-immunity, untargetable dodging, and sand that suppresses
towers. Reminder: **towers have no HP** — enemy "anti-tower" effects can only
**stun/disable/debuff**, never damage.

- **Sand Raider** `HP● Spd●●●● Arm–` — fast swarm fodder. *Anim:* walk.
- **Dune Nomad** `HP●● Spd●● Arm●` — baseline desert line. *Anim:* walk.
- **Ash-Walker** `HP●●● Spd●● MR●●` — **immune to fire/burn DoT**; forces non-fire damage. *Anim:* walk + ember-immune shimmer.
- **Mirage Dancer** `HP●● Spd●●●●● Arm–` — periodically turns **untargetable** (mirage blink); the beam wastes its channel. *Anim:* walk + **vanish** FX.
- **Sandstorm Shaman** `HP●●● Spd●● MR●●●` — **once per shaman**, conjures a sandstorm that **hides some nearby troops for 2 s** (untargetable). *Anim:* walk + **sandstorm** FX.
- **Dune Behemoth (+ rider)** `HP●●●●● Spd● Arm●●●● MR●●` — huge slow tank with a **mounted rider**; soaks temple AoE while others slip past. *Anim:* walk (lumber) + rider.
- **Rebel Sapper** `HP●● Spd●●● Arm–` — **on death explodes**, briefly **disabling** the nearest tower. *Anim:* walk + **blast** FX.
- **Glass Sentinel** `HP●●● Spd●● MR●●●●` — every few seconds opens a short window where **incoming damage heals it instead** (obsidian absorption). *Anim:* walk + **absorb-heal** glow.
- **Giant Vulture (+ rider)** *(flying)* `HP●●● Spd●●●● Arm–` — winged with a rider; flies the **waterway** lanes. **Lands and walks while carrying a gem** (flyer-carry rule). *Anim:* **fly** + walk (carrying) + rider.
- **Camel Caravan** *(group, 3–4 camels + riders)* `HP●●● each Spd●● Arm●` — members **heal each other**; the caravan's healing **weakens as members are destroyed**. *Anim:* walk + **mutual-heal** FX.
- **Renegade Knight** *(champion)* `HP●●●● Spd●●● Arm●●●` — **Shield Mode**: blocks most damage for a short time. *Anim:* walk + **shield** FX.
- ★ **The King's Chief Rebel** *(boss)* `HP●●●●● Spd●●● Arm●●●` — **Phased summoner.** P1 (>50%): Sand Raider every 4s, cap 6, each cloaked 2s by sandstorm (`SandstormCover`); steals gold every 10s. P2 (≤50%): one-time burst **2× Dune Behemoth** (seeds 2 of the cap), Raiders backfill every 5s; steals gold every 8s. *Anim:* walk + **sandstorm/summon** cast.
### Buildings
-Palm spring
-Dessert Stronghold

## Royal Gardens
### Design
-Manicured royal gardens with ornamental **ponds/canals** (waterway lanes for the Falconer).
-Obstacle: hedges / topiary.
### Towers
-Goblin engineering based (multiple engineering feats like drones)
### Enemies — The King's Royal Guard
The King's home turf: elite guard + court engineers, pumped up by his power
stations. Player towers are Goblin engineering (drones/gadgets), so the King's
side fights back with **tower-disablers and shielders** while the stations buff
everything. (Towers have no HP — disables are stun-only.)

- **Household Guard** `HP●●● Spd●● Arm●●` — elite baseline, a cut above Grasslands' Guard. *Anim:* walk.
- **Kingsguard** `HP●●●● Spd●● Arm●●●●` — heavy royal armor; the wall. *Anim:* walk.
- **Royal Engineer** `HP●●● Spd●● Arm●` — vents **clouds of steam that briefly shield nearby allies** (area damage-reduction). *Anim:* walk + **steam-shield** FX.
- **Court Conjurer** `HP●●● Spd●● MR●●●●` — casts an **absorb-shield on nearby allies**; high magic-resist. *Anim:* walk + **ally-shield** FX.
- **Clockwork Sentinel** *(can fly)* `HP●●●● Spd● Arm●●● MR●●` — the King's automaton: **fearless**, sturdy; engages **propeller mode to fly** (bypasses ground hazards). **Vulnerable to LIGHTNING** (mechanical). Lands while carrying a gem. *Anim:* walk (mechanical) + **propeller fly**.
- **Royal Standard-Bearer** `HP●●● Spd●● Arm●●` — banner aura: nearby allies become **fearless + small armor buff**. *Anim:* walk + **banner** FX.
- **Royal Falconer (+ hawk)** *(flying)* `HP●●● Spd●●●● MR●` — garden flyer over the ponds; lands and walks while carrying a gem. *Anim:* **fly** + walk + rider.
- **Royal Prince (+ horse)** *(gem-carry specialist)* `HP●●●● Spd●●●●● Arm●●●●` — like the Golden Prince: mounted, fast and armored; on grabbing a gem he **dismounts → slow + loses armor**. *Anim:* **ride** + walk (carrying).
- **Siege Wagon (+ engineer crew)** `HP●●●●● Spd● Arm●●●●` — massive slow tank crewed by **engineers** (who can pop steam-shields); soaks drone fire while the column advances. *Anim:* walk (roll) + engineer crew.
- **Lord-Commander** *(champion)* `HP●●●● Spd●●● Arm●●●` — rally + brief shield mode. *Anim:* walk + **rally** FX.
- ★ **The King** *(boss, single life)* `HP●●●●● Spd●● Arm●●●●` — **Phased summoner, single life.** P1 (>40%): Kingsguard every 8s, cap 3; **"Royal Decree"** (overcharges nearby power stations → mass troop buff) every 15s. P2 (≤40%): on-enter 4s shield + burst **2× Kingsguard**, then Kingsguard every 6s, cap 4; Decree every 12s. **No multiple lives.** *Anim:* walk + **decree/summon** cast + shield.
### Buildings
-Kings laboratory
-Kings power stations — **buff enemy troops in radius; capturable** (the 5-stage capture flips the buff off / over to the player).

## Shadow Realm
### Design
-Shadow rifts over a void; obstacle: corrupted hexwood / purple crystal.
-Cursed Portals appear mid-level (see Buildings).
### Towers
-**Full convergence**: all four families (Orc / Crypt / Demon / Goblin) buildable
 side-by-side, no signature restriction. The hook is "use everything you've mastered."
 (Reinterpreted from "Combined T5s"; no fusion, no new art.)
### Enemies — The Shadow Legion
The finale: a stress-test of every mechanic from Worlds 1–4 plus shadow cruelty,
with Cursed Portals letting enemies flank.

- **Shadow Wraith** `HP●● Spd●●●●● Arm–` — fast fodder that **flickers untargetable**. *Anim:* walk + phase FX.
- **Cursed Soldier** `HP●●● Spd●● Arm●● MR●` — corrupted fallen guard; **fearless**. *Anim:* walk.
- **Imp Swarm** *(flying)* `HP●● Spd●●●● Arm–` — demonic flyer pack over the rifts; walks when carrying a gem. *Anim:* **fly**.
- **Hellhound** `HP●● Spd●●●●● Arm–` — very fast, packs, **fire-immune**. *Anim:* walk (lope).
- **Void Priest** `HP●●● Spd●● MR●●●●` — **resurrects** nearest eligible corpse → 50% HP every 6s, cap 2 active revives (backfills as revived re-die); excludes bosses/champions/heavies, one revive per corpse. Punishes slow clears. *Anim:* walk + **resurrect** FX.
- **Abyssal Behemoth (+ rider)** `HP●●●●● Spd● Arm●●●● MR●●●` — fear-immune mega-tank. *Anim:* walk + rider.
- **Soul-Eater** `HP●●● Spd●●● MR●●` — **heals whenever a nearby ally dies**; grows as the wave thins. *Anim:* walk + **leech** FX.
- **Gem Shade** *(carrier specialist)* `HP●●● Spd●●●●● Arm–` — **blinks toward the gems** once it grabs one. *Anim:* walk + **blink** FX.
- **Doom Knight** *(champion)* `HP●●●●● Spd●●● Arm●●●● MR●●●` — shield mode + reflect. *Anim:* walk + shield FX.
- ★ **The Demon Shadow King** *(final boss, multi-phase; a **corrupted version of The King**)* `HP●●●●●+ Spd●● Arm●●●● MR●●●●` — **Portal summoner, multi-phase** — each portal is its own summoner (per-portal cap, not the boss cap). P1 (>66%): 1 portal — Cursed Soldier every 7s, cap 3; **Darkness** disables towers every 14s. P2 (66–33%): 2nd portal opens (portals also act as **shortcuts**) — Hellhound every 6s cap 3 + Imp Swarm every 8s cap 2; Darkness every 11s. P3 (≤33%): 3rd portal + one-time burst **1 Void Priest + 2 Doom Knight**; Darkness every 8s, wider. Shares The King's silhouette, corrupted. *Anim:* walk + **portal / darkness / summon** casts.
### Buildings
-Shadow pool
-Cursed portal — appears mid-level; both **spawns enemies** and gives a **shortcut**
 (route into one portal, emerge from another further down the track), bypassing part of the kill-zone.