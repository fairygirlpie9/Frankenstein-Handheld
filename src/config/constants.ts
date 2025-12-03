/**
 * Constants configuration for the Frankenstein Ritual Game
 * Following Mad Scientist Style Guide conventions
 */

import { EKGState, EKGPattern, InputAction, InteractiveMesh } from './types';

// EKG Pattern Data
export const EKG_PATTERNS: Record<EKGState, EKGPattern> = {
  [EKGState.STATE_CALM]: {
    state: EKGState.STATE_CALM,
    waveform: [0, 0, 2, 8, 2, 0, 0, 0],
    frequency: 0.5,
    amplitude: 1.0
  },
  [EKGState.STATE_NERVOUS]: {
    state: EKGState.STATE_NERVOUS,
    waveform: [0, 1, 3, 10, 3, 1, 0, 0],
    frequency: 0.8,
    amplitude: 1.2
  },
  [EKGState.STATE_ANGRY]: {
    state: EKGState.STATE_ANGRY,
    waveform: [0, 2, 5, 12, 5, 2, 0, 1, 0, 2],
    frequency: 1.5,
    amplitude: 1.5
  },
  [EKGState.STATE_FLATLINE]: {
    state: EKGState.STATE_FLATLINE,
    waveform: [0, 0, 0, 0, 0, 0],
    frequency: 0.1,
    amplitude: 0.1
  },
  [EKGState.STATE_ALIVE]: {
    state: EKGState.STATE_ALIVE,
    waveform: [0, 0, 3, 12, 3, 0, 0, 0],
    frequency: 1.0,
    amplitude: 1.8
  }
};

// Keyboard Mapping (Desktop)
export const KEYBOARD_MAP: Record<string, InputAction> = {
  'ArrowUp': InputAction.JOYSTICK_UP,
  'ArrowDown': InputAction.JOYSTICK_DOWN,
  'ArrowLeft': InputAction.JOYSTICK_LEFT,
  'ArrowRight': InputAction.JOYSTICK_RIGHT,
  'w': InputAction.DPAD_UP,
  'a': InputAction.DPAD_LEFT,
  's': InputAction.DPAD_DOWN,
  'd': InputAction.DPAD_RIGHT,
  'z': InputAction.BUTTON_A,
  'x': InputAction.BUTTON_B,
  'Enter': InputAction.BUTTON_START,
  'Escape': InputAction.BUTTON_PAUSE
};

// Interactive Mesh Mapping
// Note: Direction for joystick and d-pad determined by touch/key context
export const INTERACTIVE_MESHES: InteractiveMesh[] = [
  { name: 'Joystick', meshId: 'joystick', inputAction: InputAction.JOYSTICK_UP },
  { name: 'Button A', meshId: 'button_a', inputAction: InputAction.BUTTON_A },
  { name: 'Button B', meshId: 'button_b', inputAction: InputAction.BUTTON_B },
  { name: 'Button Start', meshId: 'button_start', inputAction: InputAction.BUTTON_START },
  { name: 'Button Pause', meshId: 'button_pause', inputAction: InputAction.BUTTON_PAUSE },
  { name: 'D-Pad', meshId: 'dpad', inputAction: InputAction.DPAD_UP }
];

// Timing Constants
export const TIMING = {
  INPUT_DEBOUNCE_MS: 50,            // Debounce delay for input (reduced for better responsiveness)
  ANIMATION_BOLT_SHAKE_MS: 300,     // Duration of bolt shake animation
  ANIMATION_EYE_GLOW_MS: 500,       // Duration of eye glow animation
  ANIMATION_STITCHES_PULSE_MS: 1000, // Duration of one stitch pulse cycle
  GLITCH_EFFECT_MS: 2000,           // Duration of glitch shader effect
  TIME_WARNING_THRESHOLD: 3,        // Seconds remaining to trigger warning
  FRAME_ANIMATION_MS: 100           // Frame duration for sprite animations
};

// Visual Constants
export const VISUAL = {
  SCREEN_WIDTH: 512,                // Canvas width for screen texture
  SCREEN_HEIGHT: 384,               // Canvas height for screen texture
  PIXEL_SIZE: 2,                    // Pixel art scaling factor
  SCANLINE_INTENSITY: 0.3,          // CRT scanline effect intensity
  GLITCH_INTENSITY: 0.8,            // Chromatic aberration intensity
  EKG_LINE_HEIGHT: 40,              // Height of EKG display area
  EKG_BASELINE_Y: 350               // Y position of EKG baseline
};

// Difficulty Scaling
export const DIFFICULTY = {
  TIME_REDUCTION_PER_LEVEL: 0.1,    // 10% time reduction per level
  STEPS_INCREASE_EVERY_N_LEVELS: 3, // Add step every 3 levels
  BASE_TIME_LIMIT: 5,               // Base seconds per step
  MIN_TIME_LIMIT: 1                 // Minimum seconds per step
};

// Mistake Thresholds for EKG State
export const MISTAKE_THRESHOLDS = {
  CALM: 0,                          // 0 mistakes = CALM
  NERVOUS: 1,                       // 1-2 mistakes = NERVOUS
  ANGRY: 3                          // 3+ mistakes = ANGRY
};
