package io.github.some_example_name.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Pure-Java parser for the small, line-oriented authored encounter format. */
public final class WaveTable {
    private final List<Wave> waves;

    private WaveTable(List<Wave> waves) {
        this.waves = Collections.unmodifiableList(new ArrayList<>(waves));
    }

    public int waveCount() { return waves.size(); }
    public Wave wave(int index) { return waves.get(index); }

    public static WaveTable parse(String text) {
        if (text == null) throw new IllegalArgumentException("wave table is null");
        List<Wave> parsed = new ArrayList<>();
        Wave current = null;
        float scalar = 1f;
        int declared = -1;
        int lineNo = 0;
        for (String raw : text.split("\\R")) {
            lineNo++;
            String line = raw.replaceFirst("#.*$", "").trim();
            if (line.isEmpty()) continue;
            String[] parts = line.split("\\s+");
            try {
                if (parts[0].equals("version")) {
                    if (parts.length != 2 || !parts[1].equals("1")) fail(lineNo, "unsupported version");
                } else if (parts[0].equals("waves")) {
                    if (parts.length != 2) fail(lineNo, "expected: waves <count>");
                    declared = Integer.parseInt(parts[1]);
                } else if (parts[0].equals("wave")) {
                    if (current != null) fail(lineNo, "previous wave is missing end");
                    int expectedIndex = parsed.size() + 1;
                    if (parts.length != 4 || !parts[2].equals("scalar")
                            || Integer.parseInt(parts[1]) != expectedIndex) {
                        fail(lineNo, "expected: wave " + expectedIndex + " scalar <value>");
                    }
                    scalar = Float.parseFloat(parts[3]);
                    if (!(scalar > 0f)) fail(lineNo, "scalar must be positive");
                    current = new Wave();
                } else if (parts[0].equals("end")) {
                    if (parts.length != 1 || current == null || current.entries().isEmpty()) {
                        fail(lineNo, "end requires a non-empty wave");
                    }
                    parsed.add(current);
                    current = null;
                } else {
                    if (current == null || parts.length != 3) {
                        fail(lineNo, "expected: <HeroType> <count> <interval>");
                    }
                    HeroType type = HeroType.valueOf(parts[0]);
                    int count = Math.max(1, Math.round(Integer.parseInt(parts[1]) * scalar));
                    float interval = Float.parseFloat(parts[2]) / scalar;
                    if (!(interval > 0f)) fail(lineNo, "interval must be positive");
                    current.add(type, count, interval);
                }
            } catch (IllegalArgumentException e) {
                if (e instanceof WaveFormatException) throw e;
                throw new WaveFormatException("line " + lineNo + ": " + e.getMessage(), e);
            }
        }
        if (current != null) fail(lineNo, "final wave is missing end");
        if (declared < 0 || declared != parsed.size()) {
            throw new WaveFormatException("declared " + declared + " waves but parsed " + parsed.size());
        }
        if (parsed.isEmpty()) throw new WaveFormatException("table contains no waves");
        return new WaveTable(parsed);
    }

    public static String format(List<Wave> waves) {
        StringBuilder out = new StringBuilder("# Cursed Hoard authored waves v1\nversion 1\nwaves ")
                .append(waves.size()).append('\n');
        for (int i = 0; i < waves.size(); i++) {
            out.append("\nwave ").append(i + 1).append(" scalar 1.0\n");
            for (WaveEntry entry : waves.get(i).entries()) {
                // Float.toString is the shortest decimal that round-trips to the exact bits.
                out.append(entry.type.name()).append(' ').append(entry.count).append(' ')
                        .append(Float.toString(entry.interval)).append('\n');
            }
            out.append("end\n");
        }
        return out.toString();
    }

    private static void fail(int lineNo, String message) {
        throw new WaveFormatException("line " + lineNo + ": " + message);
    }

    public static final class WaveFormatException extends IllegalArgumentException {
        WaveFormatException(String message) { super(message); }
        WaveFormatException(String message, Throwable cause) { super(message, cause); }
    }
}
