package io.github.some_example_name.assets;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class UiThemeTest {
    @Test
    void proportionsAndCoreContrastStayIntentional() {
        assertEquals(1f, UiTheme.DOMINANT_SHARE + UiTheme.SECONDARY_SHARE + UiTheme.ACCENT_SHARE, 0.0001f);
        assertTrue(UiTheme.contrast(UiTheme.INK, UiTheme.SURFACE) >= 4.5f,
                "primary text must meet WCAG AA on panels");
        assertTrue(UiTheme.contrast(UiTheme.GOLD, UiTheme.VOID) >= 3f,
                "accent controls must remain distinguishable from the dominant background");
    }
}
