# Troop Roles (design extract) — the art taxonomy of the 53

> **Design extract** of `../TROOPS.md`. The root binds all **53 archetypes** to the typed
> resistance + status-immunity system (D-11/D-17) — **pure combat maths that never changes a
> sprite**, so it is stripped here. What the *artist* needs from that doc is the **role
> taxonomy**: which units are bosses / champions / gem-carriers / flyers / aura-emitters, and
> what each role implies for the sprite + animation + FX list. Lore prose, stats and per-unit
> anim notes live in `concept.md`; this is the cross-cutting "how to treat each role" index.
> Root is the source of truth.

**Count:** 53 archetypes total. Some **recur across worlds** (same design, host-world accents
per D-12). The per-world rosters and their anim/FX notes are in `concept.md`; the tables below
index each unit's **role → art treatment** so you can plan variant work and shared overlays.

**⛔ No shared prototype (D-28):** each of the 53 is a **distinct creature** — its own silhouette,
scale, species/anatomy, equipment + pose (per its `concept.md` Trait), **never one humanoid base
recoloured.** The role table below sets *treatment*, not a shared body; "recur across worlds" means
the **same unit** reappears (not one body reused for different units). The **only** sanctioned reuse
is Shadow King = the King corrupted (D-10). Two wave-mates must read apart as black shapes at 32 px.

---

## 1. Role → art treatment (the cross-cutting rules)

Five roles drive sprite/animation/FX decisions beyond a plain walk-cycle troop:

| Role | What it means for the art |
|---|---|
| **Boss** ★ (1/world) | The world's set-piece. Needs a **cast/summon** animation on top of walk (it is a phased summoner — D-10). The W5 **Demon Shadow King shares The King's silhouette, corrupted** (recolour + corruption pass, not a new build). Reads bigger/heavier than its roster. *(Sprite-identity scope — full-unique vs scaled variant — is open art question Q-11.)* |
| **Champion** (1/world, elite) | Mid-set elite (Knight-Lieutenant, Templar, Renegade Knight, Lord-Commander, Doom Knight). Carries a **defensive-proc FX** — invuln shimmer / shield / reflect — over its walk. *(Variant-vs-unique identity is open Q-10.)* |
| **Gem-carrier** (D-09) | Two sets of locomotion: the **approach** (mounted `ride` for the Princes, fast walk/blink for Gem Shade) **and** a **carrying walk** (slowed). Mounted carriers **dismount on grab** → need the un-mounted body too. The **carried-gem overlay** (INVENTORY §8) composites onto the carrier — author the carry frames so a gem can ride on the anchor. |
| **Flyer** (D-15) | A **fly** anim (wing-flap / propeller) routing over water lanes, **plus** a ground **walk** for when it **lands to carry a gem** (D-05c). *(Whether flyers get a ground shadow is open Q-14.)* |
| **Aura-emitter** | Renders a **visible aura FX** (ring / banner pulse / song notes) — the buff must be readable on the field, not implicit. Self-immune to its own effect while active. |

Everything else is a standard troop: idle + locomotion + death (+ ability/cast where it has one); **no attack** (D-25; INVENTORY §3).

---

## 2. W1 · Great Grasslands — The General's Host

| Unit | Role | Art treatment beyond standard walk |
|---|---|---|
| Peasant · Guard · Knight | standard | walk only |
| Outrider | mounted | **ride** anim (HP is "in the horse") |
| Paladin | standard | walk (burly bruiser) |
| Banner-Sergeant | **aura-emitter** | walk + **aura FX** (speed + fearless ring) |
| Pavise Guard | standard | walk + **taunt pulse** |
| Knight-Lieutenant | **champion** | walk + **invuln shimmer** (2s at <50% HP) |
| Golden Prince | **carrier** (mounted) | **ride** + dismounted **carry walk** + gem overlay |
| ★ The General | **boss** | walk + **summon/cast** FX |

---

## 3. W2 · Holy Mountains — High Priest's Procession

*Returning from W1 (same design, ice accents): Outrider · Paladin · Knight-Lieutenant · Pavise Guard.*

| Unit | Role | Art treatment beyond standard walk |
|---|---|---|
| Acolyte · Temple Guard | standard | walk |
| Flagellant | standard | walk (self-lashing) + **blood-frenzy aura** when low |
| Bard | **aura-emitter** (stationary) | walk + **sing** (plant + perform) + note buff ring |
| War Cleric | **aura-emitter** | walk + **heal-glow aura** |
| Inquisitor | **aura-emitter** | walk + **purifying flash** (cleanse) |
| Monk | **transformer** | walk + **ascension** pillar → becomes the Templar sprite at 80% path |
| Templar | **champion** (Monk's ascended form) | walk + **invuln shimmer** (reuse for both) |
| Seraph | **flyer** | **fly** (wing flap) + ground walk on carry |
| ★ The High Priest | **boss** | walk + **cast/summon** FX (Sanctuary cleanse + shield) |

---

## 4. W3 · Sea of Sand — Chief Rebel's Warband

| Unit | Role | Art treatment beyond standard walk |
|---|---|---|
| Sand Raider · Dune Nomad | standard | walk |
| Ash-Walker | standard | walk + **ember-immune shimmer** |
| Mirage Dancer | standard | walk + **vanish** FX (untargetable blink) |
| Sandstorm Shaman | standard | walk + **sandstorm** FX (hides allies) |
| Dune Behemoth | mounted tank | walk (lumber) + rider |
| Rebel Sapper | standard | walk + **death blast** FX |
| Glass Sentinel | standard | walk + **absorb-heal** glow |
| Giant Vulture | **flyer** + rider | **fly** + ground walk on carry + rider |
| Camel Caravan (3–4) | group | walk + **mutual-heal** FX (weakens as members fall) |
| Renegade Knight | **champion** | walk + **shield** FX |
| ★ Chief Rebel | **boss** | walk + **sandstorm/summon** cast |

---

## 5. W4 · Royal Gardens — King's Royal Guard

| Unit | Role | Art treatment beyond standard walk |
|---|---|---|
| Household Guard · Kingsguard | standard | walk |
| Royal Engineer | standard | walk + **steam-shield** FX |
| Court Conjurer | standard | walk + **ally-shield** FX |
| Clockwork Sentinel | **flyer** (mechanical) | walk (mechanical) + **propeller fly** + ground walk on carry |
| Royal Standard-Bearer | **aura-emitter** | walk + **banner** FX (fearless + armor) |
| Royal Falconer | **flyer** + hawk | **fly** + ground walk on carry + rider |
| Royal Prince | **carrier** (mounted) | **ride** + dismounted **carry walk** + gem overlay |
| Siege Wagon | mega-tank + crew | walk (roll) + engineer crew |
| Lord-Commander | **champion** | walk + **rally** FX (rally + shield) |
| ★ The King | **boss** (single life) | walk + **decree/summon** cast + shield |

---

## 6. W5 · Shadow Realm — The Shadow Legion

| Unit | Role | Art treatment beyond standard walk |
|---|---|---|
| Shadow Wraith | standard | walk + **phase** FX (flicker untargetable) |
| Cursed Soldier | standard | walk (fearless) |
| Imp Swarm | **flyer** (pack) | **fly** + ground walk on carry |
| Hellhound | standard | walk (lope) |
| Void Priest | **summoner** | walk + **resurrect** FX |
| Abyssal Behemoth | mounted mega-tank | walk + rider |
| Soul-Eater | standard | walk + **leech** FX (heals on ally death) |
| Gem Shade | **carrier** (specialist) | walk + **blink** FX toward the gems + gem overlay |
| Doom Knight | **champion** | walk + **shield** FX + reflect |
| ★ Demon Shadow King | **final boss** | walk + **portal / darkness / summon** casts; corrupted **King** silhouette |

---

## 7. Notes for the artist

- **D-12 sub-style:** every world's troops share one silhouette language + palette ramp
  (`STYLEGUIDE.md` §4). Returners adopt host accents (desert Outrider = camel-rider, etc.).
- **Shared overlays save work:** the **carried-gem overlay** (one set, INVENTORY §8) rides any
  carrier; the **champion defensive-proc FX** family (shimmer/shield/reflect) recurs across all
  five champions; **aura rings** recur across the emitters. Author these as reusable layers.
- **Open art questions** (not yet locked — author conservatively, flag if blocked): champion
  identity (Q-10), boss identity/scale (Q-11), carrier carry-state rendering (Q-13), flyer
  ground shadow (Q-14). The role table above tells you the *animation/FX* each needs regardless
  of how those style questions resolve.
