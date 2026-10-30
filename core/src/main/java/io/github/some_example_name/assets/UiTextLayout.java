package io.github.some_example_name.assets;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Pure, deterministic text measurement used by every boxed UI label. */
public final class UiTextLayout {
    private UiTextLayout() {}

    /** Includes the one-pixel-at-scale down/right shadow used by {@link PixelFont}. */
    public static float renderedWidth(String value, int scale) {
        String s = value == null ? "" : value;
        return s.length() * PixelFont.ADV * scale + (s.isEmpty() ? 0 : scale);
    }

    public static float renderedHeight(int scale) {
        return (PixelFont.GH + 1) * scale;
    }

    public static float centeredLeft(float x, float width, String value, int scale) {
        return x + (width - renderedWidth(value, scale)) / 2f;
    }

    /** PixelFont's y coordinate is the top edge, so this centers its full shadowed bounds. */
    public static float centeredTop(float y, float height, int scale) {
        return y + (height + renderedHeight(scale)) / 2f;
    }

    public static int fitScale(String value, float maxWidth, float maxHeight,
                               int preferredScale, int minimumScale) {
        int minimum = Math.max(1, minimumScale);
        for (int scale = Math.max(minimum, preferredScale); scale > minimum; scale--) {
            if (renderedWidth(value, scale) <= maxWidth && renderedHeight(scale) <= maxHeight)
                return scale;
        }
        boolean hasText = value != null && !value.isEmpty();
        float minimumUsefulWidth = renderedWidth(hasText ? "..." : "", minimum);
        return minimumUsefulWidth <= maxWidth && renderedHeight(minimum) <= maxHeight ? minimum : 0;
    }

    public static String ellipsize(String value, float maxWidth, int scale) {
        String s = value == null ? "" : value;
        if (renderedWidth(s, scale) <= maxWidth) return s;
        String suffix = "...";
        if (renderedWidth(suffix, scale) > maxWidth) return "";
        int end = s.length();
        while (end > 0 && renderedWidth(s.substring(0, end).stripTrailing() + suffix, scale) > maxWidth)
            end--;
        return end == 0 ? suffix : s.substring(0, end).stripTrailing() + suffix;
    }

    /** Wraps to a fixed line count and marks omitted copy with an ellipsis on the last line. */
    public static List<String> wrap(String value, float maxWidth, int scale, int maxLines) {
        if (value == null || value.trim().isEmpty() || maxLines <= 0 || maxWidth <= 0)
            return Collections.emptyList();
        List<String> raw = new ArrayList<>();
        StringBuilder line = new StringBuilder();
        for (String word : value.trim().split("\\s+")) {
            String candidate = line.length() == 0 ? word : line + " " + word;
            if (renderedWidth(candidate, scale) <= maxWidth) {
                line.setLength(0);
                line.append(candidate);
            } else {
                if (line.length() > 0) raw.add(line.toString());
                line.setLength(0);
                line.append(ellipsize(word, maxWidth, scale));
            }
        }
        if (line.length() > 0) raw.add(line.toString());
        if (raw.size() <= maxLines) return raw;

        List<String> visible = new ArrayList<>(raw.subList(0, maxLines));
        String last = visible.get(maxLines - 1);
        visible.set(maxLines - 1, ellipsize(last + "...", maxWidth, scale));
        return visible;
    }
}
