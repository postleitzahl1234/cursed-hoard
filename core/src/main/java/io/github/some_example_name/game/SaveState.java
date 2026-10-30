package io.github.some_example_name.game;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;

public final class SaveState {
    public int version = 2;
    public int totalStars;
    public int skillPoints;
    public final Map<String, Integer> skillRanks = new HashMap<>();
    public final EnumMap<EnchantType, Boolean> unlockedEnchants = new EnumMap<>(EnchantType.class);
    public float masterVolume = 1f;
    public float musicVolume = 0.65f;
    public float sfxVolume = 0.8f;
    public boolean audioMuted;
    public int tutorialStage;
    public boolean tutorialSeen;

    public SaveState() {
        for (EnchantType type : EnchantType.values()) {
            unlockedEnchants.put(type, Boolean.TRUE);
        }
    }
}
