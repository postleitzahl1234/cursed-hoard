package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;

public final class DroneActor {
    public enum State {
        LAUNCHING,
        ATTACKING,
        RETURNING,
        DONE
    }

    public final Tower source;
    public final Vector2 pos = new Vector2();
    public Hero target;
    public State state = State.LAUNCHING;
    public float attackTimer = 0.4f;

    // bomber run: glide along the heroes' track for a stretch, laying a visible carpet of bombs
    public final boolean bomber;
    public int bombsLeft;
    public int bombsDropped;            // observed by the render layer for falling-bomb FX
    private final Vector2 runDir = new Vector2();
    private boolean runStarted;
    private int strikesLeft;

    public DroneActor(Tower source, Hero target) {
        this.source = source;
        this.target = target;
        this.pos.set(source.pos);
        this.bomber = source.type.pattern == AttackPattern.BOMBER;
        this.bombsLeft = bomber ? (source.type.tier >= 6 ? 10 : 7) : 0;
        this.strikesLeft = bomber ? 0 : dronePayload(source.type);
    }

    public void update(World world, float dt) {
        if (state == State.DONE) {
            return;
        }
        if (target == null || !target.isAlive()) {
            target = world.findTarget(source);
            if (target == null && !(bomber && runStarted && bombsLeft > 0)) {
                state = State.RETURNING;
            }
        }
        if (state == State.RETURNING) {
            moveToward(source.pos, cruiseSpeed(world.skills) * 0.8f * dt);
            if (pos.dst2(source.pos) < 9f) {
                state = State.DONE;
            }
            return;
        }
        if (bomber) {
            updateBomber(world, dt);
            return;
        }
        if (target != null) {
            state = State.ATTACKING;
            moveToward(target.pos, cruiseSpeed(world.skills) * dt);
            attackTimer -= dt;
            if (attackTimer <= 0f && pos.dst2(target.pos) < 48f * 48f) {
                strike(world, target);
                strikesLeft--;
                attackTimer = attackInterval();
                if (strikesLeft <= 0) state = State.RETURNING;
            }
        }
    }

    /** Fly to the lane, then glide along the heroes' direction of travel dropping the payload. */
    private void updateBomber(World world, float dt) {
        state = State.ATTACKING;
        if (!runStarted) {
            if (target == null) { state = State.RETURNING; return; }
            moveToward(target.pos, cruiseSpeed(world.skills) * dt);
            if (pos.dst2(target.pos) < 40f * 40f) {
                runStarted = true;
                // glide onward along the target's current travel direction (down the track)
                int wp = Math.min(target.targetWaypoint, target.waypoints.size() - 1);
                Vector2 ahead = target.waypoints.isEmpty() ? pos : target.waypoints.get(wp);
                runDir.set(ahead).sub(pos);
                if (runDir.len2() < 1f) runDir.set(1f, 0f);
                runDir.nor();
            }
            return;
        }
        pos.mulAdd(runDir, cruiseSpeed(world.skills) * 0.68f * dt);
        attackTimer -= dt;
        if (attackTimer <= 0f && bombsLeft > 0) {
            bombsLeft--;
            bombsDropped++;
            attackTimer = attackInterval();
            float radius = strikeRadius() * world.skills.bombSplashMultiplier();
            float r2 = radius * radius;
            for (Hero hero : new java.util.ArrayList<>(world.heroes)) {
                if (hero.isAlive() && hero.pos.dst2(pos) <= r2) {
                    hero.damage(source.packetFor(world, hero, source.type == TowerType.CARPET_BOMBER ? 0.34f : 0.4f));
                }
            }
        }
        if (bombsLeft <= 0) {
            state = State.RETURNING;
        }
    }

    private void strike(World world, Hero primary) {
        primary.damage(source.packetFor(world, primary, strikeDamageScale()));
        int extra = strikeCount() - 1;
        if (extra <= 0) return;
        float radius2 = strikeRadius() * strikeRadius();
        world.heroes.stream()
                .filter(hero -> hero != primary && hero.isAlive() && hero.pos.dst2(primary.pos) <= radius2)
                .sorted(java.util.Comparator.comparingDouble(hero -> hero.pos.dst2(primary.pos)))
                .limit(extra)
                .forEach(hero -> hero.damage(source.packetFor(world, hero, strikeDamageScale())));
    }

    public float cruiseSpeed(SkillTreeBonus skills) {
        float base;
        switch (source.type) {
            case DRONE_SWARM: base = 235f; break;
            case DRONE_FOUNDRY: base = 260f; break;
            case SKY_CARRIER: base = 285f; break;
            case BOMBER_DRONE: base = 230f; break;
            case CARPET_BOMBER: base = 280f; break;
            default: base = 210f; break;
        }
        return base * skills.droneSpeedMultiplier();
    }

    public int strikeCount() {
        if (source.type == TowerType.DRONE_SWARM) return 2;
        if (source.type == TowerType.DRONE_FOUNDRY) return 3;
        if (source.type == TowerType.SKY_CARRIER) return 4;
        return 1;
    }

    public float strikeRadius() {
        if (source.type == TowerType.DRONE_FOUNDRY) return 42f;
        if (source.type == TowerType.SKY_CARRIER) return 76f;
        if (source.type == TowerType.DRONE_SWARM) return 58f;
        if (source.type == TowerType.BOMBER_DRONE) return 48f;
        if (source.type == TowerType.CARPET_BOMBER) return 66f;
        return 0f;
    }

    public float attackInterval() {
        switch (source.type) {
            case DRONE_SWARM: return 0.34f;
            case DRONE_FOUNDRY: return 0.38f;
            case SKY_CARRIER: return 0.26f;
            case BOMBER_DRONE: return 0.30f;
            case CARPET_BOMBER: return 0.20f;
            default: return 0.46f;
        }
    }

    private float strikeDamageScale() {
        switch (source.type) {
            case DRONE_SWARM: return 0.25f;
            case DRONE_FOUNDRY: return 0.1875f;
            case SKY_CARRIER: return 0.15f;
            default: return 0.375f;
        }
    }

    /** Finite sorties stop a long wave from accumulating an unbounded permanent drone army. */
    private static int dronePayload(TowerType type) {
        switch (type) {
            case DRONE_SWARM: return 3;
            case DRONE_FOUNDRY: return 4;
            case SKY_CARRIER: return 5;
            default: return 2;
        }
    }

    private void moveToward(Vector2 target, float amount) {
        Vector2 delta = target.cpy().sub(pos);
        float len = delta.len();
        if (len <= amount || len == 0f) {
            pos.set(target);
        } else {
            pos.mulAdd(delta.scl(1f / len), amount);
        }
    }
}
