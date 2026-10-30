# Concept (design extract) — lore, worlds & enemy rosters

> **Design extract** of `../concept.md`, the design bible. Trimmed to the art-relevant
> content: the lore that sets tone, each world's **look** (biome / obstacle / path / tower
> flavour), and the **enemy rosters with their animation + ability-FX notes** — the direct
> sprite spec for every troop. Pure balance numbers (boss summon intervals / caps) are
> compressed to "what needs drawn"; full timings live in the root + `../SYSTEMS.md`. Root is the
> source of truth.

**How to read a roster line:** the **●**-dots are *relative scale cues* (●=low … ●●●●●=high) —
a `HP●●●●●` tank should read burlier/bigger than a `HP●` swarm unit. The **Trait** tells you
what the unit *is*; **Anim** lists the required animation states; **ability FX** (where noted)
is a bespoke sprite the behaviour needs (D-04d). Roles in *(italics)* — *(boss)*, *(champion)*,
*(flyer)*, *(carrier)* — drive art treatment; see `TROOPS.md` §1.

**Sub-style rule (D-12):** all troops within a world share one visual **language** (palette ramp +
detailing motifs, see `STYLEGUIDE.md` §4) — **not a shared body.** Cross-world returners keep their
own design but adopt the host world's accents (e.g. desert Outrider = camel-rider).

**⛔ No shared prototype (D-28):** every unit below is its **own creature** — distinct silhouette,
scale, species/anatomy, equipment + pose, driven by its **Trait** line. **Never reuse one humanoid
base recoloured across the roster.** Species match the world (humans → clergy → desert
raiders/camel → royal court/Falconer/Clockwork → demons/undead/shadow); mounts, machines, flyers,
behemoths and swarms are **not** humanoids. Two units that can share a wave must read apart as
**black shapes at 32 px**.

---

## Lore — The King and the Queen

- The **King** is married to the **Queen**.
- The Queen wants gems. The King is reluctant. The Queen pressures him.
- The King sends his **4 officials** — and finally himself — to fetch the gems.
- **Main characters / bosses:** The General · The High Priest · the King's Chief Rebel ·
  His Majesty the King · the **Demon Shadow King** (the King, corrupted — the final boss).

The player defends the cursed hoard; the Kingdom raids it across 5 worlds.

---

## W1 · Great Grasslands — The General's Host

### Look
- **Obstacle:** oak trees. **Path:** earthen. Bright moss-green biome (accent MS5).
- **Towers (signature):** **Orc** — bombs and bolts (high DPM or splash); PHYSICAL.

### Enemies
Roster ladder: fodder → line → tank → support → elite → boss.

| Unit | HP | Spd | Armor | Trait | Anim / FX |
|---|---|---|---|---|---|
| **Peasant** | ● | ●●● | – | Fragile fodder, comes in swarms. | walk |
| **Guard** | ●● | ●● | ● | Baseline line infantry. | walk |
| **Outrider** | ●●●● | ●●●●● | – | Mounted scout; big HP from the **horse**, no armor. | **ride** |
| **Knight** | ●●● | ●● | ●●●● | Heavy physical armor. | walk |
| **Paladin** | ●●●●● | ●● | ●●●● | Burlier than Knight; immune to all slow. | walk |
| **Banner-Sergeant** | ●●● | ●● | ● | Support **aura**: nearby allies gain speed + become fearless. | walk + **aura FX** (visible ring/banner pulse) |
| **Pavise Guard** | ●●● | ● | ●●●●● | Slow, very heavy armor. **Taunt** forces towers to target him first. | walk + **taunt pulse** |
| **Knight-Lieutenant** *(champion)* | ●●●● | ●●● | ●●● | 2s invuln the first time he drops below 50% HP. | walk + **invuln shimmer** |
| **Golden Prince** *(carrier)* | ●●●● | ●●●●● | ●●●●● | **Mounted**, fast + armored; on grabbing a gem **dismounts** → slow + loses armor. | **ride** + walk (carrying) |
| ★ **The General** *(boss)* | ●●●●● | ●● | ●●●● | **Phased summoner** — summons Knights, then bursts Knight-Lieutenants below 50%. | walk + **summon/cast** FX |

### Buildings
Village · Castle.

---

## W2 · Holy Mountains — The High Priest's Procession

### Look
- Cold, holy-stone peaks; snow + crag; **frozen river / glacial melt** is the Seraph's
  flight lane (D-15). Accent ice-blue (IC3).
- **Towers (signature):** **Crypt** — orbiting charges above the temple that strike down;
  **ice + fear**.

The roster is built to *attack that identity*: zealots ignore fear, clergy shrug off magic,
cleansers undo ice/curse.

**Returning from W1** (same designs, host accents): **Outrider** · **Paladin** ·
**Knight-Lieutenant** · **Pavise Guard**.

**World-2 troops**
- **Acolyte** `HP●● Spd●●` — temple rank-and-file, the world's baseline. *Anim:* walk.
- **Flagellant** `HP●● Spd●●●→●●●●●` — fear-immune zealot; **faster the lower its HP**
  (frenzy). *Anim:* walk (self-lashing). *FX:* blood-frenzy aura when low.
- **Bard** `HP●● Spd●●` — periodically **plants himself and sings** (buffs ally speed), then
  moves on; exposed mid-song. *Anim:* walk + **sing**. *FX:* musical-note buff ring.
- **Temple Guard** `HP●●●● Spd●` — the anti-Crypt wall: heavy armor + high magic-resist.
  *Anim:* walk (shielded).
- **War Cleric** `HP●●● Spd●●` — heal-over-time aura. *Anim:* walk. *FX:* holy heal-glow aura.
- **Inquisitor** `HP●●● Spd●●` — **cleanse aura** strips slow/freeze/curse off allies.
  *Anim:* walk. *FX:* purifying flash.
- **Monk** `HP●●● Spd●●` — modest, but if it reaches the **last 20% of the path it ascends
  into a Templar**. Top kill-priority. *Anim:* walk + **ascension/transformation** (godly
  light pillar).
- **Templar** *(champion; the Monk's ascended form)* `HP●●●● Spd●●` — brief invuln + reflects
  one hit. *Anim:* walk + **invuln shimmer**.
- **Seraph** *(flyer)* `HP●●● Spd●●●` — winged; **flies the waterway**, slipping past
  ground-locked towers. *Anim:* **fly** (wing flap).
- ★ **The High Priest** *(boss)* `HP●●●●● Spd●●` — phased summoner: maintains **Templars**,
  casts **"Sanctuary"** (cleanse + shield), invuln window at 50%. *Anim:* walk + **cast/summon** FX.

### Buildings
Tavern · Holy citadel.

---

## W3 · Sea of Sand — The Chief Rebel's Warband

### Look
- Scorching dunes; **every desert map is an oasis with waterways** (flight lanes, D-05d).
  Obstacle: cacti / palm clusters. Accent ember-orange (EM4).
- **Towers (signature):** **Demon** — hellish continuous burn (temple AoE **or** long beam);
  FIRE.

Roster attacks that identity: fire-immunity, untargetable dodging, sand that suppresses
towers. (Towers have **no HP** — "anti-tower" effects only stun/disable/debuff, D-05.)

- **Sand Raider** `HP● Spd●●●●` — fast swarm fodder. *Anim:* walk.
- **Dune Nomad** `HP●● Spd●●` — baseline desert line. *Anim:* walk.
- **Ash-Walker** `HP●●● Spd●●` — **immune to fire/burn**; forces non-fire damage.
  *Anim:* walk + **ember-immune shimmer**.
- **Mirage Dancer** `HP●● Spd●●●●●` — periodically turns **untargetable** (mirage blink).
  *Anim:* walk + **vanish** FX.
- **Sandstorm Shaman** `HP●●● Spd●●` — once each, conjures a sandstorm that **hides nearby
  troops 2s**. *Anim:* walk + **sandstorm** FX.
- **Dune Behemoth (+ rider)** `HP●●●●● Spd●` — huge slow tank with a **mounted rider**; soaks
  AoE. *Anim:* walk (lumber) + rider.
- **Rebel Sapper** `HP●● Spd●●●` — **on death explodes**, briefly **disabling** the nearest
  tower. *Anim:* walk + **blast** FX.
- **Glass Sentinel** `HP●●● Spd●●` — opens windows where **incoming damage heals it**
  (obsidian absorption). *Anim:* walk + **absorb-heal** glow.
- **Giant Vulture (+ rider)** *(flyer)* `HP●●● Spd●●●●` — winged + rider; flies the
  **waterway**. **Lands and walks while carrying a gem.** *Anim:* **fly** + walk (carrying) + rider.
- **Camel Caravan** *(group, 3–4 camels + riders)* `HP●●● each Spd●●` — members **heal each
  other**; weaker as members fall. *Anim:* walk + **mutual-heal** FX.
- **Renegade Knight** *(champion)* `HP●●●● Spd●●●` — **Shield Mode** blocks most damage
  briefly. *Anim:* walk + **shield** FX.
- ★ **The King's Chief Rebel** *(boss)* `HP●●●●● Spd●●●` — phased summoner: cloaked **Sand
  Raiders**, bursts **2× Dune Behemoth** below 50%; steals gold. *Anim:* walk + **sandstorm/
  summon** cast.

### Buildings
Palm spring · Desert stronghold.

---

## W4 · Royal Gardens — The King's Royal Guard

### Look
- Manicured royal gardens with ornamental **ponds/canals** (waterway lanes for the
  Falconer + Clockwork Sentinel). Obstacle: hedges / topiary. Accent gold (GD3).
- **Towers (signature):** **Goblin** engineering — drones & gadgets; PHYSICAL.

The King's home turf: elite guard + court engineers, buffed by his power stations. They
fight back with **tower-disablers and shielders** (disables are stun-only — D-05).

- **Household Guard** `HP●●● Spd●●` — elite baseline. *Anim:* walk.
- **Kingsguard** `HP●●●● Spd●●` — heavy royal armor; the wall. *Anim:* walk.
- **Royal Engineer** `HP●●● Spd●●` — vents **steam that briefly shields nearby allies**.
  *Anim:* walk + **steam-shield** FX.
- **Court Conjurer** `HP●●● Spd●●` — casts an **absorb-shield** on allies; high magic-resist.
  *Anim:* walk + **ally-shield** FX.
- **Clockwork Sentinel** *(flyer)* `HP●●●● Spd●` — the King's automaton: **fearless**, sturdy;
  engages **propeller mode to fly**. **Vulnerable to LIGHTNING** (mechanical). Lands on carry.
  *Anim:* walk (mechanical) + **propeller fly**.
- **Royal Standard-Bearer** `HP●●● Spd●●` — banner aura: allies **fearless + armor buff**.
  *Anim:* walk + **banner** FX.
- **Royal Falconer (+ hawk)** *(flyer)* `HP●●● Spd●●●●` — garden flyer over the ponds; lands
  on carry. *Anim:* **fly** + walk + rider.
- **Royal Prince (+ horse)** *(carrier)* `HP●●●● Spd●●●●● Arm●●●●` — like the Golden Prince;
  on grabbing a gem **dismounts** → slow + loses armor. *Anim:* **ride** + walk (carrying).
- **Siege Wagon (+ engineer crew)** `HP●●●●● Spd●` — massive slow tank crewed by **engineers**
  (pop steam-shields). *Anim:* walk (roll) + engineer crew.
- **Lord-Commander** *(champion)* `HP●●●● Spd●●●` — rally + brief shield mode. *Anim:* walk +
  **rally** FX.
- ★ **The King** *(boss, single life)* `HP●●●●● Spd●●` — phased summoner: maintains
  **Kingsguard**, casts **"Royal Decree"** (overcharges power stations → mass buff), shields
  at phase change. **No multiple lives.** *Anim:* walk + **decree/summon** cast + shield.

### Buildings
King's laboratory · **King's power stations** — buff enemy troops in radius; **capturable**
(the 5-stage capture flips the buff off / over to the player).

---

## W5 · Shadow Realm — The Shadow Legion

### Look
- Shadow rifts over a void; obstacle: corrupted hexwood / purple crystal. **Cursed Portals**
  appear mid-level. **Cursed waterway** (void-tainted, water-typed) is the Imp Swarm's flight
  lane (D-15a). Accent hex-purple (HX3).
- **Towers:** **full convergence** — all four families (Orc / Crypt / Demon / Goblin) buildable
  side-by-side, no signature restriction ("use everything you've mastered").

The finale: a stress-test of every mechanic from W1–4 plus shadow cruelty, with Cursed Portals
letting enemies flank.

- **Shadow Wraith** `HP●● Spd●●●●●` — fast fodder that **flickers untargetable**. *Anim:* walk
  + **phase** FX.
- **Cursed Soldier** `HP●●● Spd●●` — corrupted fallen guard; **fearless**. *Anim:* walk.
- **Imp Swarm** *(flyer)* `HP●● Spd●●●●` — demonic flyer pack over the rifts; walks on carry.
  *Anim:* **fly**.
- **Hellhound** `HP●● Spd●●●●●` — very fast, packs, **fire-immune**. *Anim:* walk (lope).
- **Void Priest** `HP●●● Spd●●` — **resurrects** the nearest eligible corpse (cap 2); excludes
  bosses/champions/heavies. *Anim:* walk + **resurrect** FX.
- **Abyssal Behemoth (+ rider)** `HP●●●●● Spd●` — fear-immune mega-tank. *Anim:* walk + rider.
- **Soul-Eater** `HP●●● Spd●●●` — **heals whenever a nearby ally dies**; grows as the wave
  thins. *Anim:* walk + **leech** FX.
- **Gem Shade** *(carrier)* `HP●●● Spd●●●●●` — **blinks toward the gems** once it grabs one.
  *Anim:* walk + **blink** FX.
- **Doom Knight** *(champion)* `HP●●●●● Spd●●●` — shield mode + reflect. *Anim:* walk + **shield** FX.
- ★ **The Demon Shadow King** *(final boss; a corrupted version of The King)* `HP●●●●●+ Spd●●` —
  **portal summoner**, multi-phase: each Cursed Portal is its own spawner + shortcut; casts
  **Darkness** (disables towers). Shares the King's silhouette, **corrupted**. *Anim:* walk +
  **portal / darkness / summon** casts.

### Buildings
Shadow pool · **Cursed portal** — appears mid-level; **spawns enemies** and gives a **shortcut**
(route into one portal, emerge from another), bypassing part of the kill-zone.
