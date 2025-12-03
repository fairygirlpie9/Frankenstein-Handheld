/**
 * Unit tests for ScreenRenderer
 * Focus on API and integration testing rather than pixel-level rendering
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenRenderer } from '../src/render/ScreenRenderer';
import { EKGState, SurgicalObjectType } from '../src/config/types';
import * as THREE from 'three';

describe('ScreenRenderer', () => {
  let renderer: ScreenRenderer;

  beforeEach(() => {
    renderer = new ScreenRenderer();
  });

  it('should initialize with default configuration', () => {
    expect(renderer).toBeDefined();
    expect(renderer.getTexture()).toBeInstanceOf(THREE.CanvasTexture);
    expect(renderer.getCanvas()).toBeInstanceOf(HTMLCanvasElement);
    expect(renderer.getContext()).toBeDefined();
  });

  it('should initialize with custom configuration', () => {
    const customRenderer = new ScreenRenderer({
      width: 1024,
      height: 768,
      pixelSize: 4,
      scanlineIntensity: 0.5,
      glitchIntensity: 0.9
    });
    
    expect(customRenderer.getCanvas().width).toBe(1024);
    expect(customRenderer.getCanvas().height).toBe(768);
  });

  it('should have clear method that executes without errors', () => {
    expect(() => renderer.clear()).not.toThrow();
  });

  it('should update texture without errors', () => {
    expect(() => renderer.updateTexture()).not.toThrow();
  });

  it('should apply scanlines effect without errors', () => {
    expect(() => {
      renderer.clear();
      renderer.applyScanlines();
    }).not.toThrow();
  });

  it('should apply glitch effect without errors', () => {
    expect(() => {
      renderer.clear();
      renderer.applyGlitchEffect(0.5);
    }).not.toThrow();
  });

  it('should draw prompt text without errors', () => {
    expect(() => {
      renderer.clear();
      renderer.drawPrompt('Test Prompt', 100);
    }).not.toThrow();
  });

  it('should draw time indicator without errors', () => {
    expect(() => {
      renderer.clear();
      renderer.drawTimeIndicator(3, 5);
    }).not.toThrow();
  });

  it('should draw time indicator with warning colors for low time', () => {
    expect(() => {
      renderer.clear();
      renderer.drawTimeIndicator(1, 5); // 20% remaining
    }).not.toThrow();
  });

  it('should draw idle screen without errors', () => {
    expect(() => renderer.drawIdleScreen()).not.toThrow();
  });

  it('should draw ITS ALIVE screen without errors', () => {
    expect(() => renderer.drawItsAliveScreen()).not.toThrow();
  });

  it('should draw EKG for all states without errors', () => {
    const states = [
      EKGState.STATE_CALM,
      EKGState.STATE_NERVOUS,
      EKGState.STATE_ANGRY,
      EKGState.STATE_FLATLINE,
      EKGState.STATE_ALIVE
    ];

    for (const state of states) {
      expect(() => {
        renderer.clear();
        renderer.drawEKG(state, 0, 0);
      }).not.toThrow();
    }
  });

  it('should draw EKG with madness level scaling', () => {
    expect(() => {
      renderer.clear();
      renderer.drawEKG(EKGState.STATE_ANGRY, 1000, 5);
    }).not.toThrow();
  });

  it('should draw surgeon character without errors', () => {
    // Create a simple test sprite sheet
    const spriteSheet = document.createElement('canvas');
    spriteSheet.width = 64;
    spriteSheet.height = 64;
    
    expect(() => {
      renderer.clear();
      renderer.drawSurgeon(spriteSheet, 0, 0, 64, 64, 100, 100);
    }).not.toThrow();
  });

  it('should draw all surgical object types without errors', () => {
    // Create a simple test sprite sheet
    const spriteSheet = document.createElement('canvas');
    spriteSheet.width = 48;
    spriteSheet.height = 48;

    expect(() => {
      renderer.clear();
      renderer.drawSurgicalObject(spriteSheet, 0, 0, 48, 48, 100, 100);
    }).not.toThrow();
  });

  it('should handle multiple rendering operations in sequence', () => {
    const spriteSheet = document.createElement('canvas');
    spriteSheet.width = 64;
    spriteSheet.height = 64;
    
    expect(() => {
      renderer.clear();
      renderer.drawPrompt('Test', 100);
      renderer.drawTimeIndicator(3, 5);
      renderer.drawEKG(EKGState.STATE_CALM, 0, 0);
      renderer.drawSurgeon(spriteSheet, 0, 0, 64, 64, 50, 50);
      renderer.applyScanlines();
      renderer.updateTexture();
    }).not.toThrow();
  });

  it('should dispose resources without errors', () => {
    expect(() => renderer.dispose()).not.toThrow();
  });

  it('should return valid canvas and context references', () => {
    const canvas = renderer.getCanvas();
    const ctx = renderer.getContext();
    const texture = renderer.getTexture();
    
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(ctx).toBeDefined();
    expect(texture).toBeInstanceOf(THREE.CanvasTexture);
  });
});
