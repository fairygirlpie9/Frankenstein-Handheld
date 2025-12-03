/**
 * Property-Based Tests for AnimationSystem surgeon and surgical object lifecycle
 * Using fast-check with minimum 100 iterations
 * 
 * Feature: frankenstein-ritual-game, Property 21: Surgeon character lifecycle
 * Feature: frankenstein-ritual-game, Property 22: Surgical object display
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationSystem } from '../src/render/AnimationSystem';
import { SurgicalObjectType } from '../src/config/types';
import fc from 'fast-check';

const PBT_CONFIG = {
  numRuns: 100,
  seed: 42,
  verbose: false
};

// Arbitraries for generating test data
const surgeonAnimationArb = fc.constantFrom(
  'idle',
  'spray_disinfectant',
  'slice_incision',
  'remove_organ',
  'connect_wires',
  'sew_stitches'
);

const surgicalObjectTypeArb = fc.constantFrom(
  SurgicalObjectType.ORGAN,
  SurgicalObjectType.WIRES,
  SurgicalObjectType.NEEDLE_THREAD,
  SurgicalObjectType.SCALPEL,
  SurgicalObjectType.DISINFECTANT,
  SurgicalObjectType.TOOLS
);

describe('AnimationSystem Property-Based Tests', () => {
  let animationSystem: AnimationSystem;

  beforeEach(() => {
    animationSystem = new AnimationSystem();
  });

  /**
   * Property 21: Surgeon character lifecycle
   * Feature: frankenstein-ritual-game, Property 21: Surgeon character lifecycle
   * Validates: Requirements 13.1, 13.2, 13.4
   * 
   * For any Ritual Step, the Surgeon Character should be displayed on the Screen Mesh,
   * animate when correct actions are performed, and transition to the next pose when
   * the step completes.
   */
  describe('Property 21: Surgeon character lifecycle', () => {
    it('should display surgeon for any ritual step animation', () => {
      fc.assert(
        fc.property(
          surgeonAnimationArb,
          (animationKey) => {
            // Play surgeon animation
            animationSystem.playSurgeonAnimation(animationKey);
            
            // Surgeon should be displayed (frame data should be available)
            const frame = animationSystem.getSurgeonFrame();
            expect(frame).not.toBeNull();
            expect(frame?.spriteSheet).toBeDefined();
            expect(frame?.frame).toBeDefined();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should animate surgeon when correct action is performed', () => {
      fc.assert(
        fc.property(
          surgeonAnimationArb,
          fc.integer({ min: 0, max: 500 }), // delta time
          (animationKey, deltaTime) => {
            // Play surgeon animation (simulating correct action)
            animationSystem.playSurgeonAnimation(animationKey);
            
            // Animation should not be complete initially
            expect(animationSystem.isSurgeonAnimationComplete()).toBe(false);
            
            // Update animation
            animationSystem.update(deltaTime);
            
            // Frame should still be available during animation
            const frame = animationSystem.getSurgeonFrame();
            expect(frame).not.toBeNull();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should transition surgeon to next pose when step completes', () => {
      fc.assert(
        fc.property(
          fc.array(surgeonAnimationArb, { minLength: 2, maxLength: 5 }),
          (animationSequence) => {
            // Simulate multiple ritual steps
            for (const animationKey of animationSequence) {
              // Start animation for this step
              animationSystem.playSurgeonAnimation(animationKey);
              
              // Verify animation is active (unless it's idle which loops)
              if (animationKey !== 'idle') {
                expect(animationSystem.isSurgeonAnimationComplete()).toBe(false);
              }
              
              // Complete the animation (3 frames * 100ms = 300ms)
              animationSystem.update(100);
              animationSystem.update(100);
              animationSystem.update(100);
              
              // Non-looping animations should be complete
              // Idle animation loops, so it never completes
              if (animationKey !== 'idle') {
                expect(animationSystem.isSurgeonAnimationComplete()).toBe(true);
              }
              
              // Frame should still be available (showing final pose)
              const frame = animationSystem.getSurgeonFrame();
              expect(frame).not.toBeNull();
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should maintain surgeon display throughout ritual step lifecycle', () => {
      fc.assert(
        fc.property(
          surgeonAnimationArb,
          fc.integer({ min: 1, max: 10 }), // number of update cycles
          (animationKey, updateCycles) => {
            // Start animation
            animationSystem.playSurgeonAnimation(animationKey);
            
            // Surgeon should be displayed throughout the lifecycle
            for (let i = 0; i < updateCycles; i++) {
              const frame = animationSystem.getSurgeonFrame();
              expect(frame).not.toBeNull();
              expect(frame?.spriteSheet).toBeDefined();
              
              // Update animation
              animationSystem.update(50);
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return to idle state when no animation is active', () => {
      fc.assert(
        fc.property(
          surgeonAnimationArb,
          (animationKey) => {
            // Play and complete animation
            animationSystem.playSurgeonAnimation(animationKey);
            animationSystem.update(100);
            animationSystem.update(100);
            animationSystem.update(100);
            
            // Stop animation
            animationSystem.stopSurgeonAnimation();
            
            // Should return to idle
            const frame = animationSystem.getSurgeonFrame();
            expect(frame).not.toBeNull();
            expect(frame?.animationKey).toBe('idle');
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should handle rapid animation transitions without errors', () => {
      fc.assert(
        fc.property(
          fc.array(surgeonAnimationArb, { minLength: 5, maxLength: 20 }),
          (animationSequence) => {
            // Rapidly switch between animations
            for (const animationKey of animationSequence) {
              expect(() => {
                animationSystem.playSurgeonAnimation(animationKey);
                const frame = animationSystem.getSurgeonFrame();
                expect(frame).not.toBeNull();
              }).not.toThrow();
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });
  });

  /**
   * Property 22: Surgical object display
   * Feature: frankenstein-ritual-game, Property 22: Surgical object display
   * Validates: Requirements 14.1, 14.8
   * 
   * For any Ritual Step that involves a Surgical Object, that object should be
   * displayed on the Screen Mesh and removed or transitioned appropriately when
   * the animation completes.
   */
  describe('Property 22: Surgical object display', () => {
    it('should display surgical object for any ritual step that involves one', () => {
      fc.assert(
        fc.property(
          surgicalObjectTypeArb,
          (objectType) => {
            // Play surgical object animation
            animationSystem.playSurgicalObjectAnimation(objectType);
            
            // Object should be displayed (frame data should be available)
            const frame = animationSystem.getSurgicalObjectFrame(objectType);
            expect(frame).not.toBeNull();
            expect(frame?.spriteSheet).toBeDefined();
            expect(frame?.frame).toBeDefined();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should remove surgical object when animation completes', () => {
      fc.assert(
        fc.property(
          surgicalObjectTypeArb,
          (objectType) => {
            // Play surgical object animation
            animationSystem.playSurgicalObjectAnimation(objectType);
            
            // Object should be displayed initially
            expect(animationSystem.getSurgicalObjectFrame(objectType)).not.toBeNull();
            
            // Complete animation
            animationSystem.update(100);
            animationSystem.update(100);
            
            // Stop/remove object
            animationSystem.stopSurgicalObjectAnimation(objectType);
            
            // Object should be removed (frame should be null)
            const frame = animationSystem.getSurgicalObjectFrame(objectType);
            expect(frame).toBeNull();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should handle multiple surgical objects simultaneously', () => {
      fc.assert(
        fc.property(
          fc.array(surgicalObjectTypeArb, { minLength: 2, maxLength: 6 }),
          (objectTypes) => {
            // Remove duplicates
            const uniqueObjects = Array.from(new Set(objectTypes));
            
            // Play animations for all objects
            for (const objectType of uniqueObjects) {
              animationSystem.playSurgicalObjectAnimation(objectType);
            }
            
            // All objects should be displayed
            for (const objectType of uniqueObjects) {
              const frame = animationSystem.getSurgicalObjectFrame(objectType);
              expect(frame).not.toBeNull();
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should transition surgical objects appropriately across ritual steps', () => {
      fc.assert(
        fc.property(
          fc.array(surgicalObjectTypeArb, { minLength: 2, maxLength: 5 }),
          (objectSequence) => {
            // Simulate ritual steps with different objects
            for (const objectType of objectSequence) {
              // Start object animation for this step
              animationSystem.playSurgicalObjectAnimation(objectType);
              
              // Object should be displayed
              expect(animationSystem.getSurgicalObjectFrame(objectType)).not.toBeNull();
              
              // Update animation
              animationSystem.update(100);
              
              // Complete and remove object
              animationSystem.stopSurgicalObjectAnimation(objectType);
              
              // Object should be removed
              expect(animationSystem.getSurgicalObjectFrame(objectType)).toBeNull();
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should maintain surgical object display throughout animation lifecycle', () => {
      fc.assert(
        fc.property(
          surgicalObjectTypeArb,
          fc.integer({ min: 1, max: 10 }), // number of update cycles
          (objectType, updateCycles) => {
            // Start object animation
            animationSystem.playSurgicalObjectAnimation(objectType);
            
            // Object should be displayed throughout the lifecycle
            for (let i = 0; i < updateCycles; i++) {
              const frame = animationSystem.getSurgicalObjectFrame(objectType);
              expect(frame).not.toBeNull();
              expect(frame?.spriteSheet).toBeDefined();
              
              // Update animation
              animationSystem.update(50);
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should handle cleanup of multiple objects correctly', () => {
      fc.assert(
        fc.property(
          fc.array(surgicalObjectTypeArb, { minLength: 2, maxLength: 6 }),
          (objectTypes) => {
            // Remove duplicates
            const uniqueObjects = Array.from(new Set(objectTypes));
            
            // Play animations for all objects
            for (const objectType of uniqueObjects) {
              animationSystem.playSurgicalObjectAnimation(objectType);
            }
            
            // Remove all objects
            for (const objectType of uniqueObjects) {
              animationSystem.stopSurgicalObjectAnimation(objectType);
            }
            
            // All objects should be removed
            for (const objectType of uniqueObjects) {
              const frame = animationSystem.getSurgicalObjectFrame(objectType);
              expect(frame).toBeNull();
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should not interfere with surgeon animation when displaying objects', () => {
      fc.assert(
        fc.property(
          surgeonAnimationArb,
          surgicalObjectTypeArb,
          (surgeonAnim, objectType) => {
            // Play both surgeon and object animations
            animationSystem.playSurgeonAnimation(surgeonAnim);
            animationSystem.playSurgicalObjectAnimation(objectType);
            
            // Both should be displayed
            const surgeonFrame = animationSystem.getSurgeonFrame();
            const objectFrame = animationSystem.getSurgicalObjectFrame(objectType);
            
            expect(surgeonFrame).not.toBeNull();
            expect(objectFrame).not.toBeNull();
            
            // Update both
            animationSystem.update(100);
            
            // Both should still be available
            expect(animationSystem.getSurgeonFrame()).not.toBeNull();
            expect(animationSystem.getSurgicalObjectFrame(objectType)).not.toBeNull();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should handle object animation completion status correctly', () => {
      fc.assert(
        fc.property(
          surgicalObjectTypeArb,
          (objectType) => {
            // Initially, animation should be complete (not active)
            expect(animationSystem.isSurgicalObjectAnimationComplete(objectType)).toBe(true);
            
            // Start animation
            animationSystem.playSurgicalObjectAnimation(objectType);
            expect(animationSystem.isSurgicalObjectAnimationComplete(objectType)).toBe(false);
            
            // Complete animation (single frame, so completes quickly)
            animationSystem.update(100);
            animationSystem.update(100);
            expect(animationSystem.isSurgicalObjectAnimationComplete(objectType)).toBe(true);
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });
  });

  /**
   * Combined lifecycle test: Surgeon and surgical objects working together
   */
  describe('Combined surgeon and object lifecycle', () => {
    it('should handle complete ritual step with both surgeon and object', () => {
      fc.assert(
        fc.property(
          surgeonAnimationArb,
          surgicalObjectTypeArb,
          fc.integer({ min: 1, max: 5 }), // number of steps
          (surgeonAnim, objectType, stepCount) => {
            // Simulate multiple ritual steps
            for (let i = 0; i < stepCount; i++) {
              // Start step: play both animations
              animationSystem.playSurgeonAnimation(surgeonAnim);
              animationSystem.playSurgicalObjectAnimation(objectType);
              
              // Both should be displayed
              expect(animationSystem.getSurgeonFrame()).not.toBeNull();
              expect(animationSystem.getSurgicalObjectFrame(objectType)).not.toBeNull();
              
              // Update animations
              animationSystem.update(100);
              animationSystem.update(100);
              animationSystem.update(100);
              
              // Complete step: cleanup
              animationSystem.stopSurgicalObjectAnimation(objectType);
              
              // Object should be removed, surgeon should still be available
              expect(animationSystem.getSurgicalObjectFrame(objectType)).toBeNull();
              expect(animationSystem.getSurgeonFrame()).not.toBeNull();
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });
  });
});
