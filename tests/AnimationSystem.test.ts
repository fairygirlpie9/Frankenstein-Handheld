/**
 * Unit tests for AnimationSystem
 * Focus on animation lifecycle and frame management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationSystem } from '../src/render/AnimationSystem';
import { SurgicalObjectType } from '../src/config/types';

describe('AnimationSystem', () => {
  let animationSystem: AnimationSystem;

  beforeEach(() => {
    animationSystem = new AnimationSystem();
  });

  it('should initialize without errors', () => {
    expect(animationSystem).toBeDefined();
  });

  it('should provide list of available surgeon animations', () => {
    const animations = animationSystem.getAvailableSurgeonAnimations();
    expect(animations).toContain('idle');
    expect(animations).toContain('spray_disinfectant');
    expect(animations).toContain('slice_incision');
    expect(animations).toContain('remove_organ');
    expect(animations).toContain('connect_wires');
    expect(animations).toContain('sew_stitches');
  });

  it('should provide list of available surgical objects', () => {
    const objects = animationSystem.getAvailableSurgicalObjects();
    expect(objects).toContain(SurgicalObjectType.ORGAN);
    expect(objects).toContain(SurgicalObjectType.WIRES);
    expect(objects).toContain(SurgicalObjectType.NEEDLE_THREAD);
    expect(objects).toContain(SurgicalObjectType.SCALPEL);
    expect(objects).toContain(SurgicalObjectType.DISINFECTANT);
    expect(objects).toContain(SurgicalObjectType.TOOLS);
  });

  it('should return idle frame by default', () => {
    const frame = animationSystem.getSurgeonFrame();
    expect(frame).not.toBeNull();
    expect(frame?.animationKey).toBe('idle');
    expect(frame?.spriteSheet).toBeDefined();
  });

  it('should play surgeon animation', () => {
    animationSystem.playSurgeonAnimation('spray_disinfectant');
    const frame = animationSystem.getSurgeonFrame();
    expect(frame).not.toBeNull();
    expect(frame?.spriteSheet).toBeDefined();
  });

  it('should play surgical object animation', () => {
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.ORGAN);
    const frame = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.ORGAN);
    expect(frame).not.toBeNull();
    expect(frame?.spriteSheet).toBeDefined();
  });

  it('should return null for inactive surgical object', () => {
    const frame = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.ORGAN);
    expect(frame).toBeNull();
  });

  it('should update animations over time', () => {
    animationSystem.playSurgeonAnimation('spray_disinfectant');
    
    // Update with delta time
    animationSystem.update(50);
    expect(animationSystem.isSurgeonAnimationComplete()).toBe(false);
    
    // Update enough to complete animation (3 frames * 100ms = 300ms)
    // Need to call update multiple times to advance through frames
    animationSystem.update(100);
    animationSystem.update(100);
    animationSystem.update(100);
    expect(animationSystem.isSurgeonAnimationComplete()).toBe(true);
  });

  it('should stop surgeon animation', () => {
    animationSystem.playSurgeonAnimation('spray_disinfectant');
    animationSystem.stopSurgeonAnimation();
    
    const frame = animationSystem.getSurgeonFrame();
    expect(frame?.animationKey).toBe('idle');
  });

  it('should stop surgical object animation', () => {
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.ORGAN);
    animationSystem.stopSurgicalObjectAnimation(SurgicalObjectType.ORGAN);
    
    const frame = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.ORGAN);
    expect(frame).toBeNull();
  });

  it('should handle multiple surgical object animations simultaneously', () => {
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.ORGAN);
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.WIRES);
    
    const organFrame = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.ORGAN);
    const wiresFrame = animationSystem.getSurgicalObjectFrame(SurgicalObjectType.WIRES);
    
    expect(organFrame).not.toBeNull();
    expect(wiresFrame).not.toBeNull();
  });

  it('should handle animation completion status correctly', () => {
    expect(animationSystem.isSurgeonAnimationComplete()).toBe(true);
    
    animationSystem.playSurgeonAnimation('spray_disinfectant');
    expect(animationSystem.isSurgeonAnimationComplete()).toBe(false);
  });

  it('should handle surgical object animation completion status', () => {
    expect(animationSystem.isSurgicalObjectAnimationComplete(SurgicalObjectType.ORGAN)).toBe(true);
    
    animationSystem.playSurgicalObjectAnimation(SurgicalObjectType.ORGAN);
    expect(animationSystem.isSurgicalObjectAnimationComplete(SurgicalObjectType.ORGAN)).toBe(false);
  });

  it('should handle unknown animation gracefully', () => {
    expect(() => {
      animationSystem.playSurgeonAnimation('unknown_animation');
    }).not.toThrow();
  });

  it('should load sprite sheets without errors', () => {
    const img = new Image();
    expect(() => {
      animationSystem.loadSurgeonAnimations(img);
      animationSystem.loadSurgicalObjectAnimations(img);
    }).not.toThrow();
  });
});
