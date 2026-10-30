package com.badlogic.gdx;

/** Headless stand-in for the libGDX Application surface Gdx.app exposes. */
public class Application {
    public Preferences getPreferences(String name) { return new Preferences(); }
    public void error(String tag, String message) {}
    public void error(String tag, String message, Throwable exception) {}
    public void log(String tag, String message) {}
    public void exit() {}
}
