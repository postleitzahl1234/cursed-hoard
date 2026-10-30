package io.github.some_example_name.game;

/**
 * Auto-edge tiling (D-19).
 *
 * <p>The resolver that used to live here was dead code twice over: it built {@code terrain_*}
 * keys when every sprite in the atlas is named {@code tile_*}, and nothing called it. It was
 * also a 4-bit cardinal mask, which cannot express a corner — so even wired up it would have
 * left a hard 90-degree staircase everywhere two materials meet, which is exactly the flat
 * lattice the redesign is trying to kill.
 *
 * <h2>Layered overlays, not a blob set</h2>
 * A classic 47-piece blob tileset needs art per <i>pair</i> of materials, so five biomes with a
 * base, a path and a water each would be several hundred hand-made tiles. Instead each material
 * that can sit <i>on top</i> of another gets one 12-piece edge kit, drawn over the neighbouring
 * cell — cost is linear in materials, and the kits compose without anyone ever authoring a
 * grass-meets-canal tile.
 *
 * <p>The kit is 4 sides + 4 outer corners + 4 inner corners. Every piece is authored in its own
 * orientation rather than rotated at draw time: the whole art direction is lit by one global NW
 * key (D-08), and a rotated highlight points at the wrong sun.
 *
 * <pre>
 *   . . .          . . X          X X .
 *   . o .  none    . o .  "e"     X o .  "n" + "w" + inner corner "inw"
 *   . . .          . . X          . . .
 * </pre>
 *
 * <p>Priority is BASE &lt; WATER &lt; PATH. Water creeps over open ground; the road crosses the
 * water rather than the other way round, so a stream meeting the lane reads as a culvert.
 */
public final class TileResolver {
    private TileResolver() {}

    /** What a cell contributes to the stack; ordinal is the draw priority. */
    public enum Layer { BASE, WATER, PATH }

    public static final int N = 1, E = 2, S = 4, W = 8, NE = 16, SE = 32, SW = 64, NW = 128;

    /** Suffixes, in draw order, for each of the 256 neighbourhoods — built once, never allocated. */
    private static final String[][] PIECES = new String[256][];
    private static final String[] EMPTY = new String[0];

    static {
        for (int m = 0; m < 256; m++) PIECES[m] = build(m);
    }

    private static String[] build(int m) {
        java.util.List<String> out = new java.util.ArrayList<>(8);
        boolean n = (m & N) != 0, e = (m & E) != 0, s = (m & S) != 0, w = (m & W) != 0;
        // sides first — they carry most of the coverage
        if (n) out.add("n");
        if (e) out.add("e");
        if (s) out.add("s");
        if (w) out.add("w");
        // outer corner: the material touches only diagonally, so a small nub pokes into this cell
        if ((m & NE) != 0 && !n && !e) out.add("one");
        if ((m & SE) != 0 && !s && !e) out.add("ose");
        if ((m & SW) != 0 && !s && !w) out.add("osw");
        if ((m & NW) != 0 && !n && !w) out.add("onw");
        // inner corner: two sides meet and leave a square notch that has to be filled
        if (n && e) out.add("ine");
        if (s && e) out.add("ise");
        if (s && w) out.add("isw");
        if (n && w) out.add("inw");
        return out.isEmpty() ? EMPTY : out.toArray(new String[0]);
    }

    public static Layer layerOf(MapTile t) {
        if (t == null) return Layer.BASE;
        switch (t.role) {
            case PATH: return Layer.PATH;
            case SPECIAL: return Layer.WATER;
            default: return Layer.BASE;
        }
    }

    /**
     * True when the cell at (x,y) <em>is</em> this layer.
     *
     * <p>This tested {@code >=} at first, on the theory that a higher layer should also count as
     * the ones beneath it. That is wrong, and it is wrong in a way that is invisible in code and
     * obvious in a render: a road is not water, so every cell beside the lane got a water edge
     * and the whole map came out beaded in blue. The layers are an ordering for *draw priority*
     * only; they are not a containment hierarchy.
     */
    private static boolean at(GameMap map, int x, int y, Layer layer) {
        MapTile t = map.tileAt(x, y);
        if (t == null) return false;   // off-map is open ground: the field edge gets a real edge
        return layerOf(t) == layer;
    }

    /** The 8-neighbour mask of {@code layer} around (x,y). y is up, so N is y+1. */
    public static int mask(GameMap map, int x, int y, Layer layer) {
        int m = 0;
        if (at(map, x, y + 1, layer)) m |= N;
        if (at(map, x + 1, y, layer)) m |= E;
        if (at(map, x, y - 1, layer)) m |= S;
        if (at(map, x - 1, y, layer)) m |= W;
        if (at(map, x + 1, y + 1, layer)) m |= NE;
        if (at(map, x + 1, y - 1, layer)) m |= SE;
        if (at(map, x - 1, y - 1, layer)) m |= SW;
        if (at(map, x - 1, y + 1, layer)) m |= NW;
        return m;
    }

    /** Edge pieces to draw over (x,y) for {@code layer}; empty when the cell already is that layer. */
    public static String[] pieces(GameMap map, int x, int y, Layer layer) {
        MapTile t = map.tileAt(x, y);
        if (t == null || layerOf(t).ordinal() >= layer.ordinal()) return EMPTY;
        return PIECES[mask(map, x, y, layer)];
    }

    /**
     * The atlas key for one edge piece. Derived from the layer's own tile key so the naming can
     * never drift from the material it edges: {@code tile_grass_brook} →
     * {@code tile_grass_brook_edge_ine}.
     */
    public static String edgeKey(String layerTileKey, String piece) {
        return layerTileKey + "_edge_" + piece;
    }

    /** Every suffix an edge kit must supply — used by the asset catalogue and the export check. */
    public static final String[] KIT = {
        "n", "e", "s", "w", "one", "ose", "osw", "onw", "ine", "ise", "isw", "inw"};
}
