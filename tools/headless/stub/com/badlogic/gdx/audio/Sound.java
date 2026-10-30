package com.badlogic.gdx.audio;

/** Headless stand-in for libGDX Sound: plays nothing. */
public interface Sound {
    long play(float volume);
    void stop();
    void dispose();
}
