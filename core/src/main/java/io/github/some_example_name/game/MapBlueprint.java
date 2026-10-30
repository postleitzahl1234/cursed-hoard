package io.github.some_example_name.game;

/**
 * The map-editor data model: a {@value #COLS}×{@value #ROWS} grid with three layers — terrain (an
 * atlas {@code tile_*} key per cell), an overlay marker ({@code NONE/PATH/CAVE/SPAWN}) and decor (an
 * {@code obstacle_*}/{@code bld_*} key at the anchor cell, or null). Stored as raw sprite keys so
 * every asset in the atlas is paintable. {@link #toText()}/{@link #parse} give a diff-friendly,
 * round-trippable export format.
 */
public final class MapBlueprint {
    /** Always the playfield's grid — an editor that authors a different size cannot round-trip. */
    public static final int COLS = GameMap.WIDTH, ROWS = GameMap.HEIGHT;

    /** Editor rows run top-down; the playfield is y-up. This is the lane row in editor space. */
    public static final int MID_R = ROWS - 1 - GameMap.MID_ROW;

    /** Editor-space bounds of the safe rect (see {@code CursedHoardGame.SAFE_ROW_LO}). */
    public static final int SAFE_R_LO = ROWS - 1 - 19, SAFE_R_HI = ROWS - 1 - 3;

    public enum Overlay { NONE, PATH, CAVE, SPAWN }

    public final String[][] terrain = new String[COLS][ROWS];     // tile_* key
    public final int[][] terrainRot = new int[COLS][ROWS];        // 0..3 → 0/90/180/270° clockwise
    public final Overlay[][] overlay = new Overlay[COLS][ROWS];
    public final String[][] decor = new String[COLS][ROWS];       // obstacle_/bld_ key, null = empty
    public String name = "untitled";
    public String baseTile = "tile_grass_base";

    public MapBlueprint() {
        fill(baseTile);
    }

    public void fill(String tileKey) {
        baseTile = tileKey;
        for (int c = 0; c < COLS; c++)
            for (int r = 0; r < ROWS; r++) {
                terrain[c][r] = tileKey;
                terrainRot[c][r] = 0;
                overlay[c][r] = Overlay.NONE;
                decor[c][r] = null;
            }
    }

    public static boolean inBounds(int c, int r) {
        return c >= 0 && r >= 0 && c < COLS && r < ROWS;
    }

    public MapBlueprint copy() {
        MapBlueprint b = new MapBlueprint();
        b.name = name;
        b.baseTile = baseTile;
        for (int c = 0; c < COLS; c++)
            for (int r = 0; r < ROWS; r++) {
                b.terrain[c][r] = terrain[c][r];
                b.terrainRot[c][r] = terrainRot[c][r];
                b.overlay[c][r] = overlay[c][r];
                b.decor[c][r] = decor[c][r];
            }
        return b;
    }

    // ── text round-trip (export format) ───────────────────────────────────────

    public String toText() {
        StringBuilder sb = new StringBuilder();
        sb.append("name ").append(name).append('\n');
        sb.append("base ").append(baseTile).append('\n');
        for (int r = 0; r < ROWS; r++) {
            for (int c = 0; c < COLS; c++) {
                // only emit cells that differ from base / carry an overlay, decor or rotation
                boolean t = !terrain[c][r].equals(baseTile);
                boolean o = overlay[c][r] != Overlay.NONE;
                boolean d = decor[c][r] != null;
                boolean rot = terrainRot[c][r] != 0;
                if (!t && !o && !d && !rot) continue;
                sb.append("c ").append(c).append(' ').append(r);
                sb.append(" t ").append(terrain[c][r]);
                if (rot) sb.append(" r ").append(terrainRot[c][r]);
                if (o) sb.append(" o ").append(overlay[c][r].name());
                if (d) sb.append(" d ").append(decor[c][r]);
                sb.append('\n');
            }
        }
        return sb.toString();
    }

    public static MapBlueprint parse(String text) {
        MapBlueprint b = new MapBlueprint();
        for (String line : text.split("\n")) {
            String[] p = line.trim().split("\\s+");
            if (p.length == 0 || p[0].isEmpty()) continue;
            switch (p[0]) {
                case "name": if (p.length > 1) b.name = p[1]; break;
                case "base": if (p.length > 1) b.fill(p[1]); break;
                case "c": {
                    int c = Integer.parseInt(p[1]), r = Integer.parseInt(p[2]);
                    if (!inBounds(c, r)) break;
                    for (int i = 3; i + 1 < p.length; i += 2) {
                        switch (p[i]) {
                            case "t": b.terrain[c][r] = p[i + 1]; break;
                            case "r": b.terrainRot[c][r] = Integer.parseInt(p[i + 1]) & 3; break;
                            case "o": b.overlay[c][r] = Overlay.valueOf(p[i + 1]); break;
                            case "d": b.decor[c][r] = p[i + 1]; break;
                            default: break;
                        }
                    }
                    break;
                }
                default: break;
            }
        }
        return b;
    }
}
