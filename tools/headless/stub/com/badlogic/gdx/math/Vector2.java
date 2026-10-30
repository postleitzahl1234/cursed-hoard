package com.badlogic.gdx.math;
/** Headless stand-in for libGDX Vector2 — same API surface the game package uses. */
public class Vector2 {
    public float x, y;
    public Vector2() {}
    public Vector2(float x, float y) { this.x = x; this.y = y; }
    public Vector2(Vector2 v) { this.x = v.x; this.y = v.y; }
    public Vector2 set(float x, float y) { this.x = x; this.y = y; return this; }
    public boolean epsilonEquals(Vector2 other, float epsilon) {
        if (other == null) return false;
        return Math.abs(other.x - x) <= epsilon && Math.abs(other.y - y) <= epsilon;
    }
    public Vector2 set(Vector2 v) { this.x = v.x; this.y = v.y; return this; }
    public Vector2 add(float x, float y) { this.x += x; this.y += y; return this; }
    public Vector2 add(Vector2 v) { this.x += v.x; this.y += v.y; return this; }
    public Vector2 sub(float x, float y) { this.x -= x; this.y -= y; return this; }
    public Vector2 sub(Vector2 v) { this.x -= v.x; this.y -= v.y; return this; }
    public Vector2 scl(float s) { this.x *= s; this.y *= s; return this; }
    public Vector2 scl(float sx, float sy) { this.x *= sx; this.y *= sy; return this; }
    public Vector2 cpy() { return new Vector2(x, y); }
    public Vector2 mulAdd(Vector2 v, float s) { this.x += v.x * s; this.y += v.y * s; return this; }
    public Vector2 mulAdd(Vector2 v, Vector2 s) { this.x += v.x * s.x; this.y += v.y * s.y; return this; }
    public float len() { return (float) Math.sqrt(x * x + y * y); }
    public float len2() { return x * x + y * y; }
    public Vector2 nor() { float l = len(); if (l != 0) { x /= l; y /= l; } return this; }
    public float dst(Vector2 v) { return (float) Math.sqrt(dst2(v)); }
    public float dst(float ox, float oy) { return (float) Math.sqrt(dst2(ox, oy)); }
    public float dst2(Vector2 v) { float dx = x - v.x, dy = y - v.y; return dx * dx + dy * dy; }
    public float dst2(float ox, float oy) { float dx = x - ox, dy = y - oy; return dx * dx + dy * dy; }
    public float angleDeg() { float a = (float) Math.toDegrees(Math.atan2(y, x)); return a < 0 ? a + 360 : a; }
    public float angleDeg(Vector2 r) { float a = (float) Math.toDegrees(Math.atan2(r.x*y - r.y*x, r.x*x + r.y*y)); return a < 0 ? a + 360 : a; }
    public Vector2 lerp(Vector2 t, float a) { x += a * (t.x - x); y += a * (t.y - y); return this; }
    public Vector2 setLength(float l) { return nor().scl(l); }
    public Vector2 limit(float l) { if (len2() > l * l) setLength(l); return this; }
    public boolean isZero() { return x == 0 && y == 0; }
    @Override public String toString() { return "(" + x + "," + y + ")"; }
}
