package io.github.some_example_name;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.Preferences;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.OrthographicCamera;
import io.github.some_example_name.assets.PixelFont;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.Pixmap;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.utils.ScreenUtils;
import com.badlogic.gdx.utils.viewport.FitViewport;
import io.github.some_example_name.assets.GameFx;
import io.github.some_example_name.assets.AudioManager;
import io.github.some_example_name.assets.AudioManager.Sfx;
import io.github.some_example_name.assets.PixelArtAtlas;
import io.github.some_example_name.assets.SpriteKeys;
import io.github.some_example_name.assets.UiChrome;
import io.github.some_example_name.assets.UiTheme;
import io.github.some_example_name.assets.WorldMap;
import io.github.some_example_name.game.AttackPattern;
import io.github.some_example_name.game.AlmanacDescriptions;
import io.github.some_example_name.game.Building;
import io.github.some_example_name.game.BuildingType;
import io.github.some_example_name.game.DroneActor;
import io.github.some_example_name.game.EnchantSystem;
import io.github.some_example_name.game.EnchantLoadout;
import io.github.some_example_name.game.EnchantType;
import io.github.some_example_name.game.EconomyBuilding;
import io.github.some_example_name.game.Faction;
import io.github.some_example_name.game.GameMap;
import io.github.some_example_name.game.Gem;
import io.github.some_example_name.game.Hero;
import io.github.some_example_name.game.HeroType;
import io.github.some_example_name.game.MapTile;
import io.github.some_example_name.game.StatusType;
import io.github.some_example_name.game.SkillTreeBonus;
import io.github.some_example_name.game.TerrainType;
import io.github.some_example_name.game.TileResolver;
import io.github.some_example_name.game.TileRole;
import io.github.some_example_name.game.Tower;
import io.github.some_example_name.game.TowerType;
import io.github.some_example_name.game.Wave;
import io.github.some_example_name.game.World;
import io.github.some_example_name.game.GameStrings;
import static io.github.some_example_name.game.GameStrings.get;

import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Single-application TD front end. Renders the entire campaign flow (STRUCTURE.md §1) on the
 * authored sprite atlas through {@link UiChrome} (ink-wash chrome) and {@link SpriteKeys}
 * (enum→atlas bridge), with a cosmetic {@link GameFx} layer for projectiles/impacts/status FX.
 * Logical space is a fixed 1280×720 {@link FitViewport} (README non-negotiable); all input is
 * unprojected into that space so layout is resolution-independent.
 */
public final class CursedHoardGame extends ApplicationAdapter {
    public enum ScreenState {
        SPLASH, MAIN_MENU, WORLD_SELECT, LEVEL_SELECT, GAME, ALMANAC, SKILL_TREE, SETTINGS, MAP_BUILDER
    }

    static final float W = 1280f, H = 720f;
    // Playfield geometry (REVIEW.md §4, D-07). The field is 40×22 cells of 32 px = 1280×704,
    // which is the 1280×720 window minus an 8 px letterbox. SCALE is therefore exactly 1: one
    // authored sprite pixel is one screen pixel, everywhere, with no resampling. That is the
    // whole point — every asset in this project is drawn on a 32-px grid, and the old 0.60×
    // playfield threw 40% of that away to gaussian mush.
    static final float WORLD_W = GameMap.WIDTH * GameMap.TILE_SIZE;    // 1280
    static final float WORLD_H = GameMap.HEIGHT * GameMap.TILE_SIZE;   // 704
    private static final float SCALE = 1.0f;
    private static final float MAP_X = 0f;
    private static final float MAP_Y = (H - WORLD_H) / 2f;             // 8

    // The HUD no longer flanks the field, it floats on top of it (D-07), so the outermost cell
    // rows sit behind the resource strip and the build tray. Those rows stay *decorative*: the
    // authoring contract is that path, buildings and buildable ground live in the safe rect.
    // Levels are validated against this in {@link #assertSafeRect}.
    public static final int SAFE_ROW_LO = 3, SAFE_ROW_HI = 19;         // 17 playable rows
    private static final float HUD_TOP_H = 64f, HUD_BOT_H = 96f;

    private Texture white;            // 1×1 fill for in-batch bars (no ShapeRenderer state churn)
    private Texture menuReliquary;     // generated shanshuihua hero art; optional fallback keeps builds robust
    private com.badlogic.gdx.graphics.g2d.TextureRegion whiteRegion;   // rotatable line (beams)
    private SpriteBatch batch;
    private PixelFont font;
    private FitViewport viewport;
    private OrthographicCamera camera;
    private PixelArtAtlas atlas;
    private SpriteKeys keys;
    private UiChrome ui;
    private GameFx fx;
    private AudioManager audio;
    private WorldMap worldMap;
    private MapBuilderScreen mapBuilder;
    private int activeMap;              // 0 = map1, 1 = map2 (Settings toggle, D-? persisted)
    private boolean devMode;            // Settings: all maps and infinite resources
    private boolean mapsOnlyMode;       // Settings: temporarily render only maps/obstacles/buildings
    private World world;
    private EnchantSystem enchants;
    private final EnchantLoadout enchantLoadout = new EnchantLoadout();

    // overworld map display rect (logical, y-up); shrunk clear of the back button + banner
    private static final float OVR_X = 220f, OVR_Y = 50f, OVR_W = 840f, OVR_H = 560f;

    private ScreenState state = ScreenState.SPLASH;
    private float stateTime = 0f;
    private float splashTimer = 2.4f;

    private int selectedWorldIndex = 0;
    private int selectedLevelIndex = 0;
    private int selectedFamily = 0;     // 0 Orc - 1 Crypt - 2 Demon - 3 Goblin
    private int selectedTier = 0;       // build-palette tier offset within faction

    private int skillPoints = 15;
    private int[] spentSkills = new int[40];

    private int almanacTab = 0;         // 0 Troops - 1 Towers - 2 Effects
    private int almanacSub = 0;         // faction (towers) / world (troops) sub-tab
    private int almanacIndex = 0;       // selected enum/effect index for the active tab
    private float almanacScrollY = 0f;
    private float scrollAccum = 0f;     // mouse-wheel delta captured by the input processor
    private final List<float[]> almCells = new ArrayList<>();  // {payload, cx, cy}
    private float almContentH = 0f;

    // Almanac grid + detail panel rects (logical)
    private static final float GRID_X = 40, GRID_Y = 100, GRID_W = 840, GRID_H = 480;
    private static final float DET_X = 900, DET_Y = 100, DET_W = 340, DET_H = 480;
    // HeroType ordinal ranges per world (W1..W5)
    private static final int[] WORLD_TROOP_START = {0, 10, 20, 32, 43, 53};

    private int maxLevelReached = 1;
    private Preferences prefs;

    // cosmetic-FX observer state
    private final Map<Tower, Float> prevCooldown = new IdentityHashMap<>();
    private final Set<Hero> bursted = java.util.Collections.newSetFromMap(new IdentityHashMap<>());
    private final Set<Gem> pickedUp = java.util.Collections.newSetFromMap(new IdentityHashMap<>());
    private final Map<Gem, Gem.State> previousGemStates = new IdentityHashMap<>();
    // build interaction state (cells encoded gx*100+gy)
    private final Set<Integer> clearedCells = new java.util.HashSet<>();   // cut trees → buildable + masked
    private final Set<Integer> occupiedCells = new java.util.HashSet<>();  // towers + buildings + cave
    private final Map<Integer, Tower> towerAt = new java.util.HashMap<>(); // footprint cell → tower
    private final Map<Integer, Float> regrowthTimers = new java.util.HashMap<>();
    private Tower selectedTowerRef;                                        // clicked tower (upgrade/sell panel)
    private io.github.some_example_name.game.BlueprintLevel blueprintLevel; // authored .map level, null = fallback
    private int wavesTotal;                // waves in the running level (WavePlan)
    private float intermission;            // countdown to next wave; 0 while a wave is live
    private int levelResult;               // 0 running - 1 victory - 2 defeat
    private int lastSkillPointAward;        // exact first-clear reward shown on the result overlay
    private int tutorialStage = 5;           // 0..4 prompts, 5 completed/disabled
    private boolean tutorialPromptActive;
    private boolean paused;                // transport: freeze the simulation
    private boolean speed2x;               // transport: double-speed (tap-toggle or hold)
    private boolean speed2xTapMode;        // Settings: 2× button is tap-toggle (else hold)
    private int armedEnchant = -1;         // enchant slot armed for the next playfield click
    private float garrisonTimer;           // hostile buildings periodically send troops
    private int skillTooltipIdx = -1;      // skill tree: which skill's info box is open
    private int selectedSkillFaction;      // skill tree: one faction page at a time
    private final List<EconomyBuilding> economyBuildings = new ArrayList<>();
    private int garrisonSpawnCount;
    private int rewardedWaveIndex;
    private float invalidFlash;            // brief red feedback timer
    private Vector2 invalidPos = new Vector2();
    private boolean smoke;
    private float smokeTimer;
    private String shotState;     // -Dch.shot=<STATE>: render one screen, save a PNG, exit
    private int shotFrame;

    @Override
    public void create() {
        batch = new SpriteBatch();
        Pixmap wp = new Pixmap(1, 1, Pixmap.Format.RGBA8888);
        wp.setColor(Color.WHITE);
        wp.fill();
        white = new Texture(wp);
        whiteRegion = new com.badlogic.gdx.graphics.g2d.TextureRegion(white);
        wp.dispose();
        font = new PixelFont();
        camera = new OrthographicCamera();
        viewport = new FitViewport(W, H, camera);
        atlas = new PixelArtAtlas("generated/sprites.json");
        keys = new SpriteKeys(atlas);
        ui = new UiChrome(atlas, batch, font);
        com.badlogic.gdx.files.FileHandle menuArt = Gdx.files.internal("generated/bg_menu_reliquary_v3.png");
        if (menuArt.exists()) {
            menuReliquary = new Texture(menuArt);
            menuReliquary.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);
        }
        fx = new GameFx();
        audio = new AudioManager();
        worldMap = new WorldMap();
        worldMap.load();
        mapBuilder = new MapBuilderScreen(atlas, ui, batch, white);
        enchants = new EnchantSystem();

        // capture mouse-wheel scroll (polling can't read it); pointer/keys still polled as before
        Gdx.input.setInputProcessor(new com.badlogic.gdx.InputAdapter() {
            @Override public boolean scrolled(float amountX, float amountY) {
                scrollAccum += amountY;
                return false;
            }
        });

        prefs = Gdx.app.getPreferences("cursed_hoard_v2_save");
        audio.load(prefs);
        for (int slot = 0; slot < EnchantLoadout.SLOT_COUNT; slot++) {
            int ordinal = prefs.getInteger("enchantSlot" + slot, enchantLoadout.get(slot).ordinal());
            if (ordinal >= 0 && ordinal < EnchantType.values().length) {
                enchantLoadout.equip(slot, EnchantType.values()[ordinal]);
            }
        }
        maxLevelReached = prefs.getInteger("progression", 1);
        skillPoints = prefs.getInteger("skillPoints", 15);
        activeMap = prefs.getInteger("mapStyle", 0);
        devMode = prefs.getBoolean("devMode", false);
        speed2xTapMode = prefs.getBoolean("speed2xTap", true);
        mapsOnlyMode = prefs.getBoolean("mapsOnlyMode", false);   // full game is the default
        if (prefs.getInteger("prefsVersion", 1) < 2) {
            // one-time migration: earlier builds defaulted to the maps-only preview — the finished
            // game boots into full gameplay (still toggleable in Settings)
            mapsOnlyMode = false;
            prefs.putBoolean("mapsOnlyMode", false);
            prefs.putInteger("prefsVersion", 2);
            prefs.flush();
        }
        for (int i = 0; i < 40; i++) spentSkills[i] = prefs.getInteger("skill_" + i, 0);
        applyDevModeIfEnabled();

        // Headless-friendly smoke pass: -Dch.smoke=1 boots straight into a live match with a few
        // towers so a single run exercises the playfield, FX and HUD render paths.
        if (Boolean.getBoolean("ch.smoke")) {
            smoke = true;
            maxLevelReached = 25;
        }
        shotState = System.getProperty("ch.shot");
        if (shotState != null) {
            maxLevelReached = 25;
            selectedWorldIndex = Integer.getInteger("ch.shotWorld", 2);
            selectedLevelIndex = Integer.getInteger("ch.shotLevel", 2);
            if (shotState.equals("GAME")) {
                startLevel();
                world.buildTower(TowerType.ORC_WATCHPOST, 300, 380);
                world.buildTower(TowerType.DRONE_BAY, 360, 440);
                world.buildTower(TowerType.IMP_BRAZIER, 440, 360);
                if (Boolean.getBoolean("ch.shotPanel")) {
                    if (Boolean.getBoolean("ch.shotBranchPanel")) {
                        Tower branch = new Tower(TowerType.BOLT_THROWER, 300, 380);
                        world.towers.set(0, branch);
                        selectedTowerRef = branch;
                    } else selectedTowerRef = world.towers.get(0);
                }
                if (Boolean.getBoolean("ch.shotResult")) levelResult = 1;
                selfCheckBuildRules();
            } else {
                state = ScreenState.valueOf(shotState);
                if (state == ScreenState.ALMANAC) {
                    setAlmanacTab(Integer.getInteger("ch.almTab", 0));
                    almanacSub = Integer.getInteger("ch.almSub", 0);
                    selectFirstCell();
                    almanacIndex = Integer.getInteger("ch.almIndex", almanacIndex);
                }
                if (state == ScreenState.SKILL_TREE)
                    selectedSkillFaction = clamp(Integer.getInteger("ch.skillFaction", 0), 0, 3);
                if (state == ScreenState.MAP_BUILDER) mapBuilder.demo();
            }
        }
    }

    /** Headless self-check of the build/cut rules (printed during -Dch.shot=GAME). */
    private void selfCheckBuildRules() {
        int obstacles = 0, base = 0, path = 0, water = 0;
        int[] sampleBase = null, samplePath = null, sampleTree = null;
        for (int x = 0; x < GameMap.WIDTH; x++)
            for (int y = 0; y < GameMap.HEIGHT; y++) {
                TileRole r = world.map.tileAt(x, y).role;
                if (r == TileRole.OBSTACLE) { obstacles++; if (sampleTree == null) sampleTree = new int[] {x, y}; }
                else if (r == TileRole.BASE) { base++; if (sampleBase == null && buildable(x, y)) sampleBase = new int[] {x, y}; }
                else if (r == TileRole.PATH) { path++; if (samplePath == null) samplePath = new int[] {x, y}; }
                else if (r == TileRole.SPECIAL) water++;
            }
        boolean bBase = sampleBase != null && buildable(sampleBase[0], sampleBase[1]);
        boolean bPath = samplePath != null && buildable(samplePath[0], samplePath[1]);
        // simulate felling a tree → it should become buildable
        boolean felledBuildable = false;
        if (sampleTree != null) {
            int x = sampleTree[0], y = sampleTree[1];
            clearedCells.add(cellKey(x, y));
            world.map.setTile(x, y, new MapTile(world.map.tileAt(x, y).terrainType, TileRole.BASE));
            felledBuildable = buildable(x, y);
        }
        System.out.println("BUILDRULES obstacles=" + obstacles + " base=" + base + " path=" + path
                + " water=" + water + " | buildableBase=" + bBase + " buildablePath=" + bPath
                + " felledTreeBuildable=" + felledBuildable);
    }

    /** Capture the framebuffer to a PNG after a few frames, then quit (-Dch.shot). */
    private void maybeScreenshot() {
        if (shotState == null) return;
        if (++shotFrame < 4) return;
        int w = Gdx.graphics.getBackBufferWidth(), h = Gdx.graphics.getBackBufferHeight();
        com.badlogic.gdx.graphics.Pixmap pm = com.badlogic.gdx.utils.ScreenUtils.getFrameBufferPixmap(0, 0, w, h);
        // GL framebuffer origin is bottom-left → flip vertically so the PNG reads upright
        com.badlogic.gdx.graphics.Pixmap flipped = new com.badlogic.gdx.graphics.Pixmap(w, h, pm.getFormat());
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
                flipped.drawPixel(x, y, pm.getPixel(x, h - 1 - y));
        String out = System.getProperty("ch.shotPath", "shot_" + shotState + ".png");
        com.badlogic.gdx.graphics.PixmapIO.writePNG(Gdx.files.absolute(out), flipped);
        pm.dispose();
        flipped.dispose();
        Gdx.app.exit();
    }

    /** Smoke mode: rotate through every screen (and a live match) so one run exercises all paths. */
    private void smokeTick() {
        smokeTimer += Gdx.graphics.getDeltaTime();
        if (smokeTimer < 1.4f) return;
        smokeTimer = 0f;
        if (state == ScreenState.ALMANAC) { almanacTab = (almanacTab + 1) % 3; almanacIndex += 7; }
        ScreenState[] cycle = {ScreenState.MAIN_MENU, ScreenState.WORLD_SELECT, ScreenState.LEVEL_SELECT,
                ScreenState.ALMANAC, ScreenState.ALMANAC, ScreenState.ALMANAC,
                ScreenState.SKILL_TREE, ScreenState.SETTINGS, ScreenState.GAME};
        int idx = (int) (stateTime / 1.4f) % cycle.length;
        ScreenState next = cycle[idx];
        if (next == ScreenState.GAME && world == null) {
            selectedWorldIndex = (idx) % 5;
            selectedLevelIndex = 2;
            startLevel();
            world.buildTower(TowerType.ORC_WATCHPOST, 300, 380);
            world.buildTower(TowerType.DRONE_BAY, 360, 420);
            world.buildTower(TowerType.IMP_BRAZIER, 420, 360);
        } else if (next != ScreenState.GAME && state != next) {
            if (world != null) leaveGame(next); else state = next;
        }
    }

    @Override
    public void resize(int width, int height) {
        viewport.update(width, height, true);
    }

    @Override
    public void render() {
        float dt = Math.min(Gdx.graphics.getDeltaTime(), 0.05f);
        audio.update(dt);
        stateTime += dt;

        Vector2 m = pointer();
        boolean down = Gdx.input.isTouched();
        ui.setPointer(m.x, m.y, down);
        ui.setAccent(screenAccent());

        if (smoke) smokeTick();
        handleInput(m);

        ScreenUtils.clear(UiTheme.VOID.r, UiTheme.VOID.g, UiTheme.VOID.b, 1f);
        Gdx.gl.glEnable(GL20.GL_BLEND);
        viewport.apply();
        batch.setProjectionMatrix(camera.combined);

        switch (state) {
            case SPLASH: updateSplash(dt); renderSplash(); break;
            case MAIN_MENU: renderMainMenu(); break;
            case WORLD_SELECT: renderWorldSelect(); break;
            case LEVEL_SELECT: renderLevelSelect(); break;
            case GAME: updateGame(dt); renderGame(); break;
            case ALMANAC: renderAlmanac(); break;
            case SKILL_TREE: renderSkillTree(); break;
            case SETTINGS: renderSettings(); break;
            case MAP_BUILDER: renderMapBuilder(); break;
        }

        maybeScreenshot();
    }

    /** Pointer in logical (1280×720, y-up) space. */
    private Vector2 pointer() {
        return viewport.unproject(new Vector2(Gdx.input.getX(), Gdx.input.getY()));
    }

    // ───────────────────────────── update ─────────────────────────────

    private void updateSplash(float dt) {
        splashTimer -= dt;
        if (splashTimer <= 0f) { state = ScreenState.MAIN_MENU; stateTime = 0f; }
    }

    private void updateGame(float dt) {
        if (world == null) return;
        if (mapsOnlyMode) return;   // static map/obstacle/building preview — no simulation, no auto-exit
        if (devMode) applyInfiniteResources();
        if (invalidFlash > 0f) invalidFlash -= dt;

        if (levelResult != 0) return;   // world freezes behind the victory/defeat overlay
        if (tutorialPromptActive) return; // guided prompts gate play until explicitly dismissed

        // transport: hold-mode 2× runs only while the button is pressed; pause freezes the sim
        if (!speed2xTapMode) {
            Vector2 hm = pointer();
            speed2x = Gdx.input.isTouched() && hit(hm, W - 104, H - 56, 40, 44);
        }
        if (paused) return;
        float sim = dt * (speed2x ? 2f : 1f);

        updateEconomy(sim);
        updateTreeRegrowth(sim);

        // wave sequencing: field cleared → count the intermission down, then send the next wave;
        // after the last wave the level is won (as long as at least one gem was held)
        if (world.waveSpawner.isDone() && world.heroes.isEmpty()) {
            int completed = world.waveSpawner.waveIndex();
            if (completed > rewardedWaveIndex) {
                world.gold += world.skills.waveGoldBonus();
                rewardedWaveIndex = completed;
            }
            if (world.waveSpawner.waveIndex() >= wavesTotal) {
                levelResult = 1;
                audio.play(Sfx.LEVEL_WON);
                advanceProgress();
                return;
            }
            if (intermission <= 0f) {
                intermission = io.github.some_example_name.game.WavePlan.intermission(selectedLevelIndex);
            }
            intermission -= sim;
            if (intermission <= 0f) startNextWave();
        }

        // the hostile settlement is alive: its buildings muster reinforcements mid-battle
        if (world.waveSpawner.waveIndex() > 0) {
            garrisonTimer -= sim;
            if (garrisonTimer <= 0f) {
                garrisonTimer = 16f;
                spawnGarrison();
            }
        }

        snapshotCooldowns();
        world.update(sim);
        if (devMode) applyInfiniteResources();
        if (!mapsOnlyMode) spawnFireProjectiles();

        for (Hero hero : world.heroes) {
            if (!hero.isAlive() && bursted.add(hero)) {
                audio.play(Sfx.HERO_DEATH);
                Vector2 p = hero.pos;
                if (!mapsOnlyMode) {
                    fx.burst(deathParticle(hero), p.x, p.y, hero.type.boss ? 96f : 48f, 0.5f);
                    fx.burst("particle_smoke", p.x, p.y, 40f, 0.5f);
                }
            }
        }
        world.heroes.removeIf(hero -> !hero.isAlive());

        for (Gem gem : world.gems) {
            if (gem.state == Gem.State.CARRIED && pickedUp.add(gem)) {
                audio.play(Sfx.GEM_PICKUP);
                triggerTutorial(3);
                if (!mapsOnlyMode) fx.burst(keys.gemPickup(gem.type), gem.pos.x, gem.pos.y, 30f, 0.5f);
            } else if (gem.state != Gem.State.CARRIED) {
                pickedUp.remove(gem);
            }
            Gem.State previous = previousGemStates.put(gem, gem.state);
            if (previous == Gem.State.DROPPED && gem.state == Gem.State.IN_CAVE) audio.play(Sfx.GEM_RETURN);
        }
        if (!mapsOnlyMode) fx.update(sim);

        if (!world.gems.isEmpty() && world.gems.stream().allMatch(g -> g.state == Gem.State.LOST)) {
            levelResult = 2;               // every gem carried off — the hoard is lost
            audio.play(Sfx.LEVEL_LOST);
        }
    }

    /** A hostile building sends a defender out to the lane (keeps muster the elite trooper). */
    private void spawnGarrison() {
        List<Building> hostiles = new ArrayList<>();
        for (Building b : world.buildings) {
            if (b.type != BuildingType.GEM_CAVE && b.active) hostiles.add(b);
        }
        if (hostiles.isEmpty()) return;
        Building b = hostiles.get((int) (stateTime * 31) % hostiles.size());
        HeroType t = io.github.some_example_name.game.WavePlan.garrison(
                selectedWorldIndex, selectedLevelIndex, Math.max(0, world.waveSpawner.waveIndex() - 1),
                garrisonSpawnCount++, isKeep(b.type));
        io.github.some_example_name.game.Hero h = world.spawnHero(t);
        h.pos.set(b.pos);
        int best = 0;
        float bd = Float.MAX_VALUE;
        for (int i = 0; i < h.waypoints.size(); i++) {
            float d = h.waypoints.get(i).dst2(b.pos);
            if (d < bd) { bd = d; best = i; }
        }
        h.targetWaypoint = Math.min(best + 1, Math.max(0, h.waypoints.size() - 1));
        if (!mapsOnlyMode) fx.burst("fx_summon_cast", b.pos.x, b.pos.y, 44f, 0.4f);
    }

    /** Persist first-clear campaign progress and the D-14 map-plus-stars reward. */
    private void advanceProgress() {
        int currentLevelIndex = selectedWorldIndex * 5 + selectedLevelIndex + 1;
        boolean changed = false;
        if (currentLevelIndex == maxLevelReached && maxLevelReached < 25) {
            maxLevelReached++;
            prefs.putInteger("progression", maxLevelReached);
            changed = true;
        }
        String rewardKey = "rewardedLevel_" + currentLevelIndex;
        if (!prefs.getBoolean(rewardKey, false)) {
            lastSkillPointAward = io.github.some_example_name.game.ProgressionRewards
                    .skillPointsForStars(world.starRating());
            skillPoints += lastSkillPointAward;
            prefs.putInteger("skillPoints", skillPoints);
            prefs.putBoolean(rewardKey, true);
            changed = true;
        }
        if (changed) {
            prefs.flush();
        }
    }

    private void leaveGame(ScreenState next) {
        state = next;
        world = null;
        fx.clear();
        prevCooldown.clear();
        bursted.clear();
        pickedUp.clear();
        previousGemStates.clear();
    }

    private void snapshotCooldowns() {
        prevCooldown.clear();
        for (Tower t : world.towers) prevCooldown.put(t, t.cooldown);
    }

    /** A tower fired this frame iff its cooldown jumped back up; emit its signature projectile.
     *  Every tower has its own authored {@code proj_*} sprite (48/48, bijective) and its own
     *  delivery: piercing harpoons glide past the strike, volleys spray small shots, mortars lob
     *  slow parabolic shells (the T6 double-mortars alternate barrels). */
    private void spawnFireProjectiles() {
        for (Tower t : world.towers) {
            Float prev = prevCooldown.get(t);
            if (prev == null || t.cooldown <= prev + 0.01f) continue;
            audio.play(Sfx.TOWER_FIRE);
            // Damage is resolved by Tower in the same simulation tick; projectile sprites are cosmetic.
            audio.play(Sfx.PROJECTILE_IMPACT);
            AttackPattern p = t.type.pattern;
            if (p == AttackPattern.DRONE || p == AttackPattern.BOMBER
                    || p == AttackPattern.BEAM || t.isAura()) continue;
            Hero target = world.findTarget(t);
            if (target == null) continue;
            String proj = keys.projectile(t.type);
            String impact = impactParticle(t.type);
            boolean doubleBarrel = t.type == TowerType.MAGMA_MORTAR || t.type == TowerType.DOOMSDAY_CANNON;
            float ox = doubleBarrel ? (t.altBarrel ? 13f : -13f) : 0f;
            switch (p) {
                case LOB:      // slow, heavy, parabolic
                    fx.lob(proj, t.pos.x + ox, t.pos.y + 34f, target.pos.x, target.pos.y, 26f, impact);
                    break;
                case NOVA: {   // a volley of small shots peppering the strike zone
                    int shots = t.type.tier >= 6 ? 9 : 6;
                    for (int i = 0; i < shots; i++) {
                        float jx = (float) (Math.random() * 44 - 22), jy = (float) (Math.random() * 44 - 22);
                        fx.projectile(proj, t.pos.x, t.pos.y + 28f,
                                target.pos.x + jx, target.pos.y + jy, 12f, i == 0 ? impact : null);
                    }
                    break;
                }
                case CHAIN: {  // forking bolt: primary strike + sparks on the forked victims
                    fx.projectile(proj, t.pos.x, t.pos.y + 30f, target.pos.x, target.pos.y, 20f, impact);
                    world.heroes.stream()
                            .filter(h -> h != target && h.isAlive() && h.pos.dst2(target.pos) <= 96f * 96f)
                            .sorted(java.util.Comparator.comparingDouble(h -> h.pos.dst2(target.pos)))
                            .limit(2)
                            .forEach(h -> fx.burst("particle_spark", h.pos.x, h.pos.y, 26f, 0.3f));
                    break;
                }
                default:
                    if (t.type == TowerType.HARPOON_CANNON || t.type == TowerType.DREAD_HARPOON) {
                        fx.pierce(proj, t.pos.x, t.pos.y + 30f, target.pos.x, target.pos.y,
                                t.type.tier >= 6 ? 130f : 90f, 26f, impact);   // glides on through
                    } else {
                        fx.projectile(proj, t.pos.x, t.pos.y + 28f, target.pos.x, target.pos.y, 22f, impact);
                    }
                    break;
            }
        }
    }

    private String impactParticle(TowerType type) {
        switch (type.damageType) {
            case FIRE: return "particle_explosion";
            case FROST: return "particle_magic_glow";
            case LIGHTNING: return "particle_spark";
            case CURSE: return "particle_soul";
            default: return "particle_arrow";   // physical bolts strike as arrows
        }
    }

    private String deathParticle(Hero hero) {
        if (hero.type.mechanical) return "particle_spark";
        String n = hero.type.name();
        if (n.startsWith("BOSS") || n.contains("WRAITH") || n.contains("SHADE") || n.contains("SOUL")) {
            return "particle_soul";
        }
        if (selectedWorldIndex == 4) return "particle_bone";   // shadow realm: skeletal remains
        return "particle_blood";
    }

    private boolean isBossLevel() { return selectedLevelIndex == 4; }

    // ───────────────────────────── input ─────────────────────────────

    private void handleInput(Vector2 m) {
        if (state == ScreenState.MAP_BUILDER) { handleMapBuilderInput(m); scrollAccum = 0f; return; }
        if (state == ScreenState.ALMANAC) almanacScrollY += scrollAccum * 48f;
        scrollAccum = 0f;

        if (Gdx.input.isKeyJustPressed(Input.Keys.ESCAPE)) {
            if (state == ScreenState.GAME && (armedEnchant >= 0 || selectedTowerRef != null)) {
                armedEnchant = -1;
                selectedTowerRef = null;
                return;
            }
            if (state == ScreenState.GAME) leaveGame(ScreenState.LEVEL_SELECT);
            else if (state != ScreenState.MAIN_MENU) state = ScreenState.MAIN_MENU;
            return;
        }

        if (state == ScreenState.GAME && world != null) {
            if (Gdx.input.isKeyJustPressed(Input.Keys.NUM_1)) selectedFamily = 0;
            if (Gdx.input.isKeyJustPressed(Input.Keys.NUM_2)) selectedFamily = 1;
            if (Gdx.input.isKeyJustPressed(Input.Keys.NUM_3)) selectedFamily = 2;
            if (Gdx.input.isKeyJustPressed(Input.Keys.NUM_4)) selectedFamily = 3;
            if (Gdx.input.isKeyJustPressed(Input.Keys.SPACE) && intermission > 0f) startNextWave();
            if (Gdx.input.isKeyJustPressed(Input.Keys.F)) castEnchant(EnchantType.FEAR, m);
            if (Gdx.input.isKeyJustPressed(Input.Keys.M)) castEnchant(EnchantType.METEOR, m);
            if (Gdx.input.isKeyJustPressed(Input.Keys.P)) paused = !paused;
            if (Gdx.input.isKeyJustPressed(Input.Keys.X) && speed2xTapMode) speed2x = !speed2x;
        }

        if (Gdx.input.justTouched()) {
            audio.play(Sfx.UI_CLICK);
            switch (state) {
                case MAIN_MENU: handleMainMenuClick(m); break;
                case WORLD_SELECT: handleWorldSelectClick(m); break;
                case LEVEL_SELECT: handleLevelSelectClick(m); break;
                case GAME: handleGameClick(m); break;
                case ALMANAC: handleAlmanacClick(m); break;
                case SKILL_TREE: handleSkillTreeClick(m); break;
                case SETTINGS: handleSettingsClick(m); break;
                default: break;
            }
        }
    }

    private void castEnchant(EnchantType type, Vector2 m) {
        if (mapsOnlyMode) return;
        Vector2 wp = screenToWorld(m);
        if (enchants.cast(world, type, wp, null, null)) {
            fx.burst(type.assetKey, wp.x, wp.y, 160f, 0.7f);
        }
    }

    private boolean hit(Vector2 m, float x, float y, float w, float h) {
        return m.x >= x && m.x <= x + w && m.y >= y && m.y <= y + h;
    }

    private void handleMainMenuClick(Vector2 m) {
        if (hit(m, 850, 408, 320, 66)) state = ScreenState.WORLD_SELECT;
        else if (hit(m, 850, 334, 320, 54)) { state = ScreenState.ALMANAC; almanacIndex = 0; }
        else if (hit(m, 850, 270, 320, 54)) state = ScreenState.SKILL_TREE;
        else if (hit(m, 850, 206, 320, 54)) state = ScreenState.SETTINGS;
        else if (hit(m, 850, 142, 320, 54)) Gdx.app.exit();
    }

    private void handleWorldSelectClick(Vector2 m) {
        if (hit(m, 40, 40, 130, 48)) { state = ScreenState.MAIN_MENU; return; }
        int w = worldAtPointer(m);
        if (w >= 0 && effectiveMaxLevelReached() >= w * 5 + 1) {
            selectedWorldIndex = w;
            selectedLevelIndex = 0;
            state = ScreenState.LEVEL_SELECT;
        }
    }

    /** The overworld region under the cursor (alpha hit-test on the active map's fragments), or -1. */
    private int worldAtPointer(Vector2 m) {
        if (m.x < OVR_X || m.x > OVR_X + OVR_W || m.y < OVR_Y || m.y > OVR_Y + OVR_H) return -1;
        float u = (m.x - OVR_X) / OVR_W;
        float v = (m.y - OVR_Y) / OVR_H;             // 0 = bottom
        int px = (int) (u * WorldMap.MAP_W);
        int py = (int) ((1f - v) * WorldMap.MAP_H);  // pixmap is top-left origin
        return worldMap.worldAt(activeMap, px, py);
    }

    private void handleLevelSelectClick(Vector2 m) {
        if (hit(m, 40, 40, 130, 48)) { state = ScreenState.WORLD_SELECT; return; }
        for (int i = 0; i < 5; i++) {
            Vector2 n = nodePos(i);
            if (hit(m, n.x - 38, n.y - 38, 76, 76)) {
                int globalLevel = selectedWorldIndex * 5 + i + 1;
                if (effectiveMaxLevelReached() >= globalLevel) { selectedLevelIndex = i; startLevel(); }
            }
        }
    }

    private void handleGameClick(Vector2 m) {
        // result overlay: only the CONTINUE button is live
        if (levelResult != 0) {
            if (hit(m, W / 2f - 110, 246, 220, 54)) leaveGame(ScreenState.LEVEL_SELECT);
            return;
        }
        if (tutorialPromptActive) {
            tutorialPromptActive = false;
            tutorialStage++;
            prefs.putInteger("tutorialStage", tutorialStage);
            if (tutorialStage >= 5) prefs.putBoolean("tutorialSeen", true);
            prefs.flush();
            return;
        }
        // transport buttons (top-right): 2× speed and pause
        if (hit(m, W - 104, H - 56, 40, 44)) {
            if (speed2xTapMode) speed2x = !speed2x;
            return;
        }
        if (hit(m, W - 56, H - 56, 40, 44)) { paused = !paused; return; }
        if (hit(m, W - 150, H - 54, 40, 40) && intermission > 0f) { startNextWave(); return; }
        // bottom HUD: build palette (4 faction chips) + the two equipped enchant slots (D-13)
        for (int i = 0; i < 4; i++) {
            if (hit(m, W - 250 + i * 60, 16, 54, 54)) { selectedFamily = i; selectedTowerRef = null; return; }
        }
        for (int i = 0; i < EnchantLoadout.SLOT_COUNT; i++) {
            if (hit(m, 20 + i * 50, 18, 46, 46)) {
                EnchantType et = enchantLoadout.get(i);
                if (et.castMode == io.github.some_example_name.game.CastMode.GLOBAL) {
                    if (enchants.cast(world, et, null, null, null) && !mapsOnlyMode) {
                        fx.burst(et.assetKey, world.map.cavePosition.x, world.map.cavePosition.y, 120f, 0.8f);
                        triggerTutorial(4);
                    }
                    armedEnchant = -1;
                } else {
                    armedEnchant = armedEnchant == i ? -1 : i;   // arm: next battlefield click casts
                }
                return;
            }
        }
        if (selectedTowerRef != null && handleTowerPanelClick(m)) return;
        // playfield interaction: cast armed enchant, select towers, cut trees, build 2×2 towers
        Vector2 wp = screenToWorld(m);
        if (wp.x < 0f || wp.y < 0f || wp.x >= WORLD_W || wp.y >= WORLD_H) { selectedTowerRef = null; return; }
        int gx = (int) (wp.x / GameMap.TILE_SIZE), gy = (int) (wp.y / GameMap.TILE_SIZE);
        int key = cellKey(gx, gy);
        TileRole role = world.map.tileAt(gx, gy).role;
        float cxw = gx * GameMap.TILE_SIZE + GameMap.TILE_SIZE / 2f, cyw = gy * GameMap.TILE_SIZE + GameMap.TILE_SIZE / 2f;

        if (armedEnchant >= 0) {
            castArmedEnchant(enchantLoadout.get(armedEnchant), wp, key);
            armedEnchant = -1;
            return;
        }

        Building hostile = hostileBuildingAt(wp);
        if (hostile != null) {
            boolean destroyed = hostile.captureStep();
            audio.play(Sfx.PROJECTILE_IMPACT);
            if (!mapsOnlyMode) {
                fx.burst(destroyed ? "particle_explosion" : "particle_smoke",
                        hostile.pos.x, hostile.pos.y + 30f, destroyed ? 70f : 38f, 0.45f);
            }
            if (destroyed) {
                world.gold += isKeep(hostile.type) ? 90 : 45;
                releaseBuildingFootprint(hostile);
            }
            return;
        }

        Tower clicked = towerAt.get(key);
        if (clicked != null) { selectedTowerRef = clicked; return; }
        selectedTowerRef = null;

        if (role == TileRole.OBSTACLE && !clearedCells.contains(key)) {
            // fell the tree: small coin (Timber Tithe, SYSTEMS.md), opens the cell for building
            clearedCells.add(key);
            triggerTutorial(1);
            world.map.setTile(gx, gy, new MapTile(world.map.tileAt(gx, gy).terrainType, TileRole.BASE));
            if (!devMode) world.gold += 10 + world.skills.treeGoldBonus();
            float regrow = world.skills.treeRegrowthSeconds();
            if (regrow > 0f) regrowthTimers.put(key, regrow);
            if (!mapsOnlyMode) {
                fx.burst("particle_smoke", cxw, cyw, 40f, 0.4f);
                fx.burst("icon_gold", cxw, cyw - 12, 18f, 0.6f);
            }
            return;
        }
        if (buildable2(gx, gy)) {
            TowerType type = selectedTower();
            int buildCost = world.skills.buildCost(type);
            if (devMode || world.gold >= buildCost) {
                if (!devMode) world.gold -= buildCost;
                float tx = (gx + 1) * GameMap.TILE_SIZE, ty = (gy + 1) * GameMap.TILE_SIZE;
                Tower tw = world.buildTower(type, tx, ty);    // centred on the 2×2 footprint
                audio.play(Sfx.TOWER_BUILD);
                triggerTutorial(2);
                for (int dx = 0; dx <= 1; dx++)
                    for (int dy = 0; dy <= 1; dy++) {
                        occupiedCells.add(cellKey(gx + dx, gy + dy));
                        towerAt.put(cellKey(gx + dx, gy + dy), tw);
                    }
                if (!mapsOnlyMode) fx.burst("fx_summon_cast", tx, ty, 60f, 0.4f);
            } else {
                invalidFlash = 0.4f; invalidPos.set(cxw, cyw);   // can't afford
            }
            return;
        }
        invalidFlash = 0.4f; invalidPos.set(cxw, cyw);            // can't build here
    }

    /** Resolve an armed enchant against a battlefield click, honouring its cast mode. */
    private void castArmedEnchant(EnchantType et, Vector2 wp, int cellKey) {
        boolean ok = false;
        switch (et.castMode) {
            case ENEMY_TARGET: {                       // Gem Ward: strip the nearest gem carrier
                Hero carrier = null;
                float bd = 140f * 140f;
                for (Hero h : world.heroes) {
                    if (h.isAlive() && h.carrying != null && h.pos.dst2(wp) < bd) {
                        bd = h.pos.dst2(wp);
                        carrier = h;
                    }
                }
                ok = carrier != null && enchants.cast(world, et, wp, carrier, null);
                if (ok && !mapsOnlyMode) fx.burst(et.assetKey, carrier.pos.x, carrier.pos.y, 60f, 0.6f);
                break;
            }
            case TOWER_TARGET: {                       // Dark Overcharge: refresh a tower
                Tower t = towerAt.get(cellKey);
                ok = t != null && enchants.cast(world, et, wp, null, t);
                if (ok && !mapsOnlyMode) fx.burst(et.assetKey, t.pos.x, t.pos.y + 40f, 70f, 0.6f);
                break;
            }
            default:
                ok = enchants.cast(world, et, wp, null, null);
                if (ok && !mapsOnlyMode) fx.burst(et.assetKey, wp.x, wp.y, 160f, 0.7f);
                break;
        }
        if (!ok) { invalidFlash = 0.4f; invalidPos.set(wp); }
        else triggerTutorial(4);
    }

    /** Clicks on the selected-tower panel (upgrade branches + sell). True = consumed. */
    private boolean handleTowerPanelClick(Vector2 m) {
        float px = W / 2f - 290, py = 8, pw = 580, ph = 64;
        if (!hit(m, px, py, pw, ph)) return false;
        java.util.List<TowerType> ups = selectedTowerRef.type.upgrades();
        for (int i = 0; i < Math.min(2, ups.size()); i++) {
            if (hit(m, px + 236 + i * 118, py + 8, 110, 48)) {
                TowerType up = ups.get(i);
                int cost = world.skills.upgradeCost(up);
                if (devMode || world.gold >= cost) {
                    if (!devMode) world.gold -= cost;
                    Tower nt = new Tower(up, selectedTowerRef.pos.x, selectedTowerRef.pos.y);
                    world.towers.set(world.towers.indexOf(selectedTowerRef), nt);
                    for (Map.Entry<Integer, Tower> e : towerAt.entrySet())
                        if (e.getValue() == selectedTowerRef) e.setValue(nt);
                    selectedTowerRef = nt;
                    audio.play(Sfx.TOWER_UPGRADE);
                    if (!mapsOnlyMode) fx.burst("fx_summon_cast", nt.pos.x, nt.pos.y, 70f, 0.5f);
                } else {
                    invalidFlash = 0.4f; invalidPos.set(selectedTowerRef.pos);
                }
                return true;
            }
        }
        if (hit(m, px + pw - 96, py + 8, 84, 48)) {
            Tower dead = selectedTowerRef;
            world.gold += dead.type.sellValue();
            world.towers.remove(dead);
            int agx = (int) (dead.pos.x / GameMap.TILE_SIZE) - 1, agy = (int) (dead.pos.y / GameMap.TILE_SIZE) - 1;
            for (int dx = 0; dx <= 1; dx++)
                for (int dy = 0; dy <= 1; dy++) {
                    occupiedCells.remove(cellKey(agx + dx, agy + dy));
                    towerAt.remove(cellKey(agx + dx, agy + dy));
                }
            selectedTowerRef = null;
            if (!mapsOnlyMode) fx.burst("particle_smoke", dead.pos.x, dead.pos.y, 50f, 0.4f);
            return true;
        }
        return true;   // panel swallow: don't build through it
    }

    /** A tower needs its whole 2×2 footprint buildable (anchor = bottom-left cell). */
    private boolean buildable2(int gx, int gy) {
        for (int dx = 0; dx <= 1; dx++)
            for (int dy = 0; dy <= 1; dy++)
                if (!buildable(gx + dx, gy + dy)) return false;
        return true;
    }

    private void handleAlmanacClick(Vector2 m) {
        if (hit(m, 40, 40, 130, 48)) { state = ScreenState.MAIN_MENU; return; }
        if (almanacTab == 2 && almanacIndex >= 0 && almanacIndex < EnchantType.values().length) {
            for (int slot = 0; slot < EnchantLoadout.SLOT_COUNT; slot++) {
                if (hit(m, DET_X + 24 + slot * 150, 128, 132, 42)) {
                    EnchantType type = EnchantType.values()[almanacIndex];
                    enchantLoadout.equip(slot, type);
                    for (int i = 0; i < EnchantLoadout.SLOT_COUNT; i++)
                        prefs.putInteger("enchantSlot" + i, enchantLoadout.get(i).ordinal());
                    prefs.flush();
                    return;
                }
            }
        }
        // main tabs
        for (int i = 0; i < 3; i++) {
            if (hit(m, 40 + i * 150, 640, 140, 44)) { setAlmanacTab(i); return; }
        }
        // sub-tabs (factions for towers, worlds for troops)
        int subs = almanacSubCount();
        for (int i = 0; i < subs; i++) {
            if (hit(m, 40 + i * 120, 590, 112, 38)) { almanacSub = i; almanacScrollY = 0f; selectFirstCell(); return; }
        }
        // picture cell
        buildAlmanacCells();
        for (float[] c : almCells) {
            if (Math.abs(m.x - c[1]) <= 50 && Math.abs(m.y - c[2]) <= 54) { almanacIndex = (int) c[0]; return; }
        }
    }

    private void setAlmanacTab(int tab) {
        almanacTab = tab;
        almanacSub = 0;
        almanacScrollY = 0f;
        selectFirstCell();
    }

    private int almanacSubCount() {
        if (almanacTab == 1) return Faction.values().length;  // towers by faction
        if (almanacTab == 0) return 5;                        // troops by world
        return 0;                                             // effects: no sub-tabs
    }

    private void selectFirstCell() {
        buildAlmanacCells();
        if (!almCells.isEmpty()) almanacIndex = (int) almCells.get(0)[0];
    }

    private void handleSkillTreeClick(Vector2 m) {
        if (hit(m, 40, 40, 130, 48)) { state = ScreenState.MAIN_MENU; skillTooltipIdx = -1; return; }
        if (hit(m, W - 180, 40, 130, 48)) {
            int allocated = 0;
            for (int i = 0; i < 40; i++) { allocated += spentSkills[i]; spentSkills[i] = 0; prefs.remove("skill_" + i); }
            skillPoints += allocated;
            prefs.putInteger("skillPoints", skillPoints);
            prefs.flush();
            return;
        }
        for (int fac = 0; fac < 4; fac++) {
            if (hit(m, 180 + fac * 230, 568, 210, 44)) {
                selectedSkillFaction = fac;
                skillTooltipIdx = -1;
                return;
            }
        }
        // The active faction is one page: five skills in each of two generous columns.
        for (int skill = 0; skill < 10; skill++) {
            int col = skill / 5, row = skill % 5;
            float x = 130 + col * 520, y = 496 - row * 86;
            int idx = selectedSkillFaction * 10 + skill;
            if (hit(m, x + 14, y, 54, 72)) {
                skillTooltipIdx = skillTooltipIdx == idx ? -1 : idx;
                return;
            }
            if (hit(m, x, y, 500, 72)) {
                if (skillPoints > 0 && spentSkills[idx] < 5) {
                    spentSkills[idx]++;
                    skillPoints--;
                    prefs.putInteger("skill_" + idx, spentSkills[idx]);
                    prefs.putInteger("skillPoints", skillPoints);
                    prefs.flush();
                }
                skillTooltipIdx = idx;
                return;
            }
        }
        skillTooltipIdx = -1;   // clicking empty space closes the box
    }

    private void handleSettingsClick(Vector2 m) {
        if (hit(m, 40, 40, 130, 48)) { state = ScreenState.MAIN_MENU; return; }
        if (hit(m, W - 230, 10, 190, 48)) { state = ScreenState.MAP_BUILDER; return; }
        if (hit(m, 850, 80, 160, 34)) { audio.setMuted(!audio.isMuted()); audio.save(prefs); return; }
        if (hit(m, 1110, 204, 40, 32)) { audio.setMasterVolume(audio.masterVolume() - 0.1f); audio.save(prefs); return; }
        if (hit(m, 1160, 204, 40, 32)) { audio.setMasterVolume(audio.masterVolume() + 0.1f); audio.save(prefs); return; }
        if (hit(m, 1110, 164, 40, 32)) { audio.setMusicVolume(audio.musicVolume() - 0.1f); audio.save(prefs); return; }
        if (hit(m, 1160, 164, 40, 32)) { audio.setMusicVolume(audio.musicVolume() + 0.1f); audio.save(prefs); return; }
        if (hit(m, 1110, 124, 40, 32)) { audio.setSfxVolume(audio.sfxVolume() - 0.1f); audio.save(prefs); return; }
        if (hit(m, 1160, 124, 40, 32)) { audio.setSfxVolume(audio.sfxVolume() + 0.1f); audio.save(prefs); return; }
        if (hit(m, W / 2f - 130, 92, 260, 54)) {
            speed2xTapMode = !speed2xTapMode;
            prefs.putBoolean("speed2xTap", speed2xTapMode);
            prefs.flush();
            return;
        }
        if (hit(m, W / 2f - 130, 364, 260, 54)) {
            int keptMap = activeMap;
            boolean keptDev = devMode;
            boolean keptMapsOnly = mapsOnlyMode;
            maxLevelReached = 1;
            skillPoints = 15;
            for (int i = 0; i < 40; i++) spentSkills[i] = 0;
            prefs.clear();
            prefs.putInteger("mapStyle", keptMap);
            prefs.putBoolean("devMode", keptDev);
            prefs.putBoolean("mapsOnlyMode", keptMapsOnly);
            prefs.flush();
            audio.save(prefs); // reset campaign/tutorial progress, not the player's audio settings
            applyDevModeIfEnabled();
        }
        if (hit(m, W / 2f - 130, 296, 260, 54)) toggleMapStyle();
        if (hit(m, W / 2f - 130, 228, 260, 54)) toggleMapsOnlyMode();
        if (hit(m, W / 2f - 130, 160, 260, 54)) toggleDevMode();
    }

    private void toggleMapStyle() {
        activeMap = (activeMap + 1) % WorldMap.STYLES;
        prefs.putInteger("mapStyle", activeMap);
        prefs.flush();
    }

    private void toggleMapsOnlyMode() {
        mapsOnlyMode = !mapsOnlyMode;
        prefs.putBoolean("mapsOnlyMode", mapsOnlyMode);
        prefs.flush();
        fx.clear();
    }

    private void toggleDevMode() {
        devMode = !devMode;
        prefs.putBoolean("devMode", devMode);
        prefs.flush();
        if (devMode) {
            applyDevModeIfEnabled();
            if (world != null) {
                world.skills = SkillTreeBonus.fromRanks(spentSkills);
                applyInfiniteResources();
            }
        } else {
            maxLevelReached = prefs.getInteger("progression", 1);
            skillPoints = prefs.getInteger("skillPoints", 15);
            for (int i = 0; i < spentSkills.length; i++) {
                spentSkills[i] = prefs.getInteger("skill_" + i, 0);
            }
            if (world != null) world.skills = SkillTreeBonus.fromRanks(spentSkills);
        }
    }

    // ───────────────────────────── level setup ─────────────────────────────

    private List<Vector2> importedBuildingCenters;   // from the authored map, or null → procedural slots

    private void startLevel() {
        state = ScreenState.GAME;
        fx.clear();
        prevCooldown.clear();
        bursted.clear();
        pickedUp.clear();
        previousGemStates.clear();

        // Authored campaign map (assets/maps/w<W>_l<L>.map, editable in the map builder). Falls
        // back to the procedural LevelBuilder only if the file is missing or unparsable.
        blueprintLevel = null;
        importedBuildingCenters = null;
        GameMap map;
        try {
            com.badlogic.gdx.files.FileHandle f = Gdx.files.internal(
                    io.github.some_example_name.game.LevelMaps.fileName(selectedWorldIndex, selectedLevelIndex));
            if (f.exists()) blueprintLevel = io.github.some_example_name.game.BlueprintLevel
                    .fromText(f.readString("UTF-8"));
        } catch (Exception e) {
            Gdx.app.error("startLevel", "authored map failed to load, using fallback", e);
        }
        if (blueprintLevel != null) {
            map = blueprintLevel.map;
        } else {
            long seed = selectedWorldIndex * 5L + selectedLevelIndex + 1;
            io.github.some_example_name.game.LevelBuilder lvl =
                    io.github.some_example_name.game.LevelBuilder.generate(seed, selectedWorldIndex);
            map = lvl.map;
            importedBuildingCenters = lvl.buildingCenters;
        }

        world = new World(map, io.github.some_example_name.game.AssetCatalog.createDefault());
        world.skills = SkillTreeBonus.fromRanks(spentSkills);
        audio.playWorld(selectedWorldIndex);
        world.gold = devMode ? 999999
                : io.github.some_example_name.game.WavePlan.startingGold(selectedWorldIndex, selectedLevelIndex)
                        + world.skills.startGoldBonus();
        world.maxMana = devMode ? 999999 : world.maxMana;
        world.mana = devMode ? world.maxMana : 200 + world.skills.startManaBonus();
        world.buildings.add(new Building(BuildingType.GEM_CAVE, world.map.cavePosition.x, world.map.cavePosition.y));
        if (blueprintLevel != null) {
            for (float[] b : blueprintLevel.buildings)
                world.buildings.add(new Building(BuildingType.values()[(int) b[0]], b[1], b[2]));
        } else {
            placeHostileBuildings();
        }
        initializeEconomyBuildings();

        // the hoard on display: gems fan out in a pentagon around the cave mouth (all visible)
        int gemCount = Math.max(1, world.gems.size());
        for (int i = 0; i < gemCount; i++) {
            double a = Math.PI / 2 + i * Math.PI * 2 / gemCount;
            world.gems.get(i).pos.set(
                    world.map.cavePosition.x + (float) Math.cos(a) * 22f,
                    world.map.cavePosition.y + (float) Math.sin(a) * 22f);
            previousGemStates.put(world.gems.get(i), world.gems.get(i).state);
        }

        // wave sequencing state: first wave rolls in after a short scouting pause
        wavesTotal = io.github.some_example_name.game.WavePlan.waveCount(selectedLevelIndex);
        intermission = 5f;
        levelResult = 0;
        lastSkillPointAward = 0;
        boolean tutorialEligible = selectedWorldIndex == 0 && selectedLevelIndex == 0
                && !prefs.getBoolean("tutorialSeen", false);
        tutorialStage = tutorialEligible ? Math.min(4, prefs.getInteger("tutorialStage", 0)) : 5;
        tutorialPromptActive = tutorialStage == 0;
        paused = false;
        speed2x = false;
        armedEnchant = -1;
        garrisonTimer = 16f;
        garrisonSpawnCount = 0;
        rewardedWaveIndex = 0;
        selectedTowerRef = null;
        towerAt.clear();

        // mark non-buildable cells: the gem cave and every hostile building footprint (3×2)
        clearedCells.clear();
        regrowthTimers.clear();
        occupiedCells.clear();
        for (Building b : world.buildings) {
            int cgx = (int) (b.pos.x / GameMap.TILE_SIZE), cgy = (int) (b.pos.y / GameMap.TILE_SIZE);
            for (int dx = -2; dx <= 1; dx++)
                for (int dy = -1; dy <= 1; dy++) occupiedCells.add((cgx + dx) * 100 + (cgy + dy));
        }
    }

    private int cellKey(int gx, int gy) { return gx * 100 + gy; }

    private void initializeEconomyBuildings() {
        economyBuildings.clear();
        if (blueprintLevel != null) {
            for (Object[] d : blueprintLevel.decorPieces) {
                String key = (String) d[0];
                if (key.startsWith("bld_gold_mine_t") || key.startsWith("bld_mana_well_t")) {
                    economyBuildings.add(new EconomyBuilding(key, (Float) d[1], (Float) d[2]));
                }
            }
        }
        if (economyBuildings.isEmpty()) {
            int mineTier = (selectedWorldIndex % 3) + 1;
            int wellTier = ((selectedWorldIndex + 1) % 3) + 1;
            economyBuildings.add(new EconomyBuilding("bld_gold_mine_t" + mineTier, 190, 110));
            economyBuildings.add(new EconomyBuilding("bld_mana_well_t" + wellTier, 110, 210));
        }
    }

    private void updateEconomy(float dt) {
        for (EconomyBuilding building : economyBuildings) {
            int payout = building.update(dt);
            if (payout <= 0) continue;
            if (building.kind == EconomyBuilding.Kind.GOLD) world.gold += payout;
            else world.mana = Math.min(world.maxMana, world.mana + payout);
            if (!mapsOnlyMode) fx.burst(building.kind == EconomyBuilding.Kind.GOLD ? "icon_gold" : "icon_mana",
                    building.x, building.y + 34f, 18f, 0.7f);
        }
    }

    private void updateTreeRegrowth(float dt) {
        if (regrowthTimers.isEmpty()) return;
        java.util.Iterator<Map.Entry<Integer, Float>> it = regrowthTimers.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<Integer, Float> entry = it.next();
            float remaining = entry.getValue() - dt;
            if (remaining > 0f) { entry.setValue(remaining); continue; }
            int key = entry.getKey(), gx = key / 100, gy = key % 100;
            if (occupiedCells.contains(key)) { entry.setValue(5f); continue; }
            MapTile tile = world.map.tileAt(gx, gy);
            world.map.setTile(gx, gy, new MapTile(tile.terrainType, TileRole.OBSTACLE));
            clearedCells.remove(key);
            it.remove();
            if (!mapsOnlyMode) fx.burst("particle_magic_glow",
                    gx * GameMap.TILE_SIZE + 16f, gy * GameMap.TILE_SIZE + 24f, 32f, 0.6f);
        }
    }

    private Building hostileBuildingAt(Vector2 worldPos) {
        for (Building b : world.buildings) {
            if (!b.active || !b.type.capturable) continue;
            float half = isKeep(b.type) ? 54f : 42f;
            if (Math.abs(worldPos.x - b.pos.x) <= half
                    && worldPos.y >= b.pos.y - 12f && worldPos.y <= b.pos.y + half * 1.8f) return b;
        }
        return null;
    }

    private void releaseBuildingFootprint(Building b) {
        int cgx = (int) (b.pos.x / GameMap.TILE_SIZE), cgy = (int) (b.pos.y / GameMap.TILE_SIZE);
        for (int dx = -2; dx <= 1; dx++)
            for (int dy = -1; dy <= 1; dy++) occupiedCells.remove(cellKey(cgx + dx, cgy + dy));
    }

    /** Open ground a tower can be placed on: BASE role (or a cleared tree), in bounds, unoccupied. */
    private boolean buildable(int gx, int gy) {
        if (gx < 0 || gy < 0 || gx >= GameMap.WIDTH || gy >= GameMap.HEIGHT) return false;
        if (occupiedCells.contains(cellKey(gx, gy))) return false;
        TileRole role = world.map.tileAt(gx, gy).role;
        return role == TileRole.BASE || clearedCells.contains(cellKey(gx, gy));
    }

    /**
     * The hostile settlement around the hero spawn: every level shows the world's minor home
     * buildings and at least one major keep, but the ratio shifts toward keeps in later levels
     * (L1 = 5 villages : 1 keep ... L5 = 1 village : 5 keeps).
     */
    private void placeHostileBuildings() {
        int majors = io.github.some_example_name.game.HostileBuildings.majorCount(selectedLevelIndex);
        int minors = io.github.some_example_name.game.HostileBuildings.minorCount(selectedLevelIndex);
        // authored building-cluster centroids when available, else the procedural spawn-side slots
        List<float[]> slots = new ArrayList<>();
        if (importedBuildingCenters != null && !importedBuildingCenters.isEmpty()) {
            for (Vector2 c : importedBuildingCenters) slots.add(new float[] {c.x, c.y});
        } else {
            for (float[] s : new float[][] {{80, 140}, {170, 110}, {90, 260}, {180, 320}, {80, 430},
                    {170, 500}, {95, 610}, {180, 690}, {85, 800}, {160, 880}}) slots.add(s);
        }
        int si = 0;
        for (int i = 0; i < minors && si < slots.size(); i++, si++)
            world.buildings.add(new Building(
                    io.github.some_example_name.game.HostileBuildings.minor(selectedWorldIndex),
                    slots.get(si)[0], slots.get(si)[1]));
        for (int i = 0; i < majors && si < slots.size(); i++, si++)
            world.buildings.add(new Building(
                    io.github.some_example_name.game.HostileBuildings.major(selectedWorldIndex),
                    slots.get(si)[0], slots.get(si)[1]));
    }

    private boolean isKeep(BuildingType t) {
        return io.github.some_example_name.game.HostileBuildings.isKeep(t);
    }

    private GameMap createLevelMap(int worldIndex, int levelIndex) {
        GameMap map = new GameMap();
        TerrainType baseType = TerrainType.GRASS_BASE, pathType = TerrainType.GRASS_PATH,
                specialType = TerrainType.FROZEN_RIVER;
        switch (worldIndex) {
            case 1: baseType = TerrainType.MOUNTAIN_BASE; pathType = TerrainType.MOUNTAIN_PATH; specialType = TerrainType.FROZEN_RIVER; break;
            case 2: baseType = TerrainType.SAND_BASE; pathType = TerrainType.SAND_PATH; specialType = TerrainType.OASIS_WATER; break;
            case 3: baseType = TerrainType.GARDEN_BASE; pathType = TerrainType.GARDEN_PATH; specialType = TerrainType.GARDEN_CANAL; break;
            case 4: baseType = TerrainType.SHADOW_BASE; pathType = TerrainType.SHADOW_PATH; specialType = TerrainType.CURSED_WATERWAY; break;
        }
        for (int x = 0; x < GameMap.WIDTH; x++)
            for (int y = 0; y < GameMap.HEIGHT; y++)
                map.setTile(x, y, new MapTile(baseType, TileRole.BASE));

        List<Vector2> path = new ArrayList<>();
        // The lane swings around the middle row, but never out of the safe rect — rows outside it
        // are covered by the floating HUD, and a path that walks under the build tray is unplayable.
        int headroom = Math.min(GameMap.MID_ROW - SAFE_ROW_LO, SAFE_ROW_HI - GameMap.MID_ROW) - 1;
        int amplitude = Math.min(headroom, 2 + levelIndex * 2);
        for (int x = 0; x < GameMap.WIDTH; x++) {
            int y = GameMap.MID_ROW + (int) (Math.sin(x * 0.24f + levelIndex) * amplitude);
            y = Math.max(SAFE_ROW_LO + 1, Math.min(SAFE_ROW_HI - 1, y));
            map.setTile(x, y, new MapTile(pathType, TileRole.PATH));
            path.add(new Vector2(x * GameMap.TILE_SIZE + GameMap.TILE_SIZE / 2f, y * GameMap.TILE_SIZE + GameMap.TILE_SIZE / 2f));
            if (x > 5 && x < GameMap.WIDTH - 5 && y - 2 >= SAFE_ROW_LO)
                map.setTile(x, y - 2, new MapTile(specialType, TileRole.SPECIAL));
        }
        map.setCustomPath(path);
        return map;
    }

    // ───────────────────────────── render: splash & menus ─────────────────────────────

    private void renderSplash() {
        batch.begin();
        float p = 1f - splashTimer / 2.4f;
        ui.textCenteredBounded(get("app.title"), W / 2f, H / 2f + 34, 520,
                UiChrome.GOLD, UiChrome.BODY, 1);
        batch.setColor(UiTheme.SURFACE);
        batch.draw(white, W / 2f - 230, H / 2f - 34, 460, 26);
        batch.setColor(UiTheme.GOLD);
        batch.draw(white, W / 2f - 224, H / 2f - 28, 448 * Math.max(0f, Math.min(1f, p)), 14);
        batch.setColor(Color.WHITE);
        batch.end();
    }

    private void renderMainMenu() {
        batch.begin();
        if (menuReliquary != null) batch.draw(menuReliquary, 0, 0, W, H);
        else bg("bg_menu");
        // Preserve a calm action zone even if the illustration changes: the art tells the story
        // on the left, while this transparent veil stabilizes text contrast on the right.
        batch.setColor(UiTheme.VOID.r, UiTheme.VOID.g, UiTheme.VOID.b, 0.62f);
        batch.draw(white, 760, 0, W - 760, H);
        batch.setColor(Color.WHITE);

        float cx = 1010f;
        ui.textCenteredBounded(get("menu.edition"), cx, 622, 410,
                UiChrome.INK_DIM, UiChrome.SMALL, 1);
        ui.banner(get("app.title").toUpperCase(java.util.Locale.ROOT), cx, 604, 410);
        ui.textCenteredBounded(get("menu.subtitle"), cx, 520, 410,
                UiChrome.INK, UiChrome.SMALL, 1);
        ui.panel(828, 116, 364, 382);
        ui.buttonPrimary(850, 408, 320, 66, get("menu.play"));
        ui.button(850, 334, 320, 54, get("menu.almanac"));
        ui.button(850, 270, 320, 54, get("menu.skills"));
        ui.button(850, 206, 320, 54, get("menu.settings"));
        ui.button(850, 142, 320, 54, get("menu.quit"));
        batch.end();
    }

    private static final String[] WORLD_BG = {"bg_level_select_grasslands", "bg_level_select_mountains",
            "bg_level_select_sand", "bg_level_select_gardens", "bg_level_select_shadow"};

    /** Interactive overworld: the active map fills the frame; hovering a biome glows it, click opens it. */
    private void renderWorldSelect() {
        Vector2 m = pointer();
        int hover = worldAtPointer(m);
        batch.begin();
        bg("bg_menu");
        ui.panelGold(OVR_X - 14, OVR_Y - 14, OVR_W + 28, OVR_H + 28);
        // the map itself
        batch.draw(worldMap.map(activeMap), OVR_X, OVR_Y, OVR_W, OVR_H);
        // hover glow: additively re-draw the hovered fragment (aligned to the same frame)
        if (hover >= 0) {
            float pulse = 0.25f + 0.12f * (float) Math.sin(stateTime * 4f);
            boolean unlocked = effectiveMaxLevelReached() >= hover * 5 + 1;
            batch.setBlendFunction(GL20.GL_SRC_ALPHA, GL20.GL_ONE);
            batch.setColor(unlocked ? 0.95f : 0.6f, unlocked ? 0.82f : 0.2f, unlocked ? 0.35f : 0.2f, pulse);
            batch.draw(worldMap.fragment(activeMap, hover), OVR_X, OVR_Y, OVR_W, OVR_H);
            batch.setColor(Color.WHITE);
            batch.setBlendFunction(GL20.GL_SRC_ALPHA, GL20.GL_ONE_MINUS_SRC_ALPHA);
        }
        // chrome
        ui.banner(get("world.choose"), W / 2f, H - 6, 520);
        ui.button(40, 40, 130, 48, get("common.back"));
        ui.panel(1084, 246, 156, 310);
        ui.textCenteredInBox(get("world.realms"), 1084, 510, 156, 46, UiChrome.INK_DIM, 1, 1);
        for (int i = 0; i < 5; i++) {
            Color realm = UiTheme.worldAccent(i);
            boolean unlocked = effectiveMaxLevelReached() >= i * 5 + 1;
            batch.setColor(realm.r, realm.g, realm.b, unlocked ? 1f : 0.22f);
            batch.draw(white, 1106, 474 - i * 48, 10, 28);
            batch.setColor(Color.WHITE);
            ui.textLeftInBox("W" + (i + 1), 1118, 468 - i * 48, 68, 36,
                    unlocked ? UiChrome.INK : UiChrome.INK_DIM, UiChrome.SMALL, 1);
            if (!unlocked) ui.icon("icon_lock", 1190, 476 - i * 48, UiChrome.ICON);
        }
        if (hover >= 0) {
            boolean unlocked = effectiveMaxLevelReached() >= hover * 5 + 1;
            String label = GameStrings.world(hover) + (unlocked ? "" : get("world.locked"));
            ui.panel(m.x - 130, m.y + 16, 260, 34);
            ui.textCenteredInBox(label, m.x - 130, m.y + 16, unlocked ? 260 : 224, 34,
                    unlocked ? UiChrome.GOLD : UiChrome.INK_DIM, UiChrome.BODY, 1);
            if (!unlocked) ui.icon("icon_lock", m.x + 94, m.y + 21, UiChrome.ICON);
        }
        batch.end();
    }

    private Vector2 nodePos(int i) {
        // spread across the left 2/3 so the rightmost node clears the map-preview panel (x≈906)
        return new Vector2(190f + i * 150f, 340f + (float) Math.sin(i * 1.2f) * 110f);
    }

    private void renderLevelSelect() {
        batch.begin();
        // the world's authored level-select backdrop (STRUCTURE.md §3), with the node path on top
        bg(WORLD_BG[selectedWorldIndex]);
        ui.banner(GameStrings.world(selectedWorldIndex), W / 2f, H - 24, 520);
        ui.button(40, 40, 130, 48, get("common.back"));

        // signpost at the trailhead, banner header over the path
        Vector2 start = nodePos(0);
        atlas.drawCentered(batch, "node_signpost", start.x - 96, start.y - 30, 72, 72, stateTime);
        atlas.drawCentered(batch, "node_banner", W / 2f, H - 110, 220, 60, stateTime);

        drawLevelTrail();

        for (int i = 0; i < 5; i++) {
            int globalLevel = selectedWorldIndex * 5 + i + 1;
            boolean unlocked = effectiveMaxLevelReached() >= globalLevel;
            boolean cleared = effectiveMaxLevelReached() > globalLevel;
            Vector2 n = nodePos(i);
            // ring state underneath the node icon
            atlas.drawCentered(batch, unlocked ? "node_unlocked" : "node_locked", n.x, n.y, 92, 92, stateTime);
            String nodeKey = !unlocked ? "node_locked"
                    : cleared ? "node_star3" : keys.node(selectedWorldIndex, i);
            atlas.drawCentered(batch, nodeKey, n.x, n.y, 70, 70, stateTime);
            // 3-star row
            for (int s = 0; s < 3; s++) {
                String star = cleared ? "icon_star_filled" : unlocked ? "icon_star" : "icon_star_locked";
                ui.icon(star, n.x - 24 + s * 17, n.y - 44, UiChrome.ICON);
            }
            ui.textCenteredBounded(get("level.short", i + 1), n.x, n.y - 54, 92,
                    unlocked ? UiChrome.INK : UiChrome.INK_DIM, UiChrome.BODY, 1);
        }

        // live preview of the authored map (rendered from the actual .map blueprint)
        float px = W - 360, py = 150;
        ui.panelGold(px - 14, py - 14, 336, 336);
        drawLevelPreview(px, py + 10, 304f);
        ui.textCenteredInBox(get("level.preview", selectedLevelIndex + 1), px - 14, py + 286,
                336, 50, UiChrome.GOLD, UiChrome.BODY, 1);
        batch.end();
    }

    /** Connected progression reads as one journey instead of five unrelated buttons. */
    private void drawLevelTrail() {
        for (int i = 0; i < 4; i++) {
            Vector2 a = nodePos(i), b = nodePos(i + 1);
            float dx = b.x - a.x, dy = b.y - a.y;
            float length = (float) Math.sqrt(dx * dx + dy * dy);
            float angle = (float) Math.toDegrees(Math.atan2(dy, dx));
            batch.setColor(0.02f, 0.01f, 0.04f, 0.82f);
            batch.draw(whiteRegion, a.x, a.y - 5f, 0f, 5f, length, 10f, 1f, 1f, angle);
            boolean unlocked = effectiveMaxLevelReached() >= selectedWorldIndex * 5 + i + 2;
            Color c = ui.accent();
            batch.setColor(c.r, c.g, c.b, unlocked ? 0.88f : 0.22f);
            batch.draw(whiteRegion, a.x, a.y - 2f, 0f, 2f, length, 4f, 1f, 1f, angle);
        }
        batch.setColor(Color.WHITE);
    }

    private io.github.some_example_name.game.BlueprintLevel previewLevel;
    private int previewKey = -1;

    /** Miniature of the authored level: real terrain tiles, trees, buildings, spawn and cave. */
    private void drawLevelPreview(float x, float y, float size) {
        int key = selectedWorldIndex * 5 + selectedLevelIndex;
        if (previewKey != key) {
            previewKey = key;
            previewLevel = null;
            try {
                com.badlogic.gdx.files.FileHandle f = Gdx.files.internal(
                        io.github.some_example_name.game.LevelMaps.fileName(selectedWorldIndex, selectedLevelIndex));
                if (f.exists()) previewLevel = io.github.some_example_name.game.BlueprintLevel
                        .fromText(f.readString("UTF-8"));
            } catch (Exception e) {
                previewLevel = null;
            }
        }
        if (previewLevel == null) {   // fallback: the old baked art
            atlas.drawCentered(batch, keys.map(selectedWorldIndex, selectedLevelIndex),
                    x + size / 2f, y + size / 2f, size, size, 0f);
            return;
        }
        float ts = size / GameMap.WIDTH;
        for (int cx = 0; cx < GameMap.WIDTH; cx++)
            for (int cy = 0; cy < GameMap.HEIGHT; cy++)
                atlas.draw(batch, previewLevel.tileKey(cx, cy), x + cx * ts, y + cy * ts, ts + 0.5f, ts + 0.5f, 0f);
        for (int cx = 0; cx < GameMap.WIDTH; cx++)
            for (int cy = 0; cy < GameMap.HEIGHT; cy++) {
                String tree = previewLevel.obstacleKey(cx, cy);
                if (tree != null) atlas.drawCentered(batch, tree,
                        x + (cx + 0.5f) * ts, y + (cy + 0.7f) * ts, ts * 1.5f, ts * 2f, 0f);
            }
        for (float[] b : previewLevel.buildings) {
            atlas.drawFrame(batch, keys.building(BuildingType.values()[(int) b[0]]), 0,
                    x + b[1] / GameMap.TILE_SIZE * ts, y + b[2] / GameMap.TILE_SIZE * ts,
                    ts * 3f, ts * 3f);
        }
        atlas.drawCentered(batch, "bld_gem_cave",
                x + previewLevel.cave.x / GameMap.TILE_SIZE * ts,
                y + previewLevel.cave.y / GameMap.TILE_SIZE * ts, ts * 3f, ts * 3f, 0f);
    }

    // ───────────────────────────── render: game ─────────────────────────────

    private void renderGame() {
        batch.begin();
        drawPlayfield();
        drawBuildings();
        if (mapsOnlyMode) {
            drawMapsOnlyLabel();
            batch.end();
            return;
        }
        drawBuildOverlay();
        drawGems();
        drawTowers();
        drawBeamsAndAuras();
        drawDrones();
        drawHeroes();
        fx.render(batch, atlas, this::worldToScreen);
        drawStatusOverlays();
        drawHudScrim();
        drawHud();
        if (levelResult != 0) drawResultOverlay();
        else if (tutorialPromptActive) drawTutorialPrompt();
        batch.end();
    }

    private void drawTutorialPrompt() {
        batch.setColor(0f, 0f, 0f, 0.58f);
        batch.draw(white, 0, 0, W, H);
        batch.setColor(Color.WHITE);
        ui.panelGold(W / 2f - 330, H / 2f - 64, 660, 128);
        ui.textCenteredInBox(get("tutorial.title"), W / 2f - 330, H / 2f + 12, 660, 44,
                UiChrome.GOLD, UiChrome.BODY, 1);
        ui.textCenteredInBox(get("tutorial." + Math.max(0, Math.min(4, tutorialStage))),
                W / 2f - 330, H / 2f - 24, 660, 36, UiChrome.INK, UiChrome.SMALL, 1);
        ui.textCenteredInBox(get("tutorial.continue"), W / 2f - 330, H / 2f - 60, 660, 36,
                UiChrome.INK_DIM, UiChrome.SMALL, 1);
    }

    private void drawMapsOnlyLabel() {
        ui.panel(24, H - 58, 420, 42);
        ui.textLeftInBox(get("hud.maps_only"), 24, H - 58, devMode ? 350 : 420, 42,
                UiChrome.GOLD, UiChrome.BODY, 1);
        if (devMode) ui.textCenteredInBox(get("hud.dev"), 374, H - 58, 70, 42,
                UiChrome.INK_DIM, UiChrome.BODY, 1);
    }

    /** Hover feedback: precise 2x2 placement plate, tree action, or blocked plate. */
    private void drawBuildOverlay() {
        Vector2 m = pointer();
        Vector2 wp = screenToWorld(m);
        float cs = GameMap.TILE_SIZE * SCALE;
        if (wp.x >= 0f && wp.y >= 0f && wp.x < WORLD_W && wp.y < WORLD_H
                && m.y > HUD_BOT_H && m.y < H - HUD_TOP_H) {
            int gx = (int) (wp.x / GameMap.TILE_SIZE), gy = (int) (wp.y / GameMap.TILE_SIZE);
            TileRole role = world.map.tileAt(gx, gy).role;
            float sx = MAP_X + gx * GameMap.TILE_SIZE * SCALE, sy = MAP_Y + gy * GameMap.TILE_SIZE * SCALE;
            if (towerAt.containsKey(cellKey(gx, gy))) {
                batch.setColor(0.85f, 0.75f, 0.3f, 0.3f);            // select this tower
                batch.draw(white, sx, sy, cs, cs);
            } else if (role == TileRole.OBSTACLE && !clearedCells.contains(cellKey(gx, gy))) {
                batch.setColor(0.95f, 0.6f, 0.2f, 0.35f);            // fell the tree
                batch.draw(white, sx, sy, cs, cs);
            } else if (buildable2(gx, gy)) {
                batch.setColor(0.3f, 0.85f, 0.35f, 0.35f);           // buildable 2×2 footprint
                batch.draw(white, sx, sy, cs * 2f, cs * 2f);
            } else {
                batch.setColor(0.9f, 0.25f, 0.2f, 0.32f);            // blocked
                batch.draw(white, sx, sy, cs * 2f, cs * 2f);
            }
            batch.setColor(Color.WHITE);
        }
        if (invalidFlash > 0f) {
            Vector2 c = worldToScreen(invalidPos);
            batch.setColor(0.95f, 0.2f, 0.18f, Math.min(0.6f, invalidFlash));
            batch.draw(white, c.x - cs / 2f, c.y - cs / 2f, cs, cs);
            batch.setColor(Color.WHITE);
        }
    }

    private void drawPlayfield() {
        // Full-bleed: there is no frame any more. At 40×22 the field *is* the window, so a border
        // would only eat the field it was drawn to flatter. The letterbox is 8 px of black.
        batch.setColor(0f, 0f, 0f, 1f);
        batch.draw(white, 0, 0, W, MAP_Y);
        batch.draw(white, 0, H - MAP_Y, W, MAP_Y);
        batch.setColor(Color.WHITE);
        // Terrain drawn per-tile at native resolution; the path, obstacles and buildings are
        // engine-placed (LevelBuilder), so each is its own sprite (interactive, gameplay-correct).
        drawTiledPlayfield();
    }

    /**
     * The HUD floats over a live playfield now (D-07), so it needs to sit on something or the
     * text fights the terrain. Two soft vertical gradients — dark at the screen edge, clear by
     * the safe rect — read as depth rather than as a panel, and cost two quads.
     */
    private void drawHudScrim() {
        int steps = 8;
        for (int i = 0; i < steps; i++) {
            float t = i / (float) steps;
            float a = 0.42f * (1f - t) * (1f - t);
            batch.setColor(0.02f, 0.015f, 0.04f, a);
            batch.draw(white, 0, HUD_BOT_H * t, W, HUD_BOT_H / steps + 1f);
            batch.draw(white, 0, H - HUD_TOP_H * t - HUD_TOP_H / steps, W, HUD_TOP_H / steps + 1f);
        }
        batch.setColor(Color.WHITE);
    }

    private String worldBaseTile(int worldIndex) {
        switch (worldIndex) {
            case 1: return "tile_mountain_base";
            case 2: return "tile_sand_base";
            case 3: return "tile_garden_lawn";
            case 4: return "tile_shadow_base";
            default: return "tile_grass_base";
        }
    }

    private void drawTiledPlayfield() {
        float ts = GameMap.TILE_SIZE * SCALE;
        String[] decor = SpriteKeys.DECOR_TILES[selectedWorldIndex];
        String[] trees = SpriteKeys.OBSTACLE_TREES[selectedWorldIndex];
        String waterTile = worldWaterTile(selectedWorldIndex);
        boolean authored = blueprintLevel != null;
        // pass 1: terrain — authored maps draw the exact editor tile (key + rotation) per cell
        for (int x = 0; x < GameMap.WIDTH; x++) {
            for (int y = 0; y < GameMap.HEIGHT; y++) {
                MapTile tile = world.map.tileAt(x, y);
                float sx = MAP_X + x * ts, sy = MAP_Y + y * ts;
                if (authored) {
                    String key = blueprintLevel.tileKey(x, y);
                    int rot = blueprintLevel.tileRot(x, y);
                    if (rot == 0) atlas.draw(batch, key, sx, sy, ts + 1f, ts + 1f, 0f);
                    else atlas.drawRotated(batch, key, sx, sy, ts + 1f, ts + 1f, rot * 90f);
                    continue;
                }
                String base = tile.role == TileRole.SPECIAL ? waterTile : keys.terrainTile(tile.terrainType);
                atlas.draw(batch, base, sx, sy, ts + 1f, ts + 1f, 0f);
                int h = hash(x, y);
                if (tile.role == TileRole.BASE && (h & 15) == 0)
                    atlas.draw(batch, decor[(h >> 4) % decor.length], sx, sy, ts + 1f, ts + 1f, 0f);
            }
        }
        drawAutoEdges(ts, waterTile);
        // passes 2–3: tree trunks, then tree canopies (so overlapping treetops never sit behind a trunk)
        for (int pass = 0; pass < 2; pass++)
            for (int y = GameMap.HEIGHT - 1; y >= 0; y--)
                for (int x = 0; x < GameMap.WIDTH; x++) {
                    if (world.map.tileAt(x, y).role != TileRole.OBSTACLE) continue;
                    String tree = authored ? blueprintLevel.obstacleKey(x, y) : null;
                    if (tree == null) tree = trees[(hash(x, y) >> 6) % trees.length];
                    Vector2 c = worldToScreen(x * GameMap.TILE_SIZE + 16, y * GameMap.TILE_SIZE + 16);
                    float bx = c.x - 20, by = c.y + 12 - 26;     // matches drawCentered(40×52)
                    if (pass == 0) atlas.drawVBand(batch, tree, bx, by, 40, 52, 0f, 0.42f);
                    else atlas.drawVBand(batch, tree, bx, by, 40, 52, 0.42f, 1f);
                }
    }

    /**
     * D-19 pass: bleed water, then the lane, over whatever they border. Runs off tile <i>roles</i>,
     * so it works identically for an authored blueprint and a procedurally generated level — the
     * editor never has to place a transition tile by hand, which is the whole point of D-19.
     * Water goes down first so the road crosses it (a culvert), not the reverse.
     */
    private void drawAutoEdges(float ts, String waterTile) {
        String pathTile = worldPathTile(selectedWorldIndex);
        for (int pass = 0; pass < 2; pass++) {
            TileResolver.Layer layer = pass == 0 ? TileResolver.Layer.WATER : TileResolver.Layer.PATH;
            String src = pass == 0 ? waterTile : pathTile;
            for (int x = 0; x < GameMap.WIDTH; x++)
                for (int y = 0; y < GameMap.HEIGHT; y++) {
                    String[] parts = TileResolver.pieces(world.map, x, y, layer);
                    if (parts.length == 0) continue;
                    float sx = MAP_X + x * ts, sy = MAP_Y + y * ts;
                    for (String p : parts)
                        atlas.draw(batch, TileResolver.edgeKey(src, p), sx, sy, ts + 1f, ts + 1f, 0f);
                }
        }
    }

    private String worldPathTile(int worldIndex) {
        switch (worldIndex) {
            case 1: return "tile_mountain_path";
            case 2: return "tile_sand_path";
            case 3: return "tile_garden_path";
            case 4: return "tile_shadow_path";
            default: return "tile_grass_path";
        }
    }

    private String worldWaterTile(int worldIndex) {
        switch (worldIndex) {
            case 1: return "tile_mountain_frozen_river";
            case 2: return "tile_sand_oasis_water";
            case 3: return "tile_garden_canal";
            case 4: return "tile_shadow_cursed_water";
            default: return "tile_grass_brook";
        }
    }

    private int hash(int x, int y) {
        int h = x * 73856093 ^ y * 19349663 ^ (selectedWorldIndex + 1) * 83492791;
        return h & 0x7fffffff;
    }

    private void drawBuildings() {
        for (Building b : world.buildings) {
            Vector2 p = worldToScreen(b.pos);
            // Buildings are landmarks, not scenery: a keep is the thing a player navigates by and
            // it should read as a place you could walk into. At 68 px it was barely two cells tall
            // and lost against the ground. 96 px is exactly the width of its own 3x2 blueprint
            // footprint, which is the natural anchor — the building is as wide as the plot it owns.
            float s = isKeep(b.type) ? 96 : b.type == BuildingType.GEM_CAVE ? 80 : 72;
            // Buildings STAND on their position. `drawFrame` centres the sprite, and the old
            // `+ s * 0.18f` lift left the mass straddling its own anchor — which put the gem cave
            // half a sprite off the end of the lane. The art is authored with a cast shadow on its
            // bottom row, so the bottom edge is the ground contact: centre it at y + s/2, then sink
            // it 5 px so the shadow overlaps the terrain instead of hovering above it.
            atlas.drawFrame(batch, keys.building(b.type), b.damageFrame(),
                    p.x, p.y + s / 2f - 5f, s, s);
        }
        for (EconomyBuilding economy : economyBuildings) {
            Vector2 p = worldToScreen(economy.x, economy.y);
            atlas.drawCentered(batch, economy.spriteKey, p.x, p.y + 16, 84, 84, worldTime());
        }
    }

    private void drawGems() {
        for (Gem gem : world.gems) {
            if (gem.state == Gem.State.LOST || gem.state == Gem.State.CARRIED) continue;
            Vector2 p = worldToScreen(gem.pos);
            atlas.drawCentered(batch, keys.gem(gem.type, false), p.x, p.y, 15, 15, worldTime());
        }
    }

    private void drawTowers() {
        float cs = GameMap.TILE_SIZE * SCALE;
        for (Tower tower : world.towers) {
            Vector2 p = worldToScreen(tower.pos);           // centre of the 2×2 footprint
            if (tower == selectedTowerRef) {
                batch.setColor(0.9f, 0.78f, 0.3f, 0.35f);
                batch.draw(white, p.x - cs, p.y - cs, cs * 2f, cs * 2f);
                batch.setColor(Color.WHITE);
            }
            // Every tower draws as a static structure plus an optional aim part that faces the
            // target (D-23). Five authored facings cover eight directions: W/NW/SW are E/NE/SE
            // mirrored. Facing and the fire animation are independent now — the facing picks the
            // sprite, the frame index picks rest-vs-firing within it.
            String aim = keys.towerAim(tower.type, tower.turret.art());
            if (aim != null) {
                atlas.drawCentered(batch, keys.towerBase(tower.type), p.x, p.y + 26, 50, 96, 0f);
                atlas.drawFrame(batch, aim, tower.turret.frame(), tower.turret.flip(),
                        p.x, p.y + 26, 50, 96);
            } else if (tower.type.hasTurret) {
                // legacy art: the old atlas packed the 8 facings into the frame array
                atlas.drawCentered(batch, keys.towerBase(tower.type), p.x, p.y + 26, 50, 96, 0f);
                atlas.drawFrame(batch, keys.tower(tower.type), tower.turret.facing, p.x, p.y + 26, 50, 96);
            } else {
                atlas.drawCentered(batch, keys.tower(tower.type), p.x, p.y + 26, 50, 96, worldTime());
            }
            // crypt spires: banked charges orbit the spire until an enemy walks into range
            if (tower.charges > 0) {
                String orb = keys.projectile(tower.type);
                for (int i = 0; i < tower.charges; i++) {
                    double a = stateTime * 2.6 + i * (Math.PI * 2 / 3);
                    float oxp = (float) Math.cos(a) * 18f, oyp = (float) Math.sin(a) * 7f;
                    atlas.drawCentered(batch, orb, p.x + oxp, p.y + 52 + oyp, 12, 12, stateTime + i);
                }
            }
            if (tower.disabledTimer > 0f) atlas.drawCentered(batch, "icon_stunned", p.x, p.y + 52, 20, 20, worldTime());
        }
    }

    private static final Color BEAM_HELLBEAM = new Color(1f, 0.62f, 0.18f, 1f);
    private static final Color BEAM_LANCE = new Color(1f, 0.32f, 0.16f, 1f);
    private static final Color BEAM_RAY = new Color(0.72f, 0.30f, 0.95f, 1f);
    private static final Color BEAM_DOOM = new Color(1f, 0.94f, 0.75f, 1f);

    /** Demon specials drawn live: inferno beams to their victim, and the fire auras' ground glow. */
    private void drawBeamsAndAuras() {
        for (Tower t : world.towers) {
            if (t.isAura()) {
                Vector2 p = worldToScreen(t.pos);
                float pulse = 0.26f + 0.10f * (float) Math.sin(stateTime * 5f + t.pos.x);
                batch.setColor(1f, 1f, 1f, pulse + 0.2f);
                float d = t.type.range * 2f * SCALE * 0.9f;
                atlas.drawCentered(batch, keys.projectile(t.type), p.x, p.y, d, d, stateTime);
                batch.setColor(Color.WHITE);
                continue;
            }
            if (t.beamTarget == null || !t.beamTarget.isAlive()) continue;
            Vector2 a = worldToScreen(t.pos.x, t.pos.y + 62f);
            Vector2 b = worldToScreen(t.beamTarget.pos);
            float ang = (float) Math.toDegrees(Math.atan2(b.y - a.y, b.x - a.x));
            float len = a.dst(b);
            Color col = t.type == TowerType.HELLBEAM ? BEAM_HELLBEAM
                    : t.type == TowerType.SEARING_LANCE ? BEAM_LANCE
                    : t.type == TowerType.ABYSSAL_RAY ? BEAM_RAY : BEAM_DOOM;
            float flicker = 0.55f + 0.2f * (float) Math.sin(stateTime * 24f);
            batch.setColor(col.r, col.g, col.b, flicker * 0.5f);
            batch.draw(whiteRegion, a.x, a.y - 2.5f, 0f, 2.5f, len, 5f, 1f, 1f, ang);
            batch.setColor(1f, 1f, 0.9f, flicker);
            batch.draw(whiteRegion, a.x, a.y - 1f, 0f, 1f, len, 2f, 1f, 1f, ang);
            batch.setColor(Color.WHITE);
            atlas.drawCentered(batch, keys.projectile(t.type), b.x, b.y, 20, 20, stateTime * 3f);
        }
    }

    private final Map<DroneActor, Integer> bombCount = new IdentityHashMap<>();

    private void drawDrones() {
        for (DroneActor d : world.drones) {
            Vector2 p = worldToScreen(d.pos);
            boolean attacking = d.state == DroneActor.State.ATTACKING;
            // 48 / 32 exactly, matching the authored canvases so the drone actors are never
            // resampled (1x density). Bombers are the big laden airframes; seekers are small.
            float s = d.bomber ? 48 : 32;
            atlas.drawCentered(batch, keys.droneUnit(d.source.type, attacking), p.x, p.y + 18, s, s, worldTime());
            if (d.bomber) {
                Integer prev = bombCount.put(d, d.bombsDropped);
                if (prev != null && d.bombsDropped > prev && !mapsOnlyMode) {
                    // each release: a bomb falls from the airframe and detonates on the ground
                    fx.projectile(keys.projectile(d.source.type), d.pos.x, d.pos.y + 26f,
                            d.pos.x + 6f, d.pos.y - 8f, 16f, "particle_explosion");
                }
            }
        }
        bombCount.keySet().retainAll(new java.util.HashSet<>(world.drones));
    }

    private void drawHeroes() {
        for (Hero hero : world.heroes) {
            Vector2 p = worldToScreen(hero.pos);
            // 56 / 44 / 32 exactly, matching the authored troop canvases (1x density, A-1).
            float size = hero.type.boss ? 56 : hero.type.champion ? 44 : 32;
            // W-4 fix: ask for the clip the unit is actually in, not always "walk". This is
            // what makes the authored ability / carry / death animations reachable at all.
            String state = hero.animState();
            atlas.drawCentered(batch, keys.troop(hero.type, state), p.x, p.y + size * 0.25f, size, size, hero.animTime);
            if (hero.carrying != null)
                atlas.drawCentered(batch, keys.gem(hero.carrying.type, true), p.x, p.y + size * 0.85f, 16, 16, hero.animTime);
            // health pip
            float r = size * 0.45f;
            drawHealthPip(p.x, p.y + r + 8, r, Math.max(0f, hero.hp / hero.maxHp));
        }
    }

    private static final Color HP_HI = new Color(0.45f, 0.85f, 0.35f, 1f);
    private static final Color HP_MID = new Color(0.92f, 0.76f, 0.22f, 1f);
    private static final Color HP_LO = new Color(0.86f, 0.26f, 0.22f, 1f);
    private static final Color HP_BG = new Color(0f, 0f, 0f, 0.72f);

    /** A 2-colour enemy health bar drawn in-batch with the 1×1 fill (crisp, no state switches). */
    private void drawHealthPip(float cx, float y, float r, float frac) {
        float w = r * 2f, h = 4f;
        batch.setColor(HP_BG);
        batch.draw(white, cx - r - 1, y - 1, w + 2, h + 2);
        batch.setColor(frac > 0.5f ? HP_HI : frac > 0.25f ? HP_MID : HP_LO);
        batch.draw(white, cx - r, y, w * frac, h);
        batch.setColor(Color.WHITE);
    }

    private void drawStatusOverlays() {
        for (Hero hero : world.heroes) {
            Vector2 p = worldToScreen(hero.pos);
            float yo = 0;
            for (StatusType st : StatusType.values()) {
                if (!hero.statusController.isStatusActive(st)) continue;
                String fxKey = keys.statusFx(st);
                if (fxKey != null) atlas.drawCentered(batch, fxKey, p.x, p.y + 6, 34, 34, hero.animTime + yo);
                yo += 0.5f;
            }
        }
    }

    private void drawHud() {
        // Four anchored islands frame the action without turning the whole screen edge into a bar.
        ui.panel(14, H - 66, 496, 60);
        ui.panel(968, H - 66, 304, 60);
        ui.panelGold(12, 10, 116, 64);
        ui.panel(W - 262, 8, 254, 96);

        // top resource capsules
        ui.capsule(24, H - 52, 150, 38, "icon_gold", String.valueOf(world.gold));
        ui.capsule(186, H - 52, 170, 38, "icon_mana", world.mana + "/" + world.maxMana);
        ui.capsule(368, H - 52, 130, 38, "icon_gem", String.valueOf(remainingGems()));
        ui.bar(24, H - 60, 150, 6, Math.min(1f, world.gold / 1500f), false);
        ui.bar(186, H - 60, 170, 6, world.mana / (float) Math.max(1, world.maxMana), true);

        // wave transport (top-right): progress capsule, SEND (early-call), 2× speed, pause
        int waveNo = Math.min(world.waveSpawner.waveIndex(), wavesTotal);
        ui.capsule(W - 300, H - 52, 146, 38, "icon_wave", waveNo + "/" + wavesTotal);
        if (intermission > 0f && levelResult == 0) {
            float frac = intermission / Math.max(1f, io.github.some_example_name.game.WavePlan
                    .intermission(selectedLevelIndex));
            ui.bar(W - 300, H - 60, 146, 6, Math.min(1f, frac), true);
            ui.icon("icon_play", W - 146, H - 50, UiChrome.ICON);
            ui.textCenteredInBox(get("hud.early_bonus", (int) (intermission * 2f)),
                    W - 154, H - 66, 58, 60, UiChrome.GOLD, UiChrome.BODY, 1);
        }
        if (speed2x) ui.panelGold(W - 104, H - 56, 40, 44);
        else ui.panel(W - 104, H - 56, 40, 44);
        ui.textCenteredInBox(get("hud.speed"), W - 104, H - 56, 40, 44,
                speed2x ? UiChrome.GOLD : UiChrome.INK, UiChrome.BODY, 1);
        if (paused) ui.panelGold(W - 56, H - 56, 40, 44);
        else ui.panel(W - 56, H - 56, 40, 44);
        ui.icon(paused ? "icon_play" : "icon_pause", W - 48, H - 48, UiChrome.ICON);

        // exactly two equipped player enchants (D-13); armed one glows, mana cost sits in the corner
        for (int i = 0; i < EnchantLoadout.SLOT_COUNT; i++) {
            EnchantType et = enchantLoadout.get(i);
            float x = 20 + i * 50;
            if (armedEnchant == i) ui.panelGold(x, 18, 46, 46);
            else ui.panel(x, 18, 46, 46);
            int manaCost = world.skills.enchantCost(et);
            boolean canPay = devMode || world.mana >= manaCost;
            if (!canPay) batch.setColor(0.5f, 0.5f, 0.6f, 1f);
            atlas.drawCentered(batch, et.assetKey, x + 23, 18 + 26, UiChrome.ICON, UiChrome.ICON, worldTime());
            batch.setColor(Color.WHITE);
            ui.textCenteredInBox(String.valueOf(manaCost), x, 18, 46, 24,
                    canPay ? UiChrome.INK : UiChrome.INK_DIM, UiChrome.BODY, 1);
        }

        // selected-tower panel (bottom-centre) or the contextual hint line
        if (selectedTowerRef != null) drawTowerPanel();
        else {
            ui.panel(W / 2f - 290, 8, 580, 64);
            if (armedEnchant >= 0) ui.textCenteredInBox(
                    get("hud.cast", enchantLoadout.get(armedEnchant).displayName),
                    W / 2f - 290, 8, 580, 64, UiChrome.GOLD, UiChrome.SMALL, 1);
            else ui.textCenteredInBox(get("hud.build_hint"), W / 2f - 290, 8, 580, 64,
                    UiChrome.INK_DIM, UiChrome.SMALL, 1);
        }

        // tower build palette (bottom-right, 4 factions, live costs)
        TowerType[] fams = {TowerType.ORC_WATCHPOST, TowerType.CRYPT, TowerType.IMP_BRAZIER, TowerType.GOBLIN_WORKSHOP};
        for (int i = 0; i < 4; i++) {
            float x = W - 250 + i * 60;
            int cost = world.skills.buildCost(fams[i]);
            boolean afford = devMode || world.gold >= cost;
            if (selectedFamily == i) ui.panelGold(x, 16, 54, 54);
            else ui.panel(x, 16, 54, 54);
            if (!afford) batch.setColor(0.55f, 0.5f, 0.5f, 1f);
            atlas.drawCentered(batch, keys.tower(fams[i]), x + 27, 16 + 32, 30, 50, worldTime());
            batch.setColor(Color.WHITE);
            ui.textCenteredInBox(String.valueOf(cost), x, 16, 54, 24,
                    afford ? UiChrome.GOLD : UiChrome.INK_DIM, UiChrome.BODY, 1);
        }
        ui.textLeftInBox(get("hud.build", selectedTower().faction.displayName), W - 262, 72, 254, 32,
                UiChrome.GOLD, UiChrome.BODY, 1);
    }

    /** Bottom-centre plate for the selected tower: stats, upgrade branches and sell. */
    private void drawTowerPanel() {
        float px = W / 2f - 290, py = 8, pw = 580, ph = 64;
        ui.panel(px, py, pw, ph);
        TowerType t = selectedTowerRef.type;
        ui.textLeftInBox(prettyTower(t), px, py + 32, 226, 32,
                UiChrome.GOLD, UiChrome.SMALL, 1);
        ui.textLeftInBox(get("tower.stats", t.tier, t.sustainedSingleTargetDps(),
                        t.crowdDpsPotential(), (int) t.range),
                px, py, 226, 32, UiChrome.INK, UiChrome.SMALL, 1);
        java.util.List<TowerType> ups = t.upgrades();
        for (int i = 0; i < Math.min(2, ups.size()); i++) {
            float bx = px + 236 + i * 118;
            TowerType up = ups.get(i);
            int cost = world.skills.upgradeCost(up);
            boolean afford = devMode || world.gold >= cost;
            ui.button(bx, py + 8, 110, 48, "");
            atlas.drawCentered(batch, keys.tower(up), bx + 22, py + 32, 22, 40, worldTime());
            ui.icon("icon_upgrade_arrow", bx + 42, py + 26, UiChrome.ICON);
            ui.textCenteredInBox(String.valueOf(cost), bx + 59, py + 32, 50, 24,
                    afford ? UiChrome.GOLD : UiChrome.INK_DIM, UiChrome.BODY, 1);
            ui.textCenteredInBox(get("tower.tier", up.tier), bx + 59, py + 8, 50, 24,
                    UiChrome.INK_DIM, UiChrome.BODY, 1);
        }
        if (ups.isEmpty()) ui.textCenteredInBox(get("tower.max"), px + 226, py + 8, 246, 48,
                UiChrome.INK_DIM, UiChrome.BODY, 1);
        ui.button(px + pw - 96, py + 8, 84, 48, "+" + t.sellValue());
        ui.icon("icon_sell_coin", px + pw - 92, py + 40, UiChrome.ICON);
    }

    /** Victory/defeat overlay: stars for gems held, campaign progress already banked. */
    private void drawResultOverlay() {
        batch.setColor(0f, 0f, 0f, 0.62f);
        batch.draw(white, 0, 0, W, H);
        batch.setColor(Color.WHITE);
        boolean won = levelResult == 1;
        ui.panel(W / 2f - 240, 210, 480, 300);
        ui.banner(get(won ? "result.victory" : "result.defeat"), W / 2f, 512, 360);
        int kept = remainingGems(), total = Math.max(1, world.gems.size());
        int stars = won ? world.starRating() : 0;
        for (int i = 0; i < 3; i++) {
            String star = i < stars ? "icon_star_filled" : "icon_star_locked";
            ui.icon(star, W / 2f - 66 + i * 44, 400, UiChrome.ICON);
        }
        if (won) {
            ui.textCenteredInBox(get("result.gems", kept, total), W / 2f - 240, 344, 480, 44,
                    UiChrome.INK, UiChrome.BODY, 1);
            ui.textCenteredInBox(get("result.points", lastSkillPointAward), W / 2f - 240, 316, 480, 36,
                    UiChrome.GOLD, UiChrome.BODY, 1);
        } else {
            ui.textCenteredInBox(get("result.lost"), W / 2f - 240, 344, 480, 44,
                    UiChrome.INK, UiChrome.BODY, 1);
        }
        ui.button(W / 2f - 110, 246, 220, 54, get(won ? "result.continue" : "result.retreat"));
    }

    // ───────────────────────────── render: almanac ─────────────────────────────

    private static final String[] EFFECT_KEYS = {
        "enchant_meteor", "enchant_fear", "enchant_freeze", "enchant_gem_ward",
        "enchant_cursed_tribute", "enchant_dark_overcharge",
        "fx_support_aura", "fx_ally_shield", "fx_summon_cast", "fx_heal_glow", "fx_burn", "fx_freeze",
        "fx_stun_overlay", "fx_banner_pulse", "fx_taunt_pulse", "fx_rally", "fx_reflect_flash",
        "fx_blood_frenzy", "fx_sing_notes", "fx_cleanse_flash", "fx_ascension_pillar", "fx_vanish",
        "fx_phase_flicker", "fx_sandstorm", "fx_death_blast", "fx_absorb_heal", "fx_mutual_heal",
        "fx_steam_shield", "fx_shield_bubble", "fx_resurrect", "fx_death_leech", "fx_blink_gem",
        "fx_gold_steal", "fx_darkness_cloud", "fx_orbiting_charge", "fx_ground_fire", "fx_ember_shimmer",
    };

    /** Lays out the current view's clickable picture cells ({payload, cx, cy}) + content height. */
    private void buildAlmanacCells() {
        almCells.clear();
        float top = GRID_Y + GRID_H - 84;   // content origin (first row centre, inset below panel top)
        if (almanacTab == 1) {              // towers: faction → tier rows (the upgrade tree), centred
            Faction f = Faction.values()[clamp(almanacSub, 0, Faction.values().length - 1)];
            int rowIndex = 0;
            for (int tier = 1; tier <= 6; tier++) {
                List<TowerType> row = new ArrayList<>();
                for (TowerType t : TowerType.values()) {
                    if (t.faction == f && t.tier == tier) row.add(t);
                }
                if (row.isEmpty()) continue;
                float spacing = 130f;
                float startX = GRID_X + GRID_W / 2f - (row.size() - 1) * spacing / 2f;
                float cy = top - rowIndex * 108 + almanacScrollY;
                for (int j = 0; j < row.size(); j++) {
                    almCells.add(new float[] {row.get(j).ordinal(), startX + j * spacing, cy});
                }
                rowIndex++;
            }
            almContentH = rowIndex * 108;
        } else if (almanacTab == 0) {       // troops: chosen world → wrapped grid
            int w = clamp(almanacSub, 0, 4);
            int s = WORLD_TROOP_START[w], e = WORLD_TROOP_START[w + 1], cols = 5;
            for (int k = 0; k < e - s; k++) {
                float cx = GRID_X + 100 + (k % cols) * 158;     // wide enough that names don't collide
                float cy = top - (k / cols) * 116 + almanacScrollY;
                almCells.add(new float[] {s + k, cx, cy});
            }
            almContentH = (int) Math.ceil((e - s) / (float) cols) * 116;
        } else {                            // effects: wrapped grid
            int cols = 6;
            for (int k = 0; k < EFFECT_KEYS.length; k++) {
                float cx = GRID_X + 90 + (k % cols) * 132;
                float cy = top - (k / cols) * 112 + almanacScrollY;
                almCells.add(new float[] {k, cx, cy});
            }
            almContentH = (int) Math.ceil(EFFECT_KEYS.length / (float) cols) * 112;
        }
    }

    private void renderAlmanac() {
        batch.begin();
        bg("bg_almanac");
        // banner centred over the open right-hand space so it never overlaps the left-aligned tabs
        ui.banner(get("menu.almanac"), 860, H - 18, 300);
        if (ui.chip("close", W - 64, H - 64, 44) && Gdx.input.justTouched()) state = ScreenState.MAIN_MENU;

        // main tabs
        for (int i = 0; i < 3; i++) {
            boolean on = almanacTab == i;
            ui.button(40 + i * 150, 640, 140, 44, GameStrings.almanacTab(i));
            if (on) ui.icon("icon_star_filled", 40 + i * 150 + 8, 666, UiChrome.ICON);
        }
        // sub-tabs
        int subs = almanacSubCount();
        for (int i = 0; i < subs; i++) {
            String lbl = almanacTab == 1 ? Faction.values()[i].displayName : "World " + (i + 1);
            ui.button(40 + i * 120, 590, 112, 38, lbl);
            if (almanacSub == i) ui.icon("icon_star", 40 + i * 120 + 6, 612, UiChrome.ICON);
        }

        // panels
        ui.panel(GRID_X, GRID_Y, GRID_W, GRID_H);
        ui.panel(DET_X, DET_Y, DET_W, DET_H);

        // scroll clamp + cells
        buildAlmanacCells();
        float maxScroll = Math.max(0f, almContentH - (GRID_H - 130f));
        almanacScrollY = clampf(almanacScrollY, 0f, maxScroll);
        buildAlmanacCells();

        // upgrade-tree connector trunk behind the tower cells
        if (almanacTab == 1 && !almCells.isEmpty()) {
            float minCy = GRID_Y + GRID_H, maxCy = GRID_Y;
            for (float[] c : almCells) { minCy = Math.min(minCy, c[2]); maxCy = Math.max(maxCy, c[2]); }
            float lo = Math.max(GRID_Y + 36, minCy), hi = Math.min(GRID_Y + GRID_H - 36, maxCy);
            float tx = GRID_X + GRID_W / 2f;
            batch.setColor(0.55f, 0.46f, 0.24f, 0.5f);
            if (hi > lo) batch.draw(white, tx - 1.5f, lo, 3f, hi - lo);     // vertical spine
            for (float[] c : almCells) {                                    // horizontal stubs
                if (c[2] < GRID_Y + 34 || c[2] > GRID_Y + GRID_H - 34) continue;
                float x0 = Math.min(tx, c[1]), x1 = Math.max(tx, c[1]);
                batch.draw(white, x0, c[2] - 1.5f, x1 - x0, 3f);
            }
            batch.setColor(Color.WHITE);
        }

        for (float[] c : almCells) {
            int payload = (int) c[0];
            float cx = c[1], cy = c[2];
            if (cy < GRID_Y + 56 || cy > GRID_Y + GRID_H - 56) continue;
            boolean sel = payload == almanacIndex;
            drawAlmanacCell(payload, cx, cy, sel);
        }
        // scroll hint
        if (maxScroll > 0) ui.textCenteredInBox(get("common.scroll"), GRID_X + GRID_W - 124,
                GRID_Y, 124, 40, UiChrome.INK_DIM, UiChrome.BODY, 1);

        renderAlmanacDetail();
        ui.button(40, 40, 130, 48, get("common.back"));
        batch.end();
    }

    private void drawAlmanacCell(int payload, float cx, float cy, boolean sel) {
        if (sel) ui.panelGold(cx - 50, cy - 52, 100, 104);
        else ui.panel(cx - 50, cy - 52, 100, 104);
        if (almanacTab == 1) {
            TowerType t = TowerType.values()[payload];
            atlas.drawCentered(batch, keys.tower(t), cx, cy + 7, 44, 76, worldTime());
            ui.textCenteredInBox(shortName(prettyTower(t)), cx - 50, cy - 52, 100, 24,
                    sel ? UiChrome.GOLD : UiChrome.INK_DIM, UiChrome.SMALL, 1);
        } else if (almanacTab == 0) {
            HeroType h = HeroType.values()[payload];
            float s = h.boss ? 58 : 50;
            atlas.drawCentered(batch, keys.troop(h, "idle"), cx, cy + 4, s, s, stateTime * 3 + payload);
            ui.textCenteredInBox(shortName(h.name), cx - 50, cy - 52, 100, 24,
                    sel ? UiChrome.GOLD : UiChrome.INK, UiChrome.SMALL, 1);
        } else {
            atlas.drawCentered(batch, EFFECT_KEYS[payload], cx, cy + 5, 62, 62, stateTime * 1.5f);
            ui.textCenteredInBox(shortName(prettyEffect(EFFECT_KEYS[payload])), cx - 50, cy - 52, 100, 24,
                    sel ? UiChrome.GOLD : UiChrome.INK_DIM, UiChrome.SMALL, 1);
        }
    }

    private String shortName(String n) {
        return n.length() <= 11 ? n : n.substring(0, 10) + ".";
    }

    private void renderAlmanacDetail() {
        float dx = DET_X + 26, top = DET_Y + DET_H - 36;
        float mid = DET_X + DET_W / 2f;
        if (almanacTab == 1) {
            TowerType t = TowerType.values()[clamp(almanacIndex, 0, TowerType.values().length - 1)];
            AlmanacDescriptions.Entry copy = AlmanacDescriptions.tower(t);
            ui.textCenteredBounded(prettyTower(t), mid, top, DET_W - 52,
                    UiChrome.GOLD, UiChrome.BODY, 1);
            atlas.drawCentered(batch, keys.tower(t), mid, 424, 92, 158, worldTime());
            atlas.drawCentered(batch, keys.projectile(t), mid + 88, 480, 32, 32, stateTime * 3);
            float ty = 330;
            ui.textLeftInBox(get("almanac.tower_heading", t.faction.displayName, t.tier),
                    DET_X + 14, 300, DET_W - 28, 44, UiChrome.INK, UiChrome.BODY, 1);
            ui.icon(keys.damageIcon(t.damageType), dx, ty - 40, UiChrome.ICON);
            ui.textLeftInBox(t.damageType.name() + " / " + t.pattern,
                    dx + 22, 284, DET_W - 74, 32, UiChrome.INK, UiChrome.BODY, 1);
            ui.textLeftInBox(get("almanac.damage_range", (int) t.damage,
                            t.sustainedSingleTargetDps(), (int) t.range),
                    DET_X + 14, 242, DET_W - 28, 32, UiChrome.INK, UiChrome.BODY, 1);
            ui.icon("icon_speed", dx, ty - 104, UiChrome.ICON);
            ui.textLeftInBox(get("almanac.crowd_dps", t.crowdDpsPotential()),
                    dx + 22, 220, DET_W - 74, 32, UiChrome.INK, UiChrome.BODY, 1);
            ui.icon("icon_gold", dx, ty - 140, UiChrome.ICON);
            ui.textLeftInBox(get("almanac.cost", t.cost), dx + 20, 184, 120, 32,
                    UiChrome.INK, UiChrome.BODY, 1);
            ui.icon("icon_sell_coin", dx + 130, ty - 140, UiChrome.ICON);
            ui.textLeftInBox(get("almanac.sell", t.sellValue()), dx + 150, 184, 150, 32,
                    UiChrome.INK, UiChrome.BODY, 1);
            drawAlmanacCopy(copy, dx, 176);
        } else if (almanacTab == 0) {
            HeroType h = HeroType.values()[clamp(almanacIndex, 0, HeroType.values().length - 1)];
            AlmanacDescriptions.Entry copy = AlmanacDescriptions.hero(h);
            ui.textCenteredBounded(h.name, mid, top, DET_W - 52, UiChrome.GOLD, UiChrome.BODY, 1);
            List<String> states = keys.troopStates(h);
            String stateKey = states.get((int) (stateTime / 1.6f) % states.size());
            atlas.drawCentered(batch, stateKey, mid, 430, 104, 104, stateTime * 4);
            ui.textCenteredBounded(stateKey.substring(stateKey.lastIndexOf('_') + 1).toUpperCase(),
                    mid, 366, DET_W - 52, UiChrome.INK_DIM, UiChrome.SMALL, 1);
            float ty = 334;
            ui.textBounded(get("almanac.health_speed", h.maxHp, h.speed), dx, ty, DET_W - 52,
                    UiChrome.INK, UiChrome.BODY, 1);
            ui.textBounded(get("almanac.reward", h.goldReward), dx, ty - 28, DET_W - 52,
                    UiChrome.INK, UiChrome.BODY, 1);
            ui.textBounded(get("almanac.resistance", h.physBand, h.cryptBand), dx, ty - 56, DET_W - 52,
                    UiChrome.INK, UiChrome.BODY, 1);
            String flags = (h.boss ? "BOSS " : "") + (h.champion ? "CHAMPION " : "")
                    + (h.flying ? "FLYER " : "") + (h.mechanical ? "MECHANICAL" : "");
            if (!flags.isEmpty()) ui.textBounded(flags.trim(), dx, ty - 84, DET_W - 52,
                    UiChrome.GOLD, UiChrome.BODY, 1);
            drawAlmanacCopy(copy, dx, 210);
        } else {
            String key = EFFECT_KEYS[clamp(almanacIndex, 0, EFFECT_KEYS.length - 1)];
            AlmanacDescriptions.Entry copy = AlmanacDescriptions.effect(key);
            ui.textCenteredBounded(prettyEffect(key), mid, top, DET_W - 52,
                    UiChrome.GOLD, UiChrome.BODY, 1);
            atlas.drawCentered(batch, key, mid, 420, 132, 132, stateTime * 1.5f);
            drawAlmanacCopy(copy, dx, 328);
            if (key.startsWith("enchant_")) {
                ui.icon(key.replace("enchant_", "icon_"), dx, 190, UiChrome.ICON);
                ui.textBounded(get("almanac.equippable"), dx + 42, 212, DET_W - 94,
                        UiChrome.INK, UiChrome.SMALL, 1);
                EnchantType selected = EnchantType.values()[almanacIndex];
                for (int slot = 0; slot < EnchantLoadout.SLOT_COUNT; slot++) {
                    float x = DET_X + 24 + slot * 150;
                    boolean equipped = enchantLoadout.get(slot) == selected;
                    if (equipped) ui.panelGold(x, 128, 132, 42);
                    ui.button(x, 128, 132, 42, "SLOT " + (slot + 1));
                    if (equipped) ui.icon("icon_star_filled", x + 8, 141, UiChrome.ICON);
                }
            } else {
                ui.textBounded(get("almanac.area"), dx, 204, DET_W - 52,
                        UiChrome.INK_DIM, UiChrome.SMALL, 1);
            }
        }
    }

    private void drawAlmanacCopy(AlmanacDescriptions.Entry copy, float x, float top) {
        float width = DET_W - 52;
        int abilityLines = ui.wrappedLineCount(copy.ability, width, UiChrome.SMALL, 2);
        float boxX = x - UiChrome.TEXT_PAD_X;
        float boxWidth = width + 2 * UiChrome.TEXT_PAD_X;
        float abilityBoxHeight = abilityLines * UiChrome.LINE + 2 * UiChrome.TEXT_PAD_Y;
        float abilityBoxY = top - abilityLines * UiChrome.LINE - UiChrome.TEXT_PAD_Y;
        ui.textWrappedInBox(copy.ability, boxX, abilityBoxY, boxWidth, abilityBoxHeight,
                UiChrome.INK, UiChrome.SMALL);
        float flavorTop = top - abilityLines * UiChrome.LINE - 4;
        ui.textLeftInBox(copy.flavor, boxX, flavorTop - 16, boxWidth, 24,
                UiChrome.INK_DIM, 1, 1);
    }

    private String prettyTower(TowerType t) {
        return t.name().charAt(0) + t.name().substring(1).toLowerCase().replace('_', ' ');
    }

    private String prettyEffect(String key) {
        return key.replace("fx_", "").replace("enchant_", "").replace('_', ' ').toUpperCase();
    }

    private int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    private float clampf(float v, float lo, float hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    // ───────────────────────────── render: skills & settings ─────────────────────────────

    // per-faction skill node icons (see redesign/instructions for claude design/SKILL_ICONS.md, D-14)
    private static final String[][] SKILL_ICONS = {
        {"icon_gold", "icon_sell_coin", "icon_physical", "icon_star", "icon_upgrade_arrow",
         "icon_stunned", "icon_armor", "icon_range", "icon_speed", "icon_cursed_tribute"},
        {"icon_mana", "icon_magic", "icon_gem", "icon_feared", "icon_fear",
         "icon_curse", "icon_lightning", "icon_upgrade_arrow", "icon_frost", "icon_freeze"},
        {"icon_gold", "icon_gem", "icon_meteor", "icon_mana", "icon_speed",
         "icon_upgrade_arrow", "icon_fire", "icon_burning", "icon_slowed", "icon_cursed"},
        {"icon_gold", "icon_upgrade_arrow", "icon_armor", "icon_wave", "icon_sell_coin",
         "icon_range", "icon_stunned", "icon_physical", "icon_gem_ward", "icon_dark_overcharge"},
    };
    private void renderSkillTree() {
        batch.begin();
        bg("bg_menu");
        ui.banner(get("menu.skills"), W / 2f, H - 24, 400);
        ui.capsule(W - 238, H - 68, 198, 38, "icon_star", "POINTS " + skillPoints);
        ui.button(W - 180, 40, 130, 48, get("common.reset"));

        for (int fac = 0; fac < 4; fac++) {
            float x = 180 + fac * 230;
            ui.button(x, 568, 210, 44, GameStrings.skillFaction(fac));
            if (selectedSkillFaction == fac)
                ui.icon("icon_star_filled", x + 8, 579, UiChrome.ICON);
        }
        ui.panel(112, 104, 1056, 444);
        for (int skill = 0; skill < 10; skill++) {
            int col = skill / 5, row = skill % 5;
            float x = 130 + col * 520, y = 496 - row * 86;
            int idx = selectedSkillFaction * 10 + skill;
            if (skillTooltipIdx == idx) ui.panelGold(x, y, 500, 72);
            else ui.panel(x, y, 500, 72);
            atlas.drawCentered(batch, SKILL_ICONS[selectedSkillFaction][skill], x + 42, y + 38,
                    42, 42, 0f);
            ui.textLeftInBox(GameStrings.skillName(selectedSkillFaction, skill), x + 66, y + 40,
                    418, 32, UiChrome.GOLD, UiChrome.BODY, 1);
            ui.textLeftInBox(GameStrings.skillDescription(selectedSkillFaction, skill), x + 66, y + 24,
                    418, 24, UiChrome.INK_DIM, UiChrome.SMALL, 1);
            for (int p = 0; p < 5; p++) {
                String nk = p < spentSkills[idx] ? "ui_node_mastered"
                        : (p == spentSkills[idx] ? "ui_node_available" : "ui_node_locked");
                atlas.draw(batch, nk, x + 78 + p * 28, y + 8, 16, 16, 0f);
            }
        }
        // Detail stays between the corner commands, never underneath either button.
        if (skillTooltipIdx >= 0) {
            int fac = skillTooltipIdx / 10, skill = skillTooltipIdx % 10;
            ui.panelGold(W / 2f - 430, 18, 860, 68);
            ui.icon(SKILL_ICONS[fac][skill], W / 2f - 408, 36, UiChrome.ICON);
            ui.textBounded(get("skill.progress", GameStrings.skillName(fac, skill), spentSkills[skillTooltipIdx]),
                    W / 2f - 364, 70, 770, UiChrome.GOLD, UiChrome.SMALL, 1);
            ui.textBounded(GameStrings.skillDescription(fac, skill), W / 2f - 364, 44,
                    770, UiChrome.INK, UiChrome.SMALL, 1);
        }
        ui.button(40, 40, 130, 48, get("common.back"));
        batch.end();
    }

    private void renderMapBuilder() {
        batch.begin();
        bg("bg_settings");
        mapBuilder.render();
        batch.end();
    }

    private void handleMapBuilderInput(Vector2 m) {
        if (Gdx.input.isKeyJustPressed(Input.Keys.ESCAPE)) { state = ScreenState.SETTINGS; return; }
        boolean ctrl = Gdx.input.isKeyPressed(Input.Keys.CONTROL_LEFT) || Gdx.input.isKeyPressed(Input.Keys.CONTROL_RIGHT);
        boolean shift = Gdx.input.isKeyPressed(Input.Keys.SHIFT_LEFT) || Gdx.input.isKeyPressed(Input.Keys.SHIFT_RIGHT);
        if (ctrl && Gdx.input.isKeyJustPressed(Input.Keys.Z)) { if (shift) mapBuilder.redo(); else mapBuilder.undo(); }
        if (ctrl && Gdx.input.isKeyJustPressed(Input.Keys.Y)) mapBuilder.redo();
        if (!ctrl && Gdx.input.isKeyJustPressed(Input.Keys.R)) mapBuilder.cycleRotation();
        mapBuilder.update(m.x, m.y, Gdx.input.justTouched(), Gdx.input.isTouched(), scrollAccum);
        if (mapBuilder.wantsExit()) { mapBuilder.clearExit(); state = ScreenState.SETTINGS; }
    }

    private void renderSettings() {
        batch.begin();
        bg("bg_settings");
        ui.banner(get("menu.settings"), W / 2f, H - 24, 420);
        ui.button(40, 40, 130, 48, get("common.back"));
        // Keep this command in the clear strip below the audio panel (which begins at y=68).
        ui.button(W - 230, 10, 190, 48, get("settings.map_builder"));
        ui.button(W / 2f - 130, 364, 260, 54, get("settings.reset_progress"));
        ui.button(W / 2f - 130, 296, 260, 54, get("settings.world_map", activeMap + 1));
        ui.button(W / 2f - 130, 228, 260, 54,
                get("settings.maps_only", get(mapsOnlyMode ? "state.on" : "state.off")));
        ui.button(W / 2f - 130, 160, 260, 54,
                get("settings.dev", get(devMode ? "state.on" : "state.off")));
        ui.button(W / 2f - 130, 92, 260, 54,
                get("settings.speed", get(speed2xTapMode ? "state.tap" : "state.hold")));
        batch.draw(worldMap.map(activeMap), W / 2f + 160, 290, 144, 96);
        ui.panel(W / 2f - 320, 440, 640, 184);
        float tx = W / 2f - 292;
        float controlsWidth = 584;
        ui.textBounded(get("settings.controls"), tx, 600, controlsWidth, UiChrome.GOLD, UiChrome.SMALL, 1);
        ui.textBounded(get("settings.control_click"), tx, 576, controlsWidth, UiChrome.INK, UiChrome.SMALL, 1);
        ui.textBounded(get("settings.control_keys"), tx, 554, controlsWidth, UiChrome.INK, UiChrome.SMALL, 1);
        ui.textBounded(get("settings.control_spells"), tx, 532, controlsWidth, UiChrome.INK, UiChrome.SMALL, 1);
        ui.textBounded(get("settings.control_speed"), tx, 510, controlsWidth, UiChrome.INK, UiChrome.SMALL, 1);
        ui.textBounded(get("settings.modes"), tx, 488, controlsWidth, UiChrome.INK_DIM, UiChrome.SMALL, 1);
        ui.textBounded(get("settings.theme"), tx, 466, controlsWidth, UiChrome.INK_DIM, UiChrome.SMALL, 1);
        ui.panel(830, 68, 390, 216);
        ui.textLeftInBox(get("audio.title"), 838, 244, 374, 32,
                UiChrome.GOLD, UiChrome.SMALL, 1);
        drawAudioRow(get("audio.master"), audio.masterVolume(), 204);
        drawAudioRow(get("audio.music"), audio.musicVolume(), 164);
        drawAudioRow(get("audio.sfx"), audio.sfxVolume(), 124);
        ui.button(850, 80, 160, 34, get(audio.isMuted() ? "audio.unmute" : "audio.mute"));
        batch.end();
    }

    private void drawAudioRow(String label, float value, float y) {
        ui.textLeftInBox(get("audio.row", label, Math.round(value * 100f)), 838, y, 260, 32,
                UiChrome.INK, UiChrome.SMALL, 1);
        ui.button(1110, y, 40, 32, "-");
        ui.button(1160, y, 40, 32, "+");
    }

    /** Activates the next first-run prompt only when its game-state event actually occurs. */
    private void triggerTutorial(int requiredStage) {
        if (selectedWorldIndex == 0 && selectedLevelIndex == 0
                && tutorialStage == requiredStage && !tutorialPromptActive
                && !prefs.getBoolean("tutorialSeen", false)) {
            tutorialPromptActive = true;
        }
    }

    // ───────────────────────────── helpers ─────────────────────────────

    private void bg(String key) {
        if (atlas.has(key)) atlas.draw(batch, key, 0, 0, W, H, stateTime);
        else { batch.end(); ScreenUtils.clear(0.06f, 0.04f, 0.10f, 1f); batch.begin(); }
    }

    private Color screenAccent() {
        if (state == ScreenState.WORLD_SELECT) {
            int hoveredWorld = worldAtPointer(pointer());
            if (hoveredWorld >= 0) return UiTheme.worldAccent(hoveredWorld);
        }
        if (state == ScreenState.LEVEL_SELECT || state == ScreenState.GAME) {
            return UiTheme.worldAccent(selectedWorldIndex);
        }
        return UiTheme.GOLD;
    }

    private int effectiveMaxLevelReached() {
        return devMode ? 25 : maxLevelReached;
    }

    private void applyDevModeIfEnabled() {
        if (!devMode) return;
        maxLevelReached = 25;
        skillPoints = 999;
        for (int i = 0; i < spentSkills.length; i++) {
            spentSkills[i] = 5;
        }
    }

    private void applyInfiniteResources() {
        if (world == null) return;
        world.gold = 999999;
        world.maxMana = 999999;
        world.mana = world.maxMana;
    }

    private int remainingGems() {
        int count = 0;
        for (Gem gem : world.gems) if (gem.state != Gem.State.LOST) count++;
        return count;
    }

    private TowerType selectedTower() {
        switch (selectedFamily) {
            case 1: return TowerType.CRYPT;
            case 2: return TowerType.IMP_BRAZIER;
            case 3: return TowerType.GOBLIN_WORKSHOP;
            default: return TowerType.ORC_WATCHPOST;
        }
    }

    private float worldTime() {
        return world == null ? 0f : world.waveSpawner.waveIndex() * 2f + Gdx.graphics.getFrameId() / 60f;
    }

    private void startNextWave() {
        if (world == null || world.waveSpawner.waveIndex() >= wavesTotal) return;
        if (intermission > 0f) world.gold += (int) (intermission * 2f);   // early-call bounty
        intermission = 0f;
        Wave wave = io.github.some_example_name.game.WavePlan
                .wave(selectedWorldIndex, selectedLevelIndex, world.waveSpawner.waveIndex());
        world.waveSpawner.start(wave);
        audio.play(Sfx.WAVE_START);
    }

    private Vector2 worldToScreen(Vector2 worldPos) {
        return new Vector2(MAP_X + worldPos.x * SCALE, MAP_Y + worldPos.y * SCALE);
    }

    private Vector2 worldToScreen(float wx, float wy) {
        return new Vector2(MAP_X + wx * SCALE, MAP_Y + wy * SCALE);
    }

    private Vector2 screenToWorld(Vector2 logical) {
        return new Vector2((logical.x - MAP_X) / SCALE, (logical.y - MAP_Y) / SCALE);
    }

    @Override
    public void dispose() {
        audio.dispose();
        if (menuReliquary != null) menuReliquary.dispose();
        white.dispose();
        batch.dispose();
        font.dispose();
        atlas.dispose();
        worldMap.dispose();
    }
}
