/**
 * Unit tests for SceneManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SceneManager } from '../src/render/SceneManager';
import * as THREE from 'three';

describe('SceneManager', () => {
  let canvas: HTMLCanvasElement;
  let sceneManager: SceneManager;

  beforeEach(() => {
    // Create a mock canvas
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    sceneManager = new SceneManager(canvas);
  });

  it('should initialize with scene, camera, and renderer', () => {
    expect(sceneManager.getScene()).toBeInstanceOf(THREE.Scene);
    expect(sceneManager.getCamera()).toBeInstanceOf(THREE.Camera);
  });

  it('should handle resize correctly', () => {
    sceneManager.handleResize(1024, 768);
    const camera = sceneManager.getCamera() as THREE.PerspectiveCamera;
    expect(camera.aspect).toBeCloseTo(1024 / 768);
  });

  it('should return interactive meshes array', () => {
    const meshes = sceneManager.getInteractiveMeshes();
    expect(Array.isArray(meshes)).toBe(true);
  });

  it('should call ANIMATE_BOLTS without errors', () => {
    expect(() => sceneManager.ANIMATE_BOLTS(300)).not.toThrow();
  });

  it('should call ANIMATE_EYES without errors', () => {
    expect(() => sceneManager.ANIMATE_EYES(2.0, 500)).not.toThrow();
  });

  it('should call ANIMATE_STITCHES without errors', () => {
    expect(() => sceneManager.ANIMATE_STITCHES()).not.toThrow();
  });

  it('should stop stitches animation', () => {
    sceneManager.ANIMATE_STITCHES();
    expect(() => sceneManager.stopStitchesAnimation()).not.toThrow();
  });

  it('should call ANIMATE_JOYSTICK without errors for all joystick directions', () => {
    const { InputAction } = require('../src/config/types');
    expect(() => sceneManager.ANIMATE_JOYSTICK(InputAction.JOYSTICK_UP, 200)).not.toThrow();
    expect(() => sceneManager.ANIMATE_JOYSTICK(InputAction.JOYSTICK_DOWN, 200)).not.toThrow();
    expect(() => sceneManager.ANIMATE_JOYSTICK(InputAction.JOYSTICK_LEFT, 200)).not.toThrow();
    expect(() => sceneManager.ANIMATE_JOYSTICK(InputAction.JOYSTICK_RIGHT, 200)).not.toThrow();
  });

  it('should render without errors', () => {
    expect(() => sceneManager.render()).not.toThrow();
  });
});
