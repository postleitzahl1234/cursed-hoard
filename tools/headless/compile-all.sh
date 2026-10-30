#!/usr/bin/env bash
# Compile the WHOLE project headlessly — core (game/ + assets/ + the front end) and lwjgl3 — with
# NO gradle and NO libGDX jars, same trick as run.sh.
#
# Why this exists: run.sh only ever compiled `game/`, because that's all that depended on libGDX
# at the time (Vector2 + Color, both stubbed). Everything else — CursedHoardGame.java,
# MapBuilderScreen.java, the assets/ package (PixelArtAtlas, UiChrome, SpriteKeys, PixelFont,
# GameFx, WorldMap) and the lwjgl3 launcher — pulls in the rest of the libGDX surface (Gdx,
# SpriteBatch, Pixmap/Texture/TextureRegion, JsonReader/JsonValue, Preferences, viewport, the
# lwjgl3 backend, …) and had never been type-checked at all. Those 21 libGDX types are stubbed
# out in stub/ with real upstream signatures for whatever members the project actually calls —
# bodies are trivial (return null/0/false, or a benign default), because this script proves the
# code *type-checks*, not that it runs correctly with a live GL context.
#
#   tools/headless/compile-all.sh            compile everything (core + lwjgl3)
#   tools/headless/compile-all.sh --core-only  compile core/ only (skip lwjgl3)
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${TMPDIR:-/tmp}/ct_headless_full"
JAVAC="java -m jdk.compiler/com.sun.tools.javac.Main"
rm -rf "$OUT"; mkdir -p "$OUT"

# Collect sources into an argument file so paths with spaces work.
find "$ROOT/core/src/main/java/io/github/some_example_name" "$ROOT/tools/headless/stub" -name '*.java' \
  | sed 's/.*/"&"/' > "$OUT/core-sources.txt"
$JAVAC -nowarn -d "$OUT" -sourcepath "$ROOT/core/src/main/java:$ROOT/tools/headless/stub" @"$OUT/core-sources.txt"
echo "core (game + assets + front end): compiled clean ($(find "$OUT" -name '*.class' | wc -l) classes)"

[ "$1" = "--core-only" ] && exit 0

find "$ROOT/lwjgl3/src/main/java" -name '*.java' | sed 's/.*/"&"/' > "$OUT/lwjgl3-sources.txt"
$JAVAC -nowarn -cp "$OUT" -d "$OUT" -sourcepath "$ROOT/lwjgl3/src/main/java:$ROOT/tools/headless/stub" @"$OUT/lwjgl3-sources.txt"
echo "lwjgl3 launcher: compiled clean ($(find "$OUT" -name '*.class' | wc -l) classes total)"
