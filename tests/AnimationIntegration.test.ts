/**
 * Integration tests for AnimationSystem and ScreenRenderer
 * Validates that animations can be rendered to the screen
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationSystem } from '../src/render/AnimationSystem';
import { ScreenRenderer } from '../src/render/ScreenRenderer';
import { SurgicalObjectType } from '../src/config/types';

describe('AnimationSystem + ScreenRenderer Integration', () => {
  let animationSystem: AnimationSystem;
  let screenRenderer: ScreenRenderer;

  beforeEach(() => {
    animationSystem = new AnimationSystem();
    screenRenderer = new ScreenRenderer();
  });

  it('should render surgeon animation frame to screen', () => {
    // Play animation
    animationSystem.playSurgeonAnimation('spray_disinfectant');
    
    // Get current frame
    const frameData = animationSystem.getSurgeonFrame();
    expect(frameData).not.toBeNull();
    
    if (frameData) {
      // Render to screen
      expect(() => {
        screenRenderer.clear();
        screenRenderer.drawSurgeon(
          frameData.spriteSheet,
          frameData.frame.x,
          frameData.frame.y,
          frameData.frame.width,
          frameData.frame.height,
          100,
          100
        );
        screenRenderer.updateTexture();
      }).not.toThrow();
    }
  });

  it('should render surgical object animation frame to screen', () => {
    // Play animation
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.ORGAN);
    
    // Get current frame
    const frameData = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.ORGAN);
    expect(frameData).not.toBeNull();
    
    if (frameData) {
      // Render to screen
      expect(() => {
        screenRenderer.clear();
        screenRenderer.drawSurgicalObject(
          frameData.spriteSheet,
          frameData.frame.x,
          frameData.frame.y,
          frameData.frame.width,
          frameData.frame.height,
          200,
          150
        );
        screenRenderer.updateTexture();
      }).not.toThrow();
    }
  });

  it('should render complete ritual step scene', () => {
    // Setup a complete scene with surgeon and surgical object
    animationSystem.playSurgeonAnimation('slice_incision');
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.SCALPEL);
    
    const surgeonFrame = animationSystem.getSurgeonFrame();
    const objectFrame = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.SCALPEL);
    
    expect(() => {
      screenRenderer.clear();
      
      // Draw prompt
      screenRenderer.drawPrompt('Slice Open: Move Joystick Up', 100);
      
      // Draw time indicator
      screenRenderer.drawTimeIndicator(3, 5);
      
      // Draw surgeon
      if (surgeonFrame) {
        screenRenderer.drawSurgeon(
          surgeonFrame.spriteSheet,
          surgeonFrame.frame.x,
          surgeonFrame.frame.y,
          surgeonFrame.frame.width,
          surgeonFrame.frame.height,
          150,
          200
        );
      }
      
      // Draw surgical object
      if (objectFrame) {
        screenRenderer.drawSurgicalObject(
          objectFrame.spriteSheet,
          objectFrame.frame.x,
          objectFrame.frame.y,
          objectFrame.frame.width,
          objectFrame.frame.height,
          250,
          220
        );
      }
      
      // Apply effects
      screenRenderer.applyScanlines();
      screenRenderer.updateTexture();
    }).not.toThrow();
  });

  it('should handle animation lifecycle with rendering', () => {
    // Start animation
    animationSystem.playSurgeonAnimation('remove_organ');
    expect(animationSystem.isSurgeonAnimationComplete()).toBe(false);
    
    // Render first frame
    let frameData = animationSystem.getSurgeonFrame();
    expect(frameData).not.toBeNull();
    
    // Update animation
    animationSystem.update(100);
    animationSystem.update(100);
    animationSystem.update(100);
    
    // Animation should be complete
    expect(animationSystem.isSurgeonAnimationComplete()).toBe(true);
    
    // Can still render final frame
    frameData = animationSystem.getSurgeonFrame();
    expect(frameData).not.toBeNull();
  });

  it('should render multiple surgical objects simultaneously', () => {
    // Play multiple object animations
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.ORGAN);
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.WIRES);
    
    const organFrame = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.ORGAN);
    const wiresFrame = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.WIRES);
    
    expect(() => {
      screenRenderer.clear();
      
      if (organFrame) {
        screenRenderer.drawSurgicalObject(
          organFrame.spriteSheet,
          organFrame.frame.x,
          organFrame.frame.y,
          organFrame.frame.width,
          organFrame.frame.height,
          100,
          150
        );
      }
      
      if (wiresFrame) {
        screenRenderer.drawSurgicalObject(
          wiresFrame.spriteSheet,
          wiresFrame.frame.x,
          wiresFrame.frame.y,
          wiresFrame.frame.width,
          wiresFrame.frame.height,
          200,
          150
        );
      }
      
      screenRenderer.updateTexture();
    }).not.toThrow();
  });

  it('should handle animation removal and cleanup', () => {
    // Start animations
    animationSystem.playSurgeonAnimation('connect_wires');
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.WIRES);
    
    // Verify they're active
    expect(animationSystem.getSurgeonFrame()).not.toBeNull();
    expect(animationSystem.getSurgicalObjectFrame(SurgicalObjectType.WIRES)).not.toBeNull();
    
    // Stop animations
    animationSystem.stopSurgeonAnimation();
    animationSystem.stopSurgicalObjectAnimation(SurgicalObjectType.WIRES);
    
    // Surgeon should return to idle
    const surgeonFrame = animationSystem.getSurgeonFrame();
    expect(surgeonFrame?.animationKey).toBe('idle');
    
    // Object should be null
    expect(animationSystem.getSurgicalObjectFrame(SurgicalObjectType.WIRES)).toBeNull();
  });
});
