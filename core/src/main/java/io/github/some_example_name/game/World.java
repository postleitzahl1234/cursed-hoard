package io.github.some_example_name.game;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

public final class World {
    /** The locked campaign hoard size; gem art variants do not define the win condition. */
    public static final int GEM_COUNT = 5;

    public final GameMap map;
    public final AssetCatalog assetCatalog;
    public final List<Hero> heroes = new ArrayList<>();
    public final List<Tower> towers = new ArrayList<>();
    public final List<Gem> gems = new ArrayList<>();
    public final List<DroneActor> drones = new ArrayList<>();
    public final List<Building> buildings = new ArrayList<>();
    public final WaveSpawner waveSpawner = new WaveSpawner();
    public AirRouteProvider airRouteProvider = new WaterPathfinder();
    public int gold = 500;
    public int mana = 250;
    public int maxMana = 500;
    public boolean bossDefeated;
    /** Latches when any enemy picks up a gem; returning it later cannot restore a flawless clear. */
    public boolean gemEverTouched;
    public float tributeTimer;
    public SkillTreeBonus skills = SkillTreeBonus.empty();
    private float manaRegenCarry;

    /** D-31(d): flawless hoard = 3 stars; all five retained = 2; any retained = 1. */
    public int starRating() {
        long retained = gems.stream().filter(gem -> gem.state != Gem.State.LOST).count();
        if (retained == 0) return 0;
        if (!gemEverTouched) return 3;
        if (retained == gems.size()) return 2;
        return 1;
    }

    public World() {
        this(new GameMap(), AssetCatalog.createDefault());
    }

    public World(GameMap map, AssetCatalog assetCatalog) {
        this.map = map;
        this.assetCatalog = assetCatalog;
        GemType[] types = GemType.values();
        for (int i = 0; i < GEM_COUNT; i++) {
            gems.add(new Gem(types[i % types.length], map.cavePosition.x, map.cavePosition.y));
        }
    }

    private int spawnCounter;

    public Hero spawnHero(HeroType type) {
        // marching offset: heroes fan out across the 2-tile-wide lane instead of single-filing
        java.util.Random rng = new java.util.Random(spawnCounter++ * 7919L);
        float ox = rng.nextFloat() * 20f - 10f, oy = rng.nextFloat() * 20f - 10f;
        List<com.badlogic.gdx.math.Vector2> lane = new ArrayList<>();
        for (com.badlogic.gdx.math.Vector2 p : map.groundPath())
            lane.add(new com.badlogic.gdx.math.Vector2(p.x + ox, p.y + oy));
        Hero hero = new Hero(type, lane);
        // Attach before onSpawn (or any caller-triggered damage) can dispatch lifecycle hooks.
        hero.world = this;
        if (type.flying) {
            hero.movementStrategy = new AirFollower(airRouteProvider.route(map));
        }
        heroes.add(hero);
        for (UnitBehavior behavior : hero.behaviors) {
            behavior.onSpawn(hero, this);
        }
        return hero;
    }

    public Tower buildTower(TowerType type, float x, float y) {
        Tower tower = new Tower(type, x, y);
        towers.add(tower);
        return tower;
    }

    public Gem takeAvailableGem() {
        for (Gem gem : gems) {
            if (gem.isAvailable()) {
                return gem;
            }
        }
        return null;
    }

    public Hero findTarget(Tower tower) {
        return heroes.stream()
                .filter(hero -> hero.isAlive() && hero.isTargetable() && tower.isInRange(hero, skills))
                .min(targetComparator(tower))
                .orElse(null);
    }

    public void spawnDrone(Tower source, Hero target) {
        drones.add(new DroneActor(source, target));
    }

    public void update(float dt) {
        manaRegenCarry += skills.manaPerSecond() * dt;
        if (manaRegenCarry >= 1f) {
            int gain = (int) manaRegenCarry;
            manaRegenCarry -= gain;
            mana = Math.min(maxMana, mana + gain);
        }
        if (tributeTimer > 0f) {
            tributeTimer -= dt;
        }
        waveSpawner.update(this, dt);
        for (Building building : buildings) {
            building.update(this, dt);
        }
        for (Gem gem : gems) {
            gem.setReturnSpeedMultiplier(skills.gemReturnSpeedMultiplier());
            gem.update(dt, map.groundPath());
        }
        for (Tower tower : towers) {
            tower.update(this, dt);
        }
        // Reset the whole roster first. The update pass may then safely accumulate aura effects
        // on heroes regardless of whether the source appears before or after the recipient.
        for (Hero hero : new ArrayList<>(heroes)) {
            hero.beginFrame();
        }
        for (Hero hero : new ArrayList<>(heroes)) {
            hero.update(dt, this);
            // pay the bounty exactly once, no matter which phase landed the kill (tower fire
            // happens before this loop, so a before/after state check would miss those deaths)
            if (hero.state == Hero.State.DEAD && !hero.rewarded) {
                hero.rewarded = true;
                hero.onKilled(this);
                if (tributeTimer > 0f) {
                    gold += Math.max(5, hero.type.goldReward / 2);
                }
            }
            if (hero.state == Hero.State.ESCAPED && hero.carrying != null) {
                hero.carrying.state = Gem.State.LOST;
                hero.carrying.carrier = null;
                hero.carrying = null;
            }
        }
        Iterator<DroneActor> iterator = drones.iterator();
        while (iterator.hasNext()) {
            DroneActor drone = iterator.next();
            drone.update(this, dt);
            if (drone.state == DroneActor.State.DONE) {
                iterator.remove();
            }
        }
    }

    public void startTribute(float duration) {
        tributeTimer = Math.max(tributeTimer, duration);
    }

    public void prepareGemReturn(Gem gem) {
        int advance = skills.gemDropAdvance();
        java.util.List<com.badlogic.gdx.math.Vector2> path = map.groundPath();
        if (gem == null || advance <= 0 || path.isEmpty()) return;
        int nearest = 0;
        float best = Float.MAX_VALUE;
        for (int i = 0; i < path.size(); i++) {
            float distance = gem.pos.dst2(path.get(i));
            if (distance < best) { best = distance; nearest = i; }
        }
        gem.pos.set(path.get(Math.min(path.size() - 1, nearest + advance)));
    }

    private Comparator<Hero> targetComparator(Tower tower) {
        Comparator<Hero> policy;
        if (tower.targetingPolicy == TargetingPolicy.STRONGEST) {
            policy = Comparator.<Hero>comparingDouble(hero -> -hero.hp);
        } else if (tower.targetingPolicy == TargetingPolicy.NEAREST) {
            policy = Comparator.comparingDouble(hero -> tower.pos.dst2(hero.pos));
        } else {
            policy = Comparator.comparingInt(hero -> hero.targetWaypoint);
        }
        // Taunt (Pavise Guard) outranks the player's chosen policy — that is the whole point of
        // the unit: it pulls fire off the things behind it. Ties fall back to the policy.
        return Comparator.<Hero>comparingInt(hero -> hero.taunting ? 0 : 1).thenComparing(policy);
    }
}
