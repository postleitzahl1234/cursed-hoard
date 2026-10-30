package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.badlogic.gdx.math.Vector2;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

class GemRoadReturnTest {
    private static final float EPSILON = 0.001f;

    private static List<Vector2> cornerRoad() {
        return Arrays.asList(
                new Vector2(0f, 0f),
                new Vector2(100f, 0f),
                new Vector2(100f, 100f));
    }

    @Test
    void droppedGemEntersNearestRoadSegmentBeforeFollowingIt() {
        Gem gem = new Gem(GemType.RUBY, 100f, 100f);
        gem.pos.set(60f, 30f);
        gem.state = Gem.State.DROPPED;

        gem.update(0.25f, cornerRoad());

        assertEquals(60f, gem.pos.x, EPSILON, "entry should use the nearest point on the segment");
        assertEquals(18f, gem.pos.y, EPSILON, "gem should head toward the road, not diagonally home");
    }

    @Test
    void returningGemStaysOnRoadAfterEntryAndTraversesEveryCorner() {
        Gem gem = new Gem(GemType.EMERALD, 100f, 100f);
        gem.pos.set(50f, 30f);
        gem.state = Gem.State.DROPPED;
        List<Vector2> road = cornerRoad();

        boolean reachedHorizontalRoad = false;
        boolean reachedVerticalRoad = false;
        for (int i = 0; i < 100 && gem.state != Gem.State.IN_CAVE; i++) {
            gem.update(0.1f, road);
            if (gem.pos.y <= EPSILON) reachedHorizontalRoad = true;
            if (Math.abs(gem.pos.x - 100f) <= EPSILON && gem.pos.y > EPSILON) {
                reachedVerticalRoad = true;
            }
            if (reachedHorizontalRoad && gem.state == Gem.State.DROPPED) {
                boolean onHorizontal = Math.abs(gem.pos.y) <= EPSILON;
                boolean onVertical = Math.abs(gem.pos.x - 100f) <= EPSILON;
                assertTrue(onHorizontal || onVertical, "gem cut across terrain at " + gem.pos);
            }
        }

        assertTrue(reachedHorizontalRoad, "gem never joined the road");
        assertTrue(reachedVerticalRoad, "gem skipped the road corner");
        assertEquals(Gem.State.IN_CAVE, gem.state);
        assertEquals(100f, gem.pos.x, EPSILON);
        assertEquals(100f, gem.pos.y, EPSILON);
    }

    @Test
    void largeFrameConsumesMultipleRoadLegsWithoutCuttingPastTheCave() {
        Gem gem = new Gem(GemType.SAPPHIRE, 100f, 100f);
        gem.pos.set(50f, 30f);
        gem.state = Gem.State.DROPPED;

        gem.update(10f, cornerRoad());

        assertEquals(Gem.State.IN_CAVE, gem.state);
        assertEquals(100f, gem.pos.x, EPSILON);
        assertEquals(100f, gem.pos.y, EPSILON);
        assertEquals(0f, gem.pickupBlockTimer, EPSILON);
    }

    @Test
    void returnPathIsDefensivelyCopied() {
        Gem gem = new Gem(GemType.AMETHYST, 100f, 100f);
        List<Vector2> road = cornerRoad();
        gem.setReturnPath(road);
        road.get(0).set(500f, 500f);
        gem.pos.set(60f, 30f);
        gem.state = Gem.State.DROPPED;

        gem.update(0.25f);

        assertEquals(60f, gem.pos.x, EPSILON);
        assertEquals(18f, gem.pos.y, EPSILON);
    }
}
