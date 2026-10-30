# Audio asset contract

Audio is optional: every lookup degrades to silence when its file is absent.

Use Ogg Vorbis (`.ogg`) at 48 kHz. Export sound effects as mono and music as stereo. Keep music
tracks seamlessly loopable; normalize conservatively so the runtime volume controls retain
headroom.

## Mono SFX

- `sfx/tower_fire.ogg`
- `sfx/projectile_impact.ogg`
- `sfx/hero_death.ogg`
- `sfx/gem_pickup.ogg`
- `sfx/gem_return.ogg`
- `sfx/tower_build.ogg`
- `sfx/tower_upgrade.ogg`
- `sfx/wave_start.ogg`
- `sfx/level_won.ogg`
- `sfx/level_lost.ogg`
- `sfx/ui_click.ogg`

## Stereo music

- `music/world_1.ogg`
- `music/world_2.ogg`
- `music/world_3.ogg`
- `music/world_4.ogg`
- `music/world_5.ogg`
