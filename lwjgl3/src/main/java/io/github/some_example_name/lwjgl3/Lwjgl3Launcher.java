package io.github.some_example_name.lwjgl3;

import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Application;
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3ApplicationConfiguration;
import io.github.some_example_name.CursedHoardGame;

public final class Lwjgl3Launcher {
    public static void main(String[] args) {
        Lwjgl3ApplicationConfiguration config = new Lwjgl3ApplicationConfiguration();
        config.setTitle("Cursed Hoard v2");
        // Default to borderless desktop fullscreen; the FitViewport scales the 1280×720 logical
        // layout to any resolution. -Dch.windowed=1 forces a window (used for QA screenshots).
        if (Boolean.getBoolean("ch.windowed")) {
            config.setWindowedMode(1280, 720);
        } else {
            config.setFullscreenMode(Lwjgl3ApplicationConfiguration.getDisplayMode());
        }
        config.useVsync(true);
        config.setForegroundFPS(60);
        new Lwjgl3Application(new CursedHoardGame(), config);
    }
}
