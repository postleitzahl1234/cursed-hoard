package com.badlogic.gdx;

import com.badlogic.gdx.audio.Music;
import com.badlogic.gdx.audio.Sound;
import com.badlogic.gdx.files.FileHandle;

/** Headless stand-in for libGDX Audio: there is no sound device, so nothing is loaded. */
public class Audio {
    public Sound newSound(FileHandle file) { return null; }
    public Music newMusic(FileHandle file) { return null; }
}
