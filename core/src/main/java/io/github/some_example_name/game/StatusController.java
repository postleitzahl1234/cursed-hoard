package io.github.some_example_name.game;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;

/**
 * Controller to manage active status effects on a Hero unit (D-17).
 * Replaces ad-hoc slow/fear timer fields on Hero with a robust, tickable state model.
 */
public final class StatusController {
    public static final class ActiveStatus {
        public float duration;
        public float magnitude;

        public ActiveStatus(float duration, float magnitude) {
            this.duration = duration;
            this.magnitude = magnitude;
        }
    }

    private final EnumMap<StatusType, ActiveStatus> activeStatuses = new EnumMap<>(StatusType.class);
    private float burnDamageAccumulator = 0f;

    public void applyStatus(StatusApplication app, Hero hero, ResistanceProfile profile) {
        if (app == null || app.duration <= 0f) return;

        // 1. Check immunities
        if (profile != null && profile.statusImmunities.contains(app.type)) {
            return;
        }

        float duration = app.duration;
        float magnitude = app.magnitude;

        // 2. Role-based status modifiers (D-17)
        if (hero.type.boss) {
            if (app.type == StatusType.SLOW || app.type == StatusType.FREEZE) {
                // Bosses get reduced slow effect and duration
                magnitude = magnitude * 0.4f;
                duration = duration * 0.5f;
            }
        } else if (hero.type.champion) {
            if (app.type == StatusType.STUN) {
                // Champions get stun resistance (reduced duration)
                duration = duration * 0.4f;
            }
        }

        // 3. Stacking rules
        ActiveStatus active = activeStatuses.get(app.type);
        if (active == null) {
            activeStatuses.put(app.type, new ActiveStatus(duration, magnitude));
        } else {
            // Keep the maximum magnitude, and refresh to max duration
            active.duration = Math.max(active.duration, duration);
            active.magnitude = Math.max(active.magnitude, magnitude);
        }
    }

    public void update(Hero hero, World world, float dt) {
        // Ticking down durations and processing effects
        EnumSet<StatusType> expired = EnumSet.noneOf(StatusType.class);

        for (Map.Entry<StatusType, ActiveStatus> entry : activeStatuses.entrySet()) {
            ActiveStatus status = entry.getValue();
            status.duration -= dt;
            if (status.duration <= 0f) {
                expired.add(entry.getKey());
                continue;
            }

            // DoT effect for BURN
            if (entry.getKey() == StatusType.BURN) {
                // magnitude represents BURN damage per second
                burnDamageAccumulator += status.magnitude * dt;
                if (burnDamageAccumulator >= 1f) {
                    int dmgInt = (int) burnDamageAccumulator;
                    burnDamageAccumulator -= dmgInt;
                    DamagePacket dot = new DamagePacket(dmgInt, DamageType.FIRE);
                    hero.damage(dot);
                }
            }
        }

        // Remove expired statuses
        for (StatusType type : expired) {
            activeStatuses.remove(type);
        }
    }

    public boolean isStatusActive(StatusType type) {
        return activeStatuses.containsKey(type);
    }

    public float getSlowMultiplier() {
        if (isStatusActive(StatusType.FREEZE)) {
            // FREEZE is a hard-slow stop (0.0f speed factor)
            return 0.0f;
        }
        ActiveStatus slow = activeStatuses.get(StatusType.SLOW);
        if (slow != null) {
            // Slow magnitude scales down speed. E.g. magnitude of 0.3 means 30% slower -> 0.7x speed
            return Math.max(0.0f, 1.0f - slow.magnitude);
        }
        return 1.0f;
    }

    public float getFearDuration() {
        ActiveStatus fear = activeStatuses.get(StatusType.FEAR);
        return fear != null ? fear.duration : 0f;
    }

    public boolean isStunned() {
        return isStatusActive(StatusType.STUN);
    }

    public void clearStatus(StatusType type) {
        activeStatuses.remove(type);
    }

    public void clearAllStatuses() {
        activeStatuses.clear();
        burnDamageAccumulator = 0f;
    }

    public float getStatusDuration(StatusType type) {
        ActiveStatus active = activeStatuses.get(type);
        return active != null ? active.duration : 0f;
    }

    public float getStatusMagnitude(StatusType type) {
        ActiveStatus active = activeStatuses.get(type);
        return active != null ? active.magnitude : 0f;
    }
}
