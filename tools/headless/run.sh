#!/usr/bin/env bash
# Compile and run the core simulation headlessly, with NO gradle and NO libGDX jars.
#
# Why this exists: this sandbox has no `javac` binary and no network access to Maven, so
# `./gradlew test` cannot run here. But the JRE ships the `jdk.compiler` MODULE, which is
# invokable directly — and the entire `game/` package depends on exactly two libGDX classes
# (Vector2 and Color), both of which are stubbed in stub/. So the core simulation compiles and
# runs. This is the harness that first proved the game loop works.
#
#   tools/headless/run.sh            compile + play 25 levels
#   tools/headless/run.sh --compile  compile only (fast error check)
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${TMPDIR:-/tmp}/ct_headless"
JAVAC="java -m jdk.compiler/com.sun.tools.javac.Main"
rm -rf "$OUT"; mkdir -p "$OUT"
# Collect sources into an argument file so paths with spaces work.
find "$ROOT/core/src/main/java/io/github/some_example_name/game" "$ROOT/tools/headless/stub" -name '*.java' \
  | sed 's/.*/"&"/' > "$OUT/sources.txt"
$JAVAC -nowarn -d "$OUT" -sourcepath "$ROOT/core/src/main/java:$ROOT/tools/headless/stub" @"$OUT/sources.txt"
echo "core game logic: compiled clean ($(find "$OUT" -name '*.class' | wc -l) classes)"
[ "$1" = "--compile" ] && exit 0
$JAVAC -nowarn -cp "$OUT" -d "$OUT" "$ROOT/tools/headless/harness/Playtest.java"
java -cp "$OUT" harness.Playtest
