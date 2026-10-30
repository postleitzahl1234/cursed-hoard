package io.github.some_example_name;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import io.github.some_example_name.assets.PixelArtAtlas;
import io.github.some_example_name.assets.UiChrome;
import io.github.some_example_name.game.MapBlueprint;
import io.github.some_example_name.game.GameStrings;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * In-game hand-painting map editor on the shared {@link MapBlueprint} (32×30). Paint any terrain
 * tile, scatter obstacles/buildings, lay the path and drop the cave/spawn markers, then save to a
 * round-trippable {@code .map} text file under {@code custom_maps/}. Pure draw + input; the host
 * ({@code CursedHoardGame}) feeds the pointer and owns {@code batch.begin()/end()}.
 */
public final class MapBuilderScreen {
    private final PixelArtAtlas atlas;
    private final UiChrome ui;
    private final SpriteBatch batch;
    private final Texture white;

    // grid geometry (logical, y-up; row 0 = top of the map)
    private static final float GX = 24, GY = 24, CELL = 20;
    // palette panel
    private static final float PX = 680, PY = 24, PW = 584, PH = 600;

    private MapBlueprint bp = new MapBlueprint();
    private final Deque<MapBlueprint> undo = new ArrayDeque<>();
    private final Deque<MapBlueprint> redo = new ArrayDeque<>();

    private static final String[] CATS = {"TERRAIN", "OBSTACLE", "BUILDING", "PATH", "CAVE", "SPAWN", "ERASE"};
    private int cat = 0;
    private final List<String> terrainKeys = new ArrayList<>();
    private final List<String> obstacleKeys = new ArrayList<>();
    private final List<String> buildingKeys = new ArrayList<>();
    private String brushKey = "tile_grass_base";   // selected palette item (terrain/obstacle/building)
    private int brushRot;                          // 0..3 → terrain paint rotation (R cycles it)
    private float scroll;
    private boolean exit;
    private String status = "Paint terrain, obstacles, buildings; lay PATH; drop CAVE + SPAWN; SAVE.";
    private boolean stroke;     // a paint stroke is in progress (one undo snapshot per stroke)

    public MapBuilderScreen(PixelArtAtlas atlas, UiChrome ui, SpriteBatch batch, Texture white) {
        this.atlas = atlas;
        this.ui = ui;
        this.batch = batch;
        this.white = white;
        for (String k : sorted(atlas)) {
            if (k.startsWith("tile_")) terrainKeys.add(k);
            else if (k.startsWith("obstacle_")) obstacleKeys.add(k);
            else if (k.startsWith("bld_")) buildingKeys.add(k);
        }
    }

    private static List<String> sorted(PixelArtAtlas atlas) {
        List<String> l = new ArrayList<>(atlas.keySet());
        java.util.Collections.sort(l);
        return l;
    }

    public boolean wantsExit() { return exit; }
    public void clearExit() { exit = false; }

    /** Cycle the terrain paint rotation 0→90→180→270°. */
    public void cycleRotation() {
        brushRot = (brushRot + 1) % 4;
        status = "Terrain rotation " + (brushRot * 90) + " deg (paint to apply)";
    }

    /** Seed a few sprites to demo the 2×2 footprint rules (used by the screenshot harness). */
    public void demo() {
        io.github.some_example_name.game.TerrainGenerator.generate(bp, 42L);
        // spaced buildings (≥2 apart) — all should place
        String[] bld = {"bld_grass_village", "bld_grass_castle", "bld_mountain_tavern", "bld_garden_laboratory"};
        int[][] bp2 = {{3, 3}, {7, 3}, {3, 7}, {9, 8}};
        for (int i = 0; i < bld.length; i++) if (canPlaceBuilding(bp2[i][0], bp2[i][1])) bp.decor[bp2[i][0]][bp2[i][1]] = bld[i];
        // a tight cluster of overlapping trees (2×2, allowed to intersect) — tests trunk/canopy order
        String[] sp = {"obstacle_tree_oak", "obstacle_tree_pine", "obstacle_tree_birch"};
        for (int i = 0; i < 6; i++)
            bp.decor[17 + (i % 3)][6 + (i / 3)] = sp[i % 3];
        bp.decor[24][10] = "obstacle_tree_palm";
        // path + endpoints
        int mr = MapBlueprint.MID_R;
        for (int c = 2; c < COLS() - 2; c++) { bp.overlay[c][mr] = MapBlueprint.Overlay.PATH; bp.terrain[c][mr] = "tile_grass_path"; }
        bp.overlay[2][mr] = MapBlueprint.Overlay.SPAWN;
        bp.overlay[COLS() - 3][mr] = MapBlueprint.Overlay.CAVE;
        // a plain tile shown in all four rotations (rotation still exists to break up tiling;
        // it is no longer used to point a hand-authored transition at a neighbour — D-19 does that)
        String dir = "tile_grass_fern";
        bp.terrain[24][16] = dir; bp.terrainRot[24][16] = 0;
        bp.terrain[25][16] = dir; bp.terrainRot[25][16] = 1;
        bp.terrain[24][17] = dir; bp.terrainRot[24][17] = 2;
        bp.terrain[25][17] = dir; bp.terrainRot[25][17] = 3;
    }

    private List<String> palette() {
        switch (cat) {
            case 0: return terrainKeys;
            case 1: return obstacleKeys;
            case 2: return buildingKeys;
            default: return java.util.Collections.emptyList();
        }
    }

    // ── input ────────────────────────────────────────────────────────────────

    /** Called every frame: paint on drag, route clicks to palette/toolbar, apply wheel scroll. */
    public void update(float mx, float my, boolean justTouched, boolean down, float scrollDelta) {
        if (scrollDelta != 0 && mx > PX) scroll = Math.max(0, scroll - scrollDelta * 60f);

        boolean overGrid = mx >= GX && mx < GX + COLS() * CELL && my >= GY && my < GY + ROWS() * CELL;
        if (justTouched) {
            if (!overGrid && handleUi(mx, my)) return;
            if (overGrid) { snapshot(); stroke = true; paintAt(mx, my); }
        } else if (down && stroke && overGrid) {
            paintAt(mx, my);
        }
        if (!down) stroke = false;
    }

    private int COLS() { return MapBlueprint.COLS; }
    private int ROWS() { return MapBlueprint.ROWS; }

    private static final String[] TOOLBAR = {"NEW", "GEN", "FILL", "SAVE", "LOAD", "BACK"};

    private boolean handleUi(float mx, float my) {
        // toolbar
        for (int i = 0; i < TOOLBAR.length; i++)
            if (hit(mx, my, GX + i * 110, 636, 102, 40)) { toolbar(i); return true; }
        // category tabs (2 rows of 4)
        for (int i = 0; i < CATS.length; i++) {
            float tx = PX + (i % 4) * 146, ty = PY + PH - 44 - (i / 4) * 46;
            if (hit(mx, my, tx, ty, 140, 40)) { cat = i; scroll = 0; return true; }
        }
        // palette items
        List<String> pal = palette();
        if (!pal.isEmpty()) {
            int idx = paletteHit(mx, my);
            if (idx >= 0 && idx < pal.size()) { brushKey = pal.get(idx); return true; }
        }
        return false;
    }

    private void toolbar(int i) {
        switch (i) {
            case 0: snapshot(); bp = new MapBlueprint(); status = "New blank map."; break;
            case 1: {   // GEN: random non-water terrain, biomes as large masses (overlay/decor kept)
                snapshot();
                long seed = System.nanoTime();
                io.github.some_example_name.game.TerrainGenerator.generate(bp, seed);
                status = "Generated terrain (seed " + (seed % 100000) + ") - water stays hand-painted.";
                break;
            }
            case 2: snapshot(); if (cat == 0) bp.fill(brushKey); status = "Filled with " + brushKey; break;
            case 3: save(); break;
            case 4: load(); break;
            case 5: exit = true; break;
            default: break;
        }
    }

    private void paintAt(float mx, float my) {
        int c = (int) ((mx - GX) / CELL);
        int r = ROWS() - 1 - (int) ((my - GY) / CELL);   // y-up → row 0 at top
        if (!MapBlueprint.inBounds(c, r)) return;
        switch (cat) {
            case 0: bp.terrain[c][r] = brushKey; bp.terrainRot[c][r] = brushRot; break;   // TERRAIN (1×1, rotatable)
            case 1: {                                                         // OBSTACLE (2×2, may overlap)
                int oc = Math.min(c, COLS() - 2), or = Math.min(r, ROWS() - 2);
                bp.decor[oc][or] = brushKey; break;
            }
            case 2: if (canPlaceBuilding(c, r)) bp.decor[c][r] = brushKey; break;  // BUILDING (2×2, ≥2 apart)
            case 3: bp.overlay[c][r] = MapBlueprint.Overlay.PATH;             // PATH
                    bp.terrain[c][r] = pathTileFor(bp.terrain[c][r]); break;
            case 4: bp.overlay[c][r] = MapBlueprint.Overlay.CAVE; break;      // CAVE
            case 5: bp.overlay[c][r] = MapBlueprint.Overlay.SPAWN; break;     // SPAWN
            case 6:                                                           // ERASE (clear covering anchor)
                // buildings cover BLD_W×BLD_H, obstacles 2×2 — clear any anchor spanning the click
                for (int dc = 0; dc >= -(BLD_W - 1); dc--)
                    for (int dr = 0; dr >= -1; dr--) {
                        int cc = c + dc, rr = r + dr;
                        if (!MapBlueprint.inBounds(cc, rr) || bp.decor[cc][rr] == null) continue;
                        boolean bld = bp.decor[cc][rr].startsWith("bld_");
                        int sw = bld ? BLD_W : 2, sh = bld ? BLD_H : 2;
                        if (-dc < sw && -dr < sh) bp.decor[cc][rr] = null;
                    }
                bp.overlay[c][r] = MapBlueprint.Overlay.NONE; break;
            default: break;
        }
    }

    private static final int BLD_W = 3, BLD_H = 2;          // building footprint (cells)
    private static final float BLD_RENDER = 3f;             // building sprite size in cells; a 96 px
                                                            // keep is exactly 3 cells wide

    /**
     * A {@value #BLD_W}×{@value #BLD_H} building anchor (top-left cell) needs a 1-cell border buffer
     * and no other building whose footprint would intersect (anchors closer than the footprint span).
     */
    private boolean canPlaceBuilding(int c, int r) {
        if (c < 1 || r < 1 || c > COLS() - 1 - BLD_W || r > ROWS() - 1 - BLD_H) return false;
        for (int dc = -(BLD_W - 1); dc <= BLD_W - 1; dc++)
            for (int dr = -(BLD_H - 1); dr <= BLD_H - 1; dr++) {
                if (dc == 0 && dr == 0) continue;
                int cc = c + dc, rr = r + dr;
                if (MapBlueprint.inBounds(cc, rr) && bp.decor[cc][rr] != null && bp.decor[cc][rr].startsWith("bld_"))
                    return false;
            }
        return true;
    }

    private static String pathTileFor(String terrain) {
        if (terrain.contains("mountain")) return "tile_mountain_path";
        if (terrain.contains("sand") || terrain.contains("dune")) return "tile_sand_path";
        if (terrain.contains("garden")) return "tile_garden_path";
        if (terrain.contains("shadow")) return "tile_shadow_path";
        if (terrain.contains("jungle")) return "tile_jungle_path";
        return "tile_grass_path";
    }

    // ── undo / save ────────────────────────────────────────────────────────────

    private void snapshot() {
        undo.push(bp.copy());
        if (undo.size() > 64) undo.removeLast();
        redo.clear();
    }

    public void undo() { if (!undo.isEmpty()) { redo.push(bp.copy()); bp = undo.pop(); } }
    public void redo() { if (!redo.isEmpty()) { undo.push(bp.copy()); bp = redo.pop(); } }

    private void save() {
        bp.name = "map_" + System.currentTimeMillis();
        FileHandle f = Gdx.files.local("custom_maps/" + bp.name + ".map");
        f.writeString(bp.toText(), false);
        status = "Saved " + f.file().getAbsolutePath();
    }

    private void load() {
        FileHandle dir = Gdx.files.local("custom_maps");
        if (!dir.exists()) { status = "No custom_maps/ yet — SAVE first."; return; }
        FileHandle newest = null;
        for (FileHandle f : dir.list(".map"))
            if (newest == null || f.lastModified() > newest.lastModified()) newest = f;
        if (newest == null) { status = "No .map files to load."; return; }
        snapshot();
        bp = MapBlueprint.parse(newest.readString());
        status = "Loaded " + newest.name();
    }

    private static final float TRUNK = 0.42f;   // bottom fraction of a tree sprite = trunk band

    /**
     * Decor in correct depth: buildings + cave first, then EVERY tree trunk, then EVERY tree canopy.
     * Splitting trees into trunk/canopy bands means an overlapping treetop is never hidden behind a
     * neighbour's trunk (the canopy pass always wins).
     */
    private void drawDecor() {
        // buildings (4×4 footprint, anchor = top-left cell) + cave
        for (int r = ROWS() - 1; r >= 0; r--)
            for (int c = 0; c < COLS(); c++) {
                float sx = GX + c * CELL, sy = GY + (ROWS() - 1 - r) * CELL;
                String d = bp.decor[c][r];
                if (d != null && d.startsWith("bld_")) {
                    // footprint = BLD_W×BLD_H cells (anchor top-left); render larger, grounded at the
                    // footprint's bottom edge and centred horizontally so it overhangs naturally
                    float fx = sx + BLD_W * CELL / 2f;                 // footprint centre x
                    float footBottom = sy - (BLD_H - 1) * CELL;        // bottom edge of the footprint
                    atlas.drawCentered(batch, d, fx, footBottom + BLD_RENDER * CELL / 2f, BLD_RENDER * CELL, BLD_RENDER * CELL, 0f);
                }
                if (bp.overlay[c][r] == MapBlueprint.Overlay.CAVE) atlas.drawCentered(batch, "bld_gem_cave", sx + CELL, sy, CELL * 2f, CELL * 2f, 0f);
            }
        // tree trunks (bottom band), then tree canopies (top band)
        for (int band = 0; band < 2; band++)
            for (int r = ROWS() - 1; r >= 0; r--)
                for (int c = 0; c < COLS(); c++) {
                    String d = bp.decor[c][r];
                    if (d == null || !d.startsWith("obstacle_")) continue;
                    float x = GX + c * CELL, yBottom = GY + (ROWS() - 1 - r) * CELL - CELL;
                    if (band == 0) atlas.drawVBand(batch, d, x, yBottom, CELL * 2f, CELL * 2f, 0f, TRUNK);
                    else atlas.drawVBand(batch, d, x, yBottom, CELL * 2f, CELL * 2f, TRUNK, 1f);
                }
    }

    // ── render ───────────────────────────────────────────────────────────────

    public void render() {
        // pass 1: terrain + spawn marker (so later cells never overdraw a 2×2 decor)
        for (int c = 0; c < COLS(); c++)
            for (int r = 0; r < ROWS(); r++) {
                float sx = GX + c * CELL, sy = GY + (ROWS() - 1 - r) * CELL;
                if (bp.terrainRot[c][r] == 0) atlas.draw(batch, bp.terrain[c][r], sx, sy, CELL + 1, CELL + 1, 0f);
                else atlas.drawRotated(batch, bp.terrain[c][r], sx, sy, CELL + 1, CELL + 1, bp.terrainRot[c][r] * 90f);
                if (bp.overlay[c][r] == MapBlueprint.Overlay.SPAWN) {
                    batch.setColor(0.9f, 0.2f, 0.5f, 0.7f);
                    batch.draw(white, sx + 2, sy + 2, CELL - 4, CELL - 4);
                    batch.setColor(Color.WHITE);
                }
            }
        drawDecor();
        // faint grid frame
        batch.setColor(0f, 0f, 0f, 0.5f);
        batch.draw(white, GX - 2, GY - 2, COLS() * CELL + 4, 2);
        batch.draw(white, GX - 2, GY + ROWS() * CELL, COLS() * CELL + 4, 2);
        batch.setColor(Color.WHITE);

        // toolbar
        for (int i = 0; i < TOOLBAR.length; i++) ui.button(GX + i * 110, 636, 102, 40, TOOLBAR[i]);
        ui.textBounded(status, GX, 700, PX - GX - 20, UiChrome.INK_DIM, UiChrome.SMALL, 1);

        // palette panel
        ui.panel(PX - 8, PY - 8, PW + 16, PH + 16);
        for (int i = 0; i < CATS.length; i++) {
            float tx = PX + (i % 4) * 146, ty = PY + PH - 44 - (i / 4) * 46;
            ui.button(tx, ty, 140, 40, CATS[i]);
            if (cat == i) ui.icon("icon_star_filled", tx + 8, ty + 22, 14);
        }
        String rotLabel = cat == 0 ? "   rot " + (brushRot * 90) + "  [R]" : "";
        ui.textLeftInBox(GameStrings.get("builder.brush", shortKey(brushKey), rotLabel),
                PX - 8, PY + PH - 118, PW + 16, 36, UiChrome.GOLD, UiChrome.SMALL, 1);
        drawPalette();
    }

    private static final int PCOLS = 5;
    private static final float PCELL = 104;

    private float paletteTop() { return PY + PH - 120; }

    private int paletteHit(float mx, float my) {
        List<String> pal = palette();
        float top = paletteTop();
        for (int i = 0; i < pal.size(); i++) {
            float cx = PX + 8 + (i % PCOLS) * PCELL;
            float cy = top - (i / PCOLS) * PCELL + scroll;
            if (cy < PY - PCELL || cy > top + 10) continue;
            if (mx >= cx && mx < cx + PCELL - 8 && my <= cy + 4 && my > cy - PCELL + 12) return i;
        }
        return -1;
    }

    private void drawPalette() {
        List<String> pal = palette();
        if (pal.isEmpty()) {
            ui.textLeftInBox(GameStrings.get("builder.single_cell"), PX - 8, PY + PH - 162,
                    PW + 16, 36, UiChrome.INK_DIM, UiChrome.SMALL, 1);
            return;
        }
        float top = paletteTop();
        for (int i = 0; i < pal.size(); i++) {
            float cx = PX + 8 + (i % PCOLS) * PCELL;
            float cy = top - (i / PCOLS) * PCELL + scroll;
            if (cy < PY - 10 || cy > top + 10) continue;        // clip to panel
            boolean sel = pal.get(i).equals(brushKey);
            if (sel) { batch.setColor(0.95f, 0.78f, 0.32f, 0.5f); batch.draw(white, cx - 2, cy - 86, 92, 92); batch.setColor(Color.WHITE); }
            atlas.drawCentered(batch, pal.get(i), cx + 44, cy - 40, 72, 72, 0f);
        }
        if (pal.size() > PCOLS * 5) ui.textCenteredInBox(GameStrings.get("common.scroll"),
                PX + PW - 108, PY - 8, 116, 36, UiChrome.INK_DIM, UiChrome.SMALL, 1);
    }

    private static String shortKey(String k) {
        return k.replace("tile_", "").replace("obstacle_", "").replace("bld_", "");
    }

    private boolean hit(float mx, float my, float x, float y, float w, float h) {
        return mx >= x && mx <= x + w && my >= y && my <= y + h;
    }
}
