package io.github.some_example_name.game;

public enum EnchantType {
    METEOR("Meteor", CastMode.POINT_AOE, DamageType.FIRE, 120, "enchant_meteor"),
    FEAR("Fear", CastMode.POINT_AOE, DamageType.CURSE, 80, "enchant_fear"),
    FREEZE("Freeze", CastMode.POINT_AOE, DamageType.FROST, 90, "enchant_freeze"),
    GEM_WARD("Gem Ward", CastMode.ENEMY_TARGET, DamageType.CURSE, 70, "enchant_gem_ward"),
    CURSED_TRIBUTE("Cursed Tribute", CastMode.GLOBAL, DamageType.CURSE, 60, "enchant_cursed_tribute"),
    DARK_OVERCHARGE("Dark Overcharge", CastMode.TOWER_TARGET, DamageType.CURSE, 75, "enchant_dark_overcharge");

    public final String displayName;
    public final CastMode castMode;
    public final DamageType damageType;
    public final int manaCost;
    public final String assetKey;

    EnchantType(String displayName, CastMode castMode, DamageType damageType, int manaCost, String assetKey) {
        this.displayName = displayName;
        this.castMode = castMode;
        this.damageType = damageType;
        this.manaCost = manaCost;
        this.assetKey = assetKey;
    }
}
