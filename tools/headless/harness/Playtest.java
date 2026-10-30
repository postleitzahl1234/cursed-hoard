package harness;

import com.badlogic.gdx.math.Vector2;
import io.github.some_example_name.game.*;
import java.util.*;

/** Headless playtest: build a real level, put towers on it, run waves, report what happened. */
public final class Playtest {

    static String run(int world, int level, boolean verbose) {
        StringBuilder log = new StringBuilder();
        try {
            MapBlueprint bp = LevelMaps.build(world, level);
            BlueprintLevel lvl = BlueprintLevel.fromBlueprint(bp);
            if (lvl == null) return "FAIL: BlueprintLevel.from returned null";
            GameMap map = lvl.map;
            World w = new World(map, AssetCatalog.createDefault());
            w.gold = 100000; w.maxMana = 100000; w.mana = 100000;

            // the gem cave + its hoard, the way CursedHoardGame does it
            w.buildings.add(new Building(BuildingType.GEM_CAVE, map.cavePosition.x, map.cavePosition.y));
            for (float[] b : lvl.buildings)
                w.buildings.add(new Building(BuildingType.values()[(int) b[0]], b[1], b[2]));

            int route = map.groundPath().size();
            if (route < 4) return "FAIL: route only " + route + " waypoints";

            // place towers along the lane, on buildable ground beside it
            int built = 0;
            for (int i = 3; i < route - 3 && built < 12; i += 4) {
                Vector2 p = map.groundPath().get(i);
                for (int[] off : new int[][]{{0,-64},{0,64},{-64,0},{64,0}}) {
                    float tx = p.x + off[0], ty = p.y + off[1];
                    int gx = (int)(tx / GameMap.TILE_SIZE), gy = (int)(ty / GameMap.TILE_SIZE);
                    MapTile t = map.tileAt(gx, gy);
                    if (t == null || t.role != TileRole.BASE) continue;
                    TowerType tt = new TowerType[]{TowerType.ORC_WATCHPOST, TowerType.CRYPT,
                            TowerType.IMP_BRAZIER, TowerType.GOBLIN_WORKSHOP}[built % 4];
                    if (w.buildTower(tt, tx, ty) != null) { built++; }
                    break;
                }
            }

            int gemsAtStart = w.gems.size();
            int spawned = 0, killed = 0, escaped = 0, arrived = 0, shots = 0;
            Set<String> seenBehaviours = new HashSet<>();
            float t = 0f; final float DT = 1f / 60f;
            int maxHeroesAtOnce = 0;
            int startGold = w.gold;

            // Drive wave sequencing the way CursedHoardGame.update does: start wave 1, and when
            // the spawner is done and the field is clear, send the next after an intermission.
            // The first version of this harness never called start() at all, and WaveSpawner
            // no-ops until it has a wave — so it reported "NO HEROES SPAWNED" on all 25 levels
            // and blamed the game. That was the harness. Recording it because it is the third
            // time in this project a verification tool has been the thing that was wrong.
            int totalWaves = WavePlan.waveCount(level);
            int waveNo = 0;
            float intermission = 0f;
            w.waveSpawner.start(WavePlan.wave(world, level, waveNo++));
            int totalSpawned = 0, totalKilled = 0, totalEscaped = 0;

            for (int step = 0; step < 60 * 240; step++) {          // four simulated minutes
                int before = w.heroes.size();
                w.update(DT); t += DT;
                if (w.heroes.size() > before) totalSpawned += w.heroes.size() - before;
                // retire finished heroes so the list does not grow without bound
                for (Iterator<Hero> it = w.heroes.iterator(); it.hasNext(); ) {
                    Hero h = it.next();
                    if (h.state == Hero.State.DEAD) { totalKilled++; it.remove(); }
                    else if (h.state == Hero.State.ESCAPED) { totalEscaped++; it.remove(); }
                }
                if (w.waveSpawner.isDone() && w.heroes.isEmpty() && waveNo < totalWaves) {
                    intermission -= DT;
                    if (intermission <= 0f) {
                        w.waveSpawner.start(WavePlan.wave(world, level, waveNo++));
                        intermission = 3f;
                    }
                }
                maxHeroesAtOnce = Math.max(maxHeroesAtOnce, w.heroes.size());
                for (Hero h : w.heroes) for (UnitBehavior b : h.behaviors) seenBehaviours.add(b.getClass().getSimpleName());
            }
            spawned = totalSpawned; killed = totalKilled; escaped = totalEscaped;
            for (Gem g : w.gems) if (g.state == Gem.State.LOST) arrived++;

            log.append(String.format("w%d_l%d  route %3d  towers %2d  heroes %3d (killed %3d, escaped %2d)"
                    + "  gems %d→lost %d  gold %+d  peak %2d  behav %2d  waves %d/%d",
                    world + 1, level + 1, route, built, spawned, killed, escaped,
                    gemsAtStart, arrived, w.gold - startGold, maxHeroesAtOnce, seenBehaviours.size(),
                    waveNo, totalWaves));
            if (built == 0) log.append("   ⚠ NO TOWER COULD BE PLACED");
            if (spawned == 0) log.append("   ⚠ NO HEROES SPAWNED");
            if (killed == 0 && spawned > 0) log.append("   ⚠ TOWERS KILLED NOTHING");
        } catch (Throwable e) {
            StringBuilder tr = new StringBuilder();
            tr.append("CRASH w").append(world + 1).append("_l").append(level + 1).append(": ")
              .append(e.getClass().getName()).append(": ").append(e.getMessage());
            StackTraceElement[] st = e.getStackTrace();
            for (int i = 0; i < Math.min(4, st.length); i++) tr.append("\n      at ").append(st[i]);
            return tr.toString();
        }
        return log.toString();
    }

    public static void main(String[] args) {
        System.out.println("=== HEADLESS PLAYTEST: 25 levels, 4 simulated minutes each ===");
        int ok = 0, crash = 0;
        for (int w = 0; w < 5; w++)
            for (int l = 0; l < 5; l++) {
                String r = run(w, l, false);
                System.out.println(r);
                if (r.startsWith("CRASH") || r.startsWith("FAIL")) crash++; else ok++;
            }
        System.out.println("=== " + ok + " levels ran, " + crash + " failed ===");
    }
}
