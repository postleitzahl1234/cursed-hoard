package com.badlogic.gdx.audio;

/** Headless stand-in for libGDX Music: plays nothing. */
public interface Music {
    void play();
    void pause();
    void stop();
    boolean isPlaying();
    void setLooping(boolean isLooping);
    void setVolume(float volume);
    float getVolume();
    void dispose();
}
