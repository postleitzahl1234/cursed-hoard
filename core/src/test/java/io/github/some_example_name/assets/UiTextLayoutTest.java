package io.github.some_example_name.assets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class UiTextLayoutTest {
    @Test
    void measurementIncludesDropShadow() {
        assertEquals(0f, UiTextLayout.renderedWidth(null, 2));
        assertEquals(26f, UiTextLayout.renderedWidth("AB", 2));
        assertEquals(16f, UiTextLayout.renderedHeight(2));
    }

    @Test
    void fitScaleRespectsBothDimensions() {
        assertEquals(2, UiTextLayout.fitScale("PLAY", 52, 20, 3, 1));
        assertEquals(1, UiTextLayout.fitScale("PLAY", 52, 12, 3, 1));
        assertEquals(0, UiTextLayout.fitScale("PLAY", 52, 7, 3, 1));
    }

    @Test
    void ellipsizedTextAlwaysFitsAndSignalsOmission() {
        String result = UiTextLayout.ellipsize("EXTRAORDINARILY LONG LABEL", 85, 1);
        assertTrue(result.endsWith("..."));
        assertTrue(UiTextLayout.renderedWidth(result, 1) <= 85);
    }

    @Test
    void wrappingCapsLinesAndEllipsizesOverflow() {
        List<String> lines = UiTextLayout.wrap(
                "ONE TWO THREE FOUR FIVE SIX SEVEN EIGHT", 67, 1, 2);
        assertEquals(2, lines.size());
        assertTrue(lines.get(1).endsWith("..."));
        for (String line : lines) assertTrue(UiTextLayout.renderedWidth(line, 1) <= 67);
    }

    @Test
    void tooNarrowBoxNeverReturnsOverflowingGlyphs() {
        assertEquals("", UiTextLayout.ellipsize("LABEL", 10, 2));
    }

    @Test
    void centeredLabelRetainsPaddingOnEveryEdge() {
        float x = 100, y = 50, width = 140, height = 40;
        float innerWidth = width - 2 * UiChrome.TEXT_PAD_X;
        float innerHeight = height - 2 * UiChrome.TEXT_PAD_Y;
        int scale = UiTextLayout.fitScale("A LONG BUTTON LABEL", innerWidth, innerHeight, 2, 1);
        String fitted = UiTextLayout.ellipsize("A LONG BUTTON LABEL", innerWidth, scale);
        float left = UiTextLayout.centeredLeft(x, width, fitted, scale);
        float top = UiTextLayout.centeredTop(y, height, scale);

        assertTrue(left >= x + UiChrome.TEXT_PAD_X);
        assertTrue(left + UiTextLayout.renderedWidth(fitted, scale) <= x + width - UiChrome.TEXT_PAD_X);
        assertTrue(top <= y + height - UiChrome.TEXT_PAD_Y);
        assertTrue(top - UiTextLayout.renderedHeight(scale) >= y + UiChrome.TEXT_PAD_Y);
    }
}
