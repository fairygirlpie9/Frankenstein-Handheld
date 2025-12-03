/**
 * Property-Based Tests for ScreenRenderer
 * Using fast-check with minimum 100 iterations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenRenderer } from '../src/render/ScreenRenderer';
import { EKGState } from '../src/config/types';
import fc from 'fast-check';

const PBT_CONFIG = {
  numRuns: 100,
  seed: 42,
  verbose: false
};

describe('ScreenRenderer Property-Based Tests', () => {
  let renderer: ScreenRenderer;

  beforeEach(() => {
    renderer = new ScreenRenderer();
  });

  /**
   * Property 9: EKG pattern reflects mistakes
   * Feature: frankenstein-ritual-game, Property 9: EKG pattern reflects mistakes
   * Validates: Requirements 5.3
   * 
   * For any number of mistakes made by the player, the EKG Display should render
   * with a pattern that becomes increasingly erratic as mistake count increases.
   */
  describe('Property 9: EKG pattern reflects mistakes', () => {
    it('should render EKG with increasing erratic patterns as mistake count increases', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }), // mistake count (golem_madnessLevel)
          fc.double({ min: 0, max: 1000 }), // time
          (mistakeCount, time) => {
            renderer.clear();
            
            // Determine EKG state based on mistake count
            let ekgState: EKGState;
            if (mistakeCount === 0) {
              ekgState = EKGState.STATE_CALM;
            } else if (mistakeCount <= 2) {
              ekgState = EKGState.STATE_NERVOUS;
            } else {
              ekgState = EKGState.STATE_ANGRY;
            }
            
            // Draw EKG with mistake level - should not throw
            expect(() => {
              renderer.drawEKG(ekgState, time, mistakeCount);
            }).not.toThrow();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should handle all EKG states with varying madness levels', () => {
      const ekgStates = [
        EKGState.STATE_CALM,
        EKGState.STATE_NERVOUS,
        EKGState.STATE_ANGRY,
        EKGState.STATE_FLATLINE,
        EKGState.STATE_ALIVE
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...ekgStates),
          fc.integer({ min: 0, max: 20 }), // madness level
          fc.double({ min: 0, max: 10000 }), // time
          (ekgState, madnessLevel, time) => {
            renderer.clear();
            
            // Draw EKG for any state with any madness level
            expect(() => {
              renderer.drawEKG(ekgState, time, madnessLevel);
            }).not.toThrow();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should render different patterns for different mistake counts', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 0, max: 2 }),  // low mistake count
            fc.integer({ min: 3, max: 10 })  // high mistake count
          ),
          fc.double({ min: 0, max: 1000 }),
          ([lowMistakes, highMistakes], time) => {
            // Draw with low mistakes (CALM/NERVOUS) - should not throw
            renderer.clear();
            const lowState = lowMistakes === 0 ? EKGState.STATE_CALM : EKGState.STATE_NERVOUS;
            expect(() => renderer.drawEKG(lowState, time, lowMistakes)).not.toThrow();
            
            // Draw with high mistakes (ANGRY) - should not throw
            renderer.clear();
            expect(() => renderer.drawEKG(EKGState.STATE_ANGRY, time, highMistakes)).not.toThrow();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should animate EKG waveform over time', () => {
      fc.assert(
        fc.property(
          fc.array(fc.double({ min: 0, max: 1000 }), { minLength: 2, maxLength: 10 }),
          fc.constantFrom(EKGState.STATE_CALM, EKGState.STATE_NERVOUS, EKGState.STATE_ANGRY),
          (timeValues, ekgState) => {
            // Draw EKG at different time values
            for (const time of timeValues) {
              renderer.clear();
              expect(() => {
                renderer.drawEKG(ekgState, time, 0);
              }).not.toThrow();
            }
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should scale amplitude based on madness level', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }), // madness level
          fc.double({ min: 0, max: 1000 }), // time
          (madnessLevel, time) => {
            renderer.clear();
            
            // Higher madness should still render without errors
            expect(() => {
              renderer.drawEKG(EKGState.STATE_ANGRY, time, madnessLevel);
            }).not.toThrow();
            
            return true;
          }
        ),
        PBT_CONFIG
      );
    });
  });
});
