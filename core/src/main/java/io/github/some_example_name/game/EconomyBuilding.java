package io.github.some_example_name.game;

/** Passive income represented by an authored gold-mine or mana-well map sprite. */
public final class EconomyBuilding {
    public enum Kind { GOLD, MANA }

    public static final float PAYOUT_INTERVAL = 4f;

    public final Kind kind;
    public final int tier;
    public final String spriteKey;
    public final float x;
    public final float y;
    private float timer = PAYOUT_INTERVAL;

    public EconomyBuilding(String spriteKey, float x, float y) {
        if (spriteKey == null || (!spriteKey.startsWith("bld_gold_mine_t")
                && !spriteKey.startsWith("bld_mana_well_t"))) {
            throw new IllegalArgumentException("not an economy building: " + spriteKey);
        }
        this.spriteKey = spriteKey;
        this.kind = spriteKey.startsWith("bld_gold") ? Kind.GOLD : Kind.MANA;
        char suffix = spriteKey.charAt(spriteKey.length() - 1);
        this.tier = Math.max(1, Math.min(3, Character.digit(suffix, 10)));
        this.x = x;
        this.y = y;
    }

    public int payout() {
        return kind == Kind.GOLD ? 5 + tier * 3 : 7 + tier * 4;
    }

    /** Pays once per interval and remains stable with large frame deltas. */
    public int update(float dt) {
        timer -= Math.max(0f, dt);
        int due = 0;
        while (timer <= 0f) {
            due += payout();
            timer += PAYOUT_INTERVAL;
        }
        return due;
    }
}
