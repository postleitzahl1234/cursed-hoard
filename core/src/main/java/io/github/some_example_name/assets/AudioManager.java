package io.github.some_example_name.assets;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Preferences;
import com.badlogic.gdx.audio.Music;
import com.badlogic.gdx.audio.Sound;
import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.utils.Disposable;
import java.util.EnumMap;

/** Optional audio service: missing files are deliberately treated as silence. */
public final class AudioManager implements Disposable {
    public enum Sfx {
        TOWER_FIRE("audio/sfx/tower_fire.ogg"),
        PROJECTILE_IMPACT("audio/sfx/projectile_impact.ogg"),
        HERO_DEATH("audio/sfx/hero_death.ogg"),
        GEM_PICKUP("audio/sfx/gem_pickup.ogg"),
        GEM_RETURN("audio/sfx/gem_return.ogg"),
        TOWER_BUILD("audio/sfx/tower_build.ogg"),
        TOWER_UPGRADE("audio/sfx/tower_upgrade.ogg"),
        WAVE_START("audio/sfx/wave_start.ogg"),
        LEVEL_WON("audio/sfx/level_won.ogg"),
        LEVEL_LOST("audio/sfx/level_lost.ogg"),
        UI_CLICK("audio/sfx/ui_click.ogg");

        final String path;
        Sfx(String path) { this.path = path; }
    }

    private static final float CROSS_FADE_SECONDS = 1.5f;
    private final EnumMap<Sfx, Sound> sounds = new EnumMap<>(Sfx.class);
    private final Music[] worldMusic = new Music[5];
    private Music currentMusic;
    private Music nextMusic;
    private float fadeTime;
    private boolean muted;
    private float masterVolume = 1f;
    private float musicVolume = 0.65f;
    private float sfxVolume = 0.8f;

    public AudioManager() {
        for (Sfx key : Sfx.values()) sounds.put(key, loadSound(key.path));
    }

    public void load(Preferences prefs) {
        masterVolume = clamp(prefs.getFloat("audioMaster", masterVolume));
        musicVolume = clamp(prefs.getFloat("audioMusic", musicVolume));
        sfxVolume = clamp(prefs.getFloat("audioSfx", sfxVolume));
        muted = prefs.getBoolean("audioMuted", false);
        applyCurrentVolume();
    }

    public void save(Preferences prefs) {
        prefs.putFloat("audioMaster", masterVolume);
        prefs.putFloat("audioMusic", musicVolume);
        prefs.putFloat("audioSfx", sfxVolume);
        prefs.putBoolean("audioMuted", muted);
        prefs.flush();
    }

    public void play(Sfx key) {
        if (muted) return;
        Sound sound = sounds.get(key);
        if (sound != null) sound.play(masterVolume * sfxVolume);
    }

    /** Begin (or cross-fade to) the ambient loop for the zero-based campaign world. */
    public void playWorld(int worldIndex) {
        int index = Math.max(0, Math.min(worldMusic.length - 1, worldIndex));
        Music wanted = worldMusic[index];
        if (wanted == null) {
            wanted = loadMusic("audio/music/world_" + (index + 1) + ".ogg");
            worldMusic[index] = wanted;
        }
        if (wanted == null || wanted == currentMusic || wanted == nextMusic) return;
        wanted.setLooping(true);
        wanted.setVolume(0f);
        wanted.play();
        nextMusic = wanted;
        fadeTime = 0f;
    }

    public void update(float dt) {
        if (nextMusic == null) {
            applyCurrentVolume();
            return;
        }
        fadeTime = Math.min(CROSS_FADE_SECONDS, fadeTime + Math.max(0f, dt));
        float alpha = fadeTime / CROSS_FADE_SECONDS;
        float volume = effectiveMusicVolume();
        nextMusic.setVolume(volume * alpha);
        if (currentMusic != null) currentMusic.setVolume(volume * (1f - alpha));
        if (alpha >= 1f) {
            if (currentMusic != null) currentMusic.stop();
            currentMusic = nextMusic;
            nextMusic = null;
        }
    }

    public boolean isMuted() { return muted; }
    public float masterVolume() { return masterVolume; }
    public float musicVolume() { return musicVolume; }
    public float sfxVolume() { return sfxVolume; }
    public void setMuted(boolean value) { muted = value; applyCurrentVolume(); }
    public void setMasterVolume(float value) { masterVolume = clamp(value); applyCurrentVolume(); }
    public void setMusicVolume(float value) { musicVolume = clamp(value); applyCurrentVolume(); }
    public void setSfxVolume(float value) { sfxVolume = clamp(value); }

    private float effectiveMusicVolume() {
        return muted ? 0f : masterVolume * musicVolume;
    }

    private void applyCurrentVolume() {
        if (currentMusic != null) currentMusic.setVolume(effectiveMusicVolume());
        if (nextMusic != null) nextMusic.setVolume(effectiveMusicVolume());
    }

    private static Sound loadSound(String path) {
        try {
            FileHandle file = Gdx.files.internal(path);
            return file.exists() ? Gdx.audio.newSound(file) : null;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private static Music loadMusic(String path) {
        try {
            FileHandle file = Gdx.files.internal(path);
            return file.exists() ? Gdx.audio.newMusic(file) : null;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private static float clamp(float value) { return Math.max(0f, Math.min(1f, value)); }

    @Override
    public void dispose() {
        for (Sound sound : sounds.values()) if (sound != null) sound.dispose();
        for (Music music : worldMusic) if (music != null) music.dispose();
        sounds.clear();
        currentMusic = null;
        nextMusic = null;
    }
}
