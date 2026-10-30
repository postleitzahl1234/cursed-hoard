package io.github.some_example_name.assets;

import java.util.Set;

/**
 * The minimal sprite-key lookup that {@link SpriteKeys} resolves against. {@link PixelArtAtlas}
 * implements it for the running game; tests supply a GL-free fake built from the delivered key
 * list, so the enum→atlas bridge can be verified headlessly.
 */
public interface SpriteSource {
    boolean has(String key);

    Set<String> keySet();
}
