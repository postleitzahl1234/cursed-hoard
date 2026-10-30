# UnitBehavior — the 30 stubs are implemented

Closes the largest gap in the project. Before this, `Taunt` was a class declaration and a
comment, `ThresholdInvuln` stored three fields no code ever read, and `Hero.update` looped over
`behaviors` calling `onUpdate` on each — every call landing on the interface's empty default.
**Every troop ability in the game was inert.**

**31 of 31 behaviours now implemented**, plus a `SummonSupport` helper. Verified by script:
every symbol they reference exists, every constructor matches what `HeroType` passes.

---

## 1. Two structural traps, fixed before any behaviour was written

### Behaviours are shared singletons

`HeroType` evaluates `new SupportAura(96f, 0.2f)` **once**. Every Banner Sergeant ever spawned
gets that same object. So a behaviour holding a cooldown or an "already fired" flag would share
it across the entire roster — wound one Knight Lieutenant and you spend the invulnerability for
all of them.

The original `ThresholdInvuln` stub had exactly that bug waiting in a `private boolean
triggered` field. Behaviours are now **stateless**; per-unit state lives on the Hero:

```java
public final Map<String, Float> behaviorState;   // keyed by a name the behaviour chooses
public float  bGet(String key, float def);
public void   bSet(String key, float value);
public boolean bCooldown(String key, float interval, float dt);
```

### Damage hooks were handed a null world

`Hero.damage` called `behavior.onDamaged(this, null, packet)` and `onDeath(this, null)`. Any
behaviour reacting to damage could not touch the board at all — which is most of the interesting
ones. `Hero` now carries a `world` reference, set on spawn and refreshed each update.

---

## 2. How effects reach the simulation

Three new per-frame fields on `Hero`, **reset to neutral at the top of every update** and
re-applied by whichever behaviours are still alive:

| field | read by | used by |
|---|---|---|
| `speedMultiplier` | `walkAlongPath` | SupportAura, Frenzy, GroupCohesion, Mounted, MountState, GemCarrier, StationaryPerformer, DeathLeech, OverchargePulse, PropellerFlight, WaterborneFlight |
| `damageTakenMultiplier` | `damage()`, after resistances (D-11 order) | ShieldMode, AllyShield, SteamShield, Frenzy, MountState, DamageToHeal |
| `cloaked` | `isTargetable()` | SandstormCover |

Reset-then-reapply is the point: a buff disappears the instant its source dies, with no
bookkeeping to unwind. **This caught a real bug** — an earlier SandstormCover wrote a timer onto
the units it covered, and since those units have no behaviour of their own to expire it, whole
waves would have stayed permanently untargetable.

`Taunt` needed one more seam: `World.targetComparator` now sorts taunting heroes ahead of
everything else, whatever targeting policy the player set on the tower.

---

## 3. What each behaviour actually does

**Auras** (rebuilt from zero each frame) — SupportAura speed+rally · HealAura interval heal ·
CleanseAura strips SLOW/FREEZE/FEAR/STUN but deliberately **not** BURN or CURSE, so Demon and
Crypt damage still lands through a cleanser · FearlessAura.

**Shields** — ShieldMode (self, duty-cycled) · AllyShield (thrown onto others) · SteamShield
(vehicle + everything hiding behind it, and briefly jams towers) · ThresholdInvuln (once, at an
HP threshold) · SlowImmunity (clears SLOW **and** FREEZE — D-30(a) split them, so clearing only
SLOW would leave a Paladin freezable).

**Summoning (D-10)** — ContinuousSummon maintains a field cap · ThresholdSummon fires the
one-time burst that seeds it · MultiPhase reconfigures the Shadow King at 75/50/25% · Resurrect
revives at half HP against a personal cap, and revived units cannot be revived twice.

**Death** — DeathExplosion jams nearby towers (D-05a: disabled, never destroyed) · DeathLeech
consumes nearby corpses to heal and hasten.

**Control** — Taunt · Untargetable (phase cycle) · SandstormCover (cover for allies) · Frenzy
(stronger the more wounded) · StationaryPerformer (roots itself to buff the wave) ·
GroupCohesion (a caravan arrives together) · DamageToHeal (incoming damage *heals* the Glass
Sentinel for a window) · TowerSuppressionField · OverchargePulse · GoldSteal.

**Movement & carry (D-09/D-15)** — WaterborneFlight (air lane; **lands on gem grab**) ·
PropellerFlight (self-powered machine flight) · Mounted (stun/fear-proof, slower to accelerate)
· MountState (mounted until it grabs a gem, then dismounted and exposed) · GemCarrier
(specialists grab faster and run better) · BlinkToGem · PathProgressTransform (Monk → Templar,
a one-way swap that pays no bounty — it did not die, it became something else).

**Two economic guards worth naming:** summoned units are marked `rewarded` on arrival, so a
boss summon loop is not an infinite gold fountain; and the Monk's transform is likewise
bounty-free.

---

## 4. Why this matters for the art

The 28 authored ability clips were unreachable — nothing could trigger them. Behaviours now call
`h.triggerAbility()` at the moment their effect fires, `Hero.animState()` returns
death → ability → carry → locomotion, and the renderer asks for that clip.

The art and the mechanic are now the same event.

---

## 5. Tests

`core/src/test/.../UnitBehaviorTest.java` — 12 cases, aimed at the traps rather than at
restating each behaviour:

- shared-singleton isolation (wound one Lieutenant, its twin is unaffected)
- damage hooks receive a real world
- aura buffs expire with their source
- taunt outranks the targeting policy
- untargetable phases out **and back in**
- SlowImmunity covers FREEZE
- summon field caps hold; summons pay no bounty
- one of every archetype simulated for 600 ticks without throwing
- **at least one behaviour actually calls `triggerAbility()`** — the art/mechanic link

---

## 6. ⚠ Still not compiled

No JDK in this environment; `./gradlew test` has never run. I verified what I could statically:
brace/paren balance per file, every referenced symbol resolves against the real class APIs,
constructor arity matches every `HeroType` call site, and all enum references in the tests are
valid. That is not the same as compiling. **Please run `./gradlew test` before trusting this.**

Also unchanged from before: the 40×22 geometry (REVIEW.md §4) is still unapplied, so the map
still renders at 0.60× and undoes the pixel-exactness of the art.
