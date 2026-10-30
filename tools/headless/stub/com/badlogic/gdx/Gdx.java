package com.badlogic.gdx;

/**
 * Headless stand-in for the libGDX Gdx static-service locator. Only the services the render
 * and audio layers touch (app/files/input/graphics/audio) plus gl are provided; each backing type is its own
 * trivial stub class alongside this one.
 */
public class Gdx {
    public static Application app = new Application();
    public static Files files = new Files();
    public static Input input = new Input();
    public static com.badlogic.gdx.graphics.GL20 gl = new com.badlogic.gdx.graphics.GL20();
    public static Graphics graphics = new Graphics();
    public static Audio audio = new Audio();
}
