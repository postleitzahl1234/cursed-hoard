package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayList;
import java.util.List;

/**
 * Rebuilt Hero entity for cursed_treasure_v2 (D-18 / IMPLEMENTATION.md §2).
 * Composes UnitBehavior list, delegates state updates, and resolves typed damage/status effects.
 */
public class Hero {

    public enum State { GOING_IN, AT_CAVE, GOING_OUT, ESCAPED, DEAD }

    public final HeroType type;
    public final Vector2 pos = new Vector2();
    public float hp;
    public float maxHp;
    public State state = State.GOING_IN;
    public Gem carrying = null;
    public float animTime = 0f;

    /**
     * Counts down while an ability animation should be playing.
     *
     * <p>Fixes W-4 of the review: the renderer only ever asked for {@code "walk"} or
     * {@code "fly"}, so the authored {@code ability}, {@code carry} and {@code death} clips
     * never appeared in-game — roughly 40% of every troop's animation was dead art, in breach
     * of the README's "every listed asset must be used". A {@link UnitBehavior} calls
     * {@link #triggerAbility()} when it actually fires, and the renderer reads
     * {@link #animState()}.
     */
    public float abilityAnim = 0f;
    /** Counts down after death so the death clip can play before the corpse is removed. */
    public float deathAnim = 0f;

    /**
     * Per-hero scratch state for {@link UnitBehavior}s.
     *
     * <p><b>Why this exists.</b> {@code HeroType} stores its behaviours as constants —
     * {@code new SupportAura(96f, 0.2f)} is evaluated once, and every Banner Sergeant ever
     * spawned shares that single instance. So a behaviour must be <b>stateless</b>: a cooldown
     * or an "already triggered" flag stored on the behaviour object would be shared by the whole
     * roster and fire once for everyone. (The original {@code ThresholdInvuln} stub had exactly
     * that bug latent in it — a {@code private boolean triggered} field.)
     *
     * <p>Behaviours therefore keep their state <em>here</em>, keyed by a name they choose.
     */
    public final java.util.Map<String, Float> behaviorState = new java.util.HashMap<>();

    /** Read a behaviour's stored value, or {@code def} if it has none yet. */
    public float bGet(String key, float def) {
        Float v = behaviorState.get(key);
        return v == null ? def : v;
    }

    public void bSet(String key, float value) {
        behaviorState.put(key, value);
    }

    /**
     * Ticks a behaviour's own cooldown and reports whether it just came due. Behaviours call
     * this instead of holding a timer field.
     */
    public boolean bCooldown(String key, float interval, float dt) {
        float t = bGet(key, interval) - dt;
        if (t <= 0f) { bSet(key, interval); return true; }
        bSet(key, t);
        return false;
    }

    /**
     * Multipliers rebuilt from scratch every frame by the aura behaviours, so a buff disappears
     * the instant its source dies instead of lingering as accumulated state.
     */
    public float speedMultiplier = 1f;
    public float damageTakenMultiplier = 1f;
    /** Set by Taunt; towers prefer these heroes when picking a target. */
    public boolean taunting = false;
    /**
     * Set by an ALLY's cover effect (Sandstorm Shaman). Reset every frame like the multipliers,
     * because the covered unit has no behaviour of its own to expire the flag — an earlier
     * version stored it as a timer on the target and it never decayed, leaving whole waves
     * permanently untargetable.
     */
    public boolean cloaked = false;
    /**
     * The world this hero belongs to — assigned by {@link World#spawnHero(HeroType)} before any
     * lifecycle hook is dispatched, so onDamaged/onDeath hooks are not handed null.
     */
    public World world;

    /** A behaviour calls this the moment its effect fires, so the art matches the mechanic. */
    public void triggerAbility() {
        abilityAnim = Math.max(abilityAnim, 0.55f);
    }

    /**
     * Which authored clip the renderer should ask for. Order matters: dying beats everything,
     * then a firing ability, then carrying a gem (D-09 — carriers land and walk out slowly),
     * then ordinary locomotion.
     */
    public String animState() {
        if (deathAnim > 0f) return "death";
        if (abilityAnim > 0f) return "ability";
        if (carrying != null) return "carry";
        return type.flying ? "fly" : "walk";
    }

    // Redesigned Combat & Behavior Components (D-11 / D-17)
    public final StatusController statusController = new StatusController();
    public final ResistanceProfile resistanceProfile;
    public final List<UnitBehavior> behaviors = new ArrayList<>();
    public MovementStrategy movementStrategy;

    public int tier = 1;
    public float invulnTimer = 0f;
    public int livesLeft = 0;
    public boolean rewarded = false;   // death bounty paid (kills can land outside hero.update)
    
    public final List<Vector2> waypoints;
    public int targetWaypoint = 1;
    public float caveTimer = 0f;

    public Hero(HeroType type, List<Vector2> waypoints) {
        this(type, waypoints, type.maxHp);
    }

    public Hero(HeroType type, List<Vector2> waypoints, int hpOverride) {
        this(type, waypoints, hpOverride, 1);
    }

    public Hero(HeroType type, List<Vector2> waypoints, int hpOverride, int tier) {
        this.type = type;
        this.waypoints = waypoints != null ? waypoints : new ArrayList<>();
        this.maxHp = hpOverride;
        this.hp = maxHp;
        this.tier = Math.max(1, Math.min(3, tier));
        this.livesLeft = type.extraLives;

        if (!this.waypoints.isEmpty()) {
            this.pos.set(this.waypoints.get(0));
        }

        // 1. Derive resistance profile (D-17)
        this.resistanceProfile = ResistanceProfileFactory.derive(type);

        // 2. Assign behaviors from HeroType (strategy pattern)
        initializeBehaviors();

        // 3. Assign movement strategy (D-15)
        initializeMovementStrategy();
    }

    private void initializeBehaviors() {
        // Instantiate behaviors assigned in HeroType.
        // During Phase 1/1', these are populated from the behaviors library.
        if (type.behaviors != null) {
            for (UnitBehavior behavior : type.behaviors) {
                this.behaviors.add(behavior);
            }
        }
    }

    private void initializeMovementStrategy() {
        // Default movement strategies. In runtime, a flyer will follow water air route.
        // We will assign custom implementations in Phase 1'.
        this.movementStrategy = new GroundFollower();
    }

    /**
     * Resolves typed damage and status effects according to D-11/D-17 specification.
     * @return true if the unit died from this packet.
     */
    public boolean damage(DamagePacket packet) {
        if (packet == null || state == State.DEAD) return false;
        if (invulnTimer > 0f) return false;

        // 1. Trigger onDamaged hooks (world is threaded through — these used to receive null,
        //    which meant any behaviour reacting to damage could not touch the world at all)
        for (UnitBehavior behavior : behaviors) {
            behavior.onDamaged(this, world, packet);
        }

        // 2. Base band mitigation (D-11 / D-17)
        float multiplier = 1.0f;
        if (packet.type == DamageType.PHYSICAL) {
            multiplier = ResistBand.bandToMultiplier(resistanceProfile.physBand);
            multiplier *= 1f + statusController.getStatusMagnitude(StatusType.CURSE);
        } else if (packet.type == DamageType.FROST || packet.type == DamageType.LIGHTNING || packet.type == DamageType.CURSE) {
            multiplier = ResistBand.bandToMultiplier(resistanceProfile.cryptBand);
        }

        // 3. Elemental overrides stack on the band
        ElementResponse response = resistanceProfile.overrides.get(packet.type);
        if (response != null) {
            switch (response) {
                case IMMUNE:
                    multiplier = 0.0f;
                    break;
                case RESIST:
                    multiplier *= 0.5f;
                    break;
                case VULN:
                    multiplier *= 1.5f;
                    break;
                case NORMAL:
                default:
                    break;
            }
        }

        // Shield modes and ally shields fold in here, after resistances (D-11 order).
        float finalDamage = packet.amount * multiplier * damageTakenMultiplier;
        hp -= finalDamage;
        lastDamageTaken = finalDamage;

        // 4. Check execute rules (Crypt execute proc)
        if (packet.execute && !resistanceProfile.executeImmune) {
            // Instantly execute/kill the target
            hp = 0f;
        }

        // 5. Handle death and MULTIPLE_LIVES revive (D-10)
        if (hp <= 0f) {
            if (livesLeft > 0) {
                livesLeft--;
                hp = maxHp * 0.5f;
                invulnTimer = 1.0f; // Brief invulnerability window
                return false;
            }
            state = State.DEAD;
            deathAnim = 0.5f;                 // let the authored death clip play out
            // Trigger death hooks
            for (UnitBehavior behavior : behaviors) {
                behavior.onDeath(this, world);
            }
            return true;
        }

        // 6. Apply status riders, filtered by immunities
        for (StatusApplication rider : packet.riders) {
            statusController.applyStatus(rider, this, resistanceProfile);
        }

        return false;
    }

    /** How much damage the last packet actually dealt — DamageToHeal and DeathLeech read it. */
    public float lastDamageTaken = 0f;

    /**
     * Clears values contributed by per-frame behaviours before any hero updates for the frame.
     * {@link World#update(float)} calls this for the whole roster as a separate first pass, so an
     * aura applied by one hero cannot be erased later by the recipient's update order.
     */
    public void beginFrame() {
        speedMultiplier = 1f;
        damageTakenMultiplier = 1f;
        taunting = false;
        cloaked = false;
    }

    /**
     * Advances this hero after {@link #beginFrame()} has run for every hero in the world. Aura
     * and other per-frame behaviours only accumulate values during this second pass.
     */
    public void update(float dt, World world) {
        this.world = world;
        // These two tick even while dead: the death clip has to finish, and a corpse that
        // vanishes on the frame it dies is exactly the "no death animation" bug W-4 describes.
        if (abilityAnim > 0f) abilityAnim = Math.max(0f, abilityAnim - dt);
        if (deathAnim > 0f) deathAnim = Math.max(0f, deathAnim - dt);
        if (!isAlive()) return;
        animTime += dt;

        // Ticking down invulnerability timer
        if (invulnTimer > 0f) {
            invulnTimer -= dt;
        }

        // Status update (ticks durations, processes burn DoT damage)
        statusController.update(this, world, dt);

        // Update behaviors
        for (UnitBehavior behavior : behaviors) {
            behavior.onUpdate(this, world, dt);
        }

        // Locomotion update
        if (statusController.isStunned()) {
            // Stun blocks movement
            return;
        }

        if (state == State.AT_CAVE) {
            caveTimer -= dt;
            if (caveTimer <= 0f) {
                Gem g = world.takeAvailableGem();
                if (g != null) {
                    carrying = g;
                    g.state = Gem.State.CARRIED;
                    g.carrier = this;
                    world.gemEverTouched = true;
                    // Trigger gem grab events
                    for (UnitBehavior behavior : behaviors) {
                        behavior.onGemGrab(this, world);
                    }
                }
                state = State.GOING_OUT;
                targetWaypoint = Math.max(0, waypoints.size() - 2);
            }
        } else {
            // Advance along route using the current movement strategy
            movementStrategy.advance(this, dt);
        }

        // Sync carrying gem position
        if (carrying != null) {
            carrying.pos.set(pos.x, pos.y + 14f);
        }
    }

    public boolean isAlive() {
        return state != State.DEAD && state != State.ESCAPED;
    }

    public boolean isTargetable() {
        if (cloaked) return false;
        for (UnitBehavior behavior : behaviors) {
            if (!behavior.isTargetable(this)) {
                return false;
            }
        }
        return isAlive();
    }

    public void applyStatus(StatusApplication application) {
        statusController.applyStatus(application, this, resistanceProfile);
    }

    public void snapToWaypoint(int wpIdx) {
        if (wpIdx < 0) wpIdx = 0;
        if (wpIdx >= waypoints.size()) wpIdx = waypoints.size() - 1;
        pos.set(waypoints.get(wpIdx));
        if (state == State.GOING_OUT) {
            targetWaypoint = Math.max(0, wpIdx - 1);
        } else {
            targetWaypoint = Math.min(waypoints.size() - 1, wpIdx + 1);
        }
    }

    public void walkAlongPath(float dt, int dir) {
        if (waypoints.isEmpty()) return;

        int wpIdx = targetWaypoint;
        if (statusController.getFearDuration() > 0f && state == State.GOING_IN) {
            // FEAR forces walking backward toward spawn
            wpIdx = Math.max(0, targetWaypoint - 1);
            dir = -1;
        }

        if (wpIdx < 0) wpIdx = 0;
        if (wpIdx >= waypoints.size()) wpIdx = waypoints.size() - 1;

        Vector2 target = waypoints.get(wpIdx);
        Vector2 toTarget = new Vector2(target).sub(pos);
        float dist = toTarget.len();

        // Speed calculation factoring slow/freeze multipliers
        float burnSlow = world != null && statusController.isStatusActive(StatusType.BURN)
                ? world.skills.burningSlow() : 0f;
        float currentSpeed = type.speed * statusController.getSlowMultiplier()
                * Math.max(0.35f, 1f - burnSlow) * speedMultiplier;
        float step = currentSpeed * dt;

        if (dist <= step) {
            pos.set(target);
            if (statusController.getFearDuration() > 0f && state == State.GOING_IN) {
                targetWaypoint = Math.max(0, targetWaypoint - 1);
            } else {
                targetWaypoint += dir;
                if (dir > 0 && targetWaypoint >= waypoints.size()) {
                    state = State.AT_CAVE;
                    caveTimer = 0.6f;
                    pos.set(waypoints.get(waypoints.size() - 1));
                } else if (dir < 0 && targetWaypoint < 0) {
                    state = State.ESCAPED;
                }
            }
        } else {
            pos.mulAdd(toTarget.scl(1f / dist), step);
        }
    }

    public void onKilled(World world) {
        if (carrying != null) {
            carrying.state = Gem.State.DROPPED;
            carrying.carrier = null;
            carrying.pos.set(pos);
            if (world != null) world.prepareGemReturn(carrying);
            carrying = null;
            for (UnitBehavior behavior : behaviors) {
                behavior.onGemDrop(this, world);
            }
        }

        // Gold reward drop
        if (world != null) {
            world.gold += type.goldReward + world.skills.killGoldBonus() + world.skills.scrapGoldBonus();
            // Gain mana on kill
            int manaGain = (type.boss ? 25 : (type.champion ? 8 : 2)) + world.skills.manaOnKillBonus();
            world.mana = Math.min(world.maxMana, world.mana + manaGain);
            if (statusController.isStatusActive(StatusType.BURN)
                    && world.skills.burnSpreadChance() > 0f) {
                int stride = Math.max(1, Math.round(1f / world.skills.burnSpreadChance()));
                for (Hero other : world.heroes) {
                    if (other != this && other.isAlive() && other.pos.dst2(pos) <= 72f * 72f
                            && Math.floorMod(other.type.ordinal() + type.ordinal(), stride) == 0) {
                        other.applyStatus(new StatusApplication(StatusType.BURN, 3f, 2f));
                    }
                }
            }
            if (type.boss) {
                world.bossDefeated = true;
            }
        }
    }
}
