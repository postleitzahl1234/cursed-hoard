package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayList;
import java.util.List;

public final class Gem {
    public enum State {
        IN_CAVE,
        CARRIED,
        DROPPED,
        LOST
    }

    // D-09 (gem carry/dismount): a gem dropped by a dying/dismounted carrier is re-grabbable,
    // but if nobody re-steals it, it should slowly make its own way back to the hoard instead of
    // sitting in permanent limbo (which is what happened before this fix — see World.java's
    // update(): a DROPPED gem never transitioned back to IN_CAVE, so its only two possible fates
    // were "picked up again" or "carried off and LOST"; over a whole level's worth of waves that
    // meant every gem that ever got touched was eventually lost, no matter how many towers killed
    // its carrier in between).
    private static final float RETURN_SPEED = 48f;
    private static final float DROP_GRACE = 4f;          // s of pickup immunity right after a drop
    private static final float ARRIVE_EPSILON = 6f;      // px, snap-to-home tolerance

    public final GemType type;
    public final Vector2 pos = new Vector2();
    private final Vector2 homePos = new Vector2();
    public State state = State.IN_CAVE;
    public Hero carrier;
    public float pickupBlockTimer;
    private State prevState = State.IN_CAVE;
    private final List<Vector2> returnPath = new ArrayList<>();
    private final Vector2 roadEntry = new Vector2();
    private int returnWaypoint;
    private boolean routeInitialized;
    private boolean enteringRoad;
    private float returnSpeedMultiplier = 1f;

    public Gem(GemType type, float x, float y) {
        this.type = type;
        this.pos.set(x, y);
        this.homePos.set(x, y);
    }

    public boolean isAvailable() {
        return state == State.IN_CAVE || (state == State.DROPPED && pickupBlockTimer <= 0f);
    }

    public void setReturnSpeedMultiplier(float multiplier) {
        returnSpeedMultiplier = Math.max(0.1f, multiplier);
    }

    /**
     * Supplies the spawn-to-cave road used by dropped gems. Points are copied because authored maps
     * may replace their path between levels while a gem object is still alive.
     */
    public void setReturnPath(List<Vector2> roadPath) {
        if (samePath(roadPath)) return;
        returnPath.clear();
        if (roadPath != null) {
            for (Vector2 point : roadPath) {
                if (point != null) returnPath.add(new Vector2(point));
            }
        }
        routeInitialized = false;
    }

    /** Convenience overload for callers that own the current map path. */
    public void update(float dt, List<Vector2> roadPath) {
        setReturnPath(roadPath);
        update(dt);
    }

    public void update(float dt) {
        // Detect a fresh drop (death drop, Gem Ward snap-back, ...) — callers set `state`
        // directly rather than through a setter, so the transition is caught here.
        if (state == State.DROPPED && prevState != State.DROPPED) {
            if (pickupBlockTimer <= 0f) pickupBlockTimer = DROP_GRACE;
            routeInitialized = false;
        }
        prevState = state;

        if (pickupBlockTimer > 0f) {
            pickupBlockTimer -= dt;
        }

        if (state == State.DROPPED) returnHome(Math.max(0f, dt));
        else routeInitialized = false;
    }

    private void returnHome(float dt) {
        if (returnPath.isEmpty()) {
            moveDirectlyHome(dt);
            return;
        }
        if (!routeInitialized) initializeRoute();

        float remaining = RETURN_SPEED * returnSpeedMultiplier * dt;
        while (remaining > 0f && state == State.DROPPED) {
            Vector2 target;
            if (enteringRoad) {
                target = roadEntry;
            } else if (returnWaypoint < returnPath.size()) {
                target = returnPath.get(returnWaypoint);
            } else {
                arriveHome();
                return;
            }

            float dx = target.x - pos.x;
            float dy = target.y - pos.y;
            float distance = (float) Math.sqrt(dx * dx + dy * dy);
            if (distance <= remaining) {
                pos.set(target);
                remaining -= distance;
                if (enteringRoad) enteringRoad = false;
                else if (++returnWaypoint >= returnPath.size()) arriveHome();
            } else {
                pos.x += dx / distance * remaining;
                pos.y += dy / distance * remaining;
                remaining = 0f;
            }
        }
    }

    private void initializeRoute() {
        routeInitialized = true;
        int bestSegment = 0;
        float bestDistance2 = Float.MAX_VALUE;

        if (returnPath.size() == 1) {
            roadEntry.set(returnPath.get(0));
            returnWaypoint = 1;
        } else {
            for (int i = 0; i < returnPath.size() - 1; i++) {
                Vector2 a = returnPath.get(i);
                Vector2 b = returnPath.get(i + 1);
                float abX = b.x - a.x;
                float abY = b.y - a.y;
                float length2 = abX * abX + abY * abY;
                float t = length2 == 0f ? 0f
                        : ((pos.x - a.x) * abX + (pos.y - a.y) * abY) / length2;
                t = Math.max(0f, Math.min(1f, t));
                float x = a.x + abX * t;
                float y = a.y + abY * t;
                float dx = pos.x - x;
                float dy = pos.y - y;
                float distance2 = dx * dx + dy * dy;
                if (distance2 < bestDistance2) {
                    bestDistance2 = distance2;
                    bestSegment = i;
                    roadEntry.set(x, y);
                }
            }
            returnWaypoint = bestSegment + 1;
        }
        enteringRoad = !pos.epsilonEquals(roadEntry, 0.001f);
        if (!enteringRoad) pos.set(roadEntry);
    }

    private void moveDirectlyHome(float dt) {
        float dx = homePos.x - pos.x;
        float dy = homePos.y - pos.y;
        float dist2 = dx * dx + dy * dy;
        float step = RETURN_SPEED * returnSpeedMultiplier * dt;
        if (dist2 <= Math.max(ARRIVE_EPSILON * ARRIVE_EPSILON, step * step)) {
            arriveHome();
        } else if (step > 0f) {
            float dist = (float) Math.sqrt(dist2);
            pos.x += dx / dist * step;
            pos.y += dy / dist * step;
        }
    }

    private void arriveHome() {
        pos.set(homePos);
        state = State.IN_CAVE;
        prevState = State.IN_CAVE;
        pickupBlockTimer = 0f;
        routeInitialized = false;
    }

    private boolean samePath(List<Vector2> roadPath) {
        if (roadPath == null || roadPath.isEmpty()) return returnPath.isEmpty();
        int nonNullPoints = 0;
        for (Vector2 point : roadPath) if (point != null) nonNullPoints++;
        if (nonNullPoints != returnPath.size()) return false;
        int index = 0;
        for (Vector2 point : roadPath) {
            if (point != null && !returnPath.get(index++).equals(point)) return false;
        }
        return true;
    }
}
