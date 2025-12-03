/**
 * Core type definitions for the Frankenstein Ritual Game
 * Following Mad Scientist Style Guide naming conventions
 */

import * as THREE from 'three';

// FSM States (SCREAMING_SNAKE_CASE per style guide)
export enum GameState {
  STATE_IDLE = 'STATE_IDLE',
  STATE_RITUAL_STEP = 'STATE_RITUAL_STEP',
  STATE_MONSTER_MAD = 'STATE_MONSTER_MAD',
  STATE_ITS_ALIVE = 'STATE_ITS_ALIVE'
}

// Input Actions
export enum InputAction {
  JOYSTICK_UP = 'JOYSTICK_UP',
  JOYSTICK_DOWN = 'JOYSTICK_DOWN',
  JOYSTICK_LEFT = 'JOYSTICK_LEFT',
  JOYSTICK_RIGHT = 'JOYSTICK_RIGHT',
  BUTTON_A = 'BUTTON_A',
  BUTTON_B = 'BUTTON_B',
  BUTTON_START = 'BUTTON_START',
  BUTTON_PAUSE = 'BUTTON_PAUSE',
  DPAD_UP = 'DPAD_UP',
  DPAD_DOWN = 'DPAD_DOWN',
  DPAD_LEFT = 'DPAD_LEFT',
  DPAD_RIGHT = 'DPAD_RIGHT'
}

// EKG State (SCREAMING_SNAKE_CASE per style guide)
export enum EKGState {
  STATE_CALM = 'STATE_CALM',
  STATE_NERVOUS = 'STATE_NERVOUS',
  STATE_ANGRY = 'STATE_ANGRY',
  STATE_FLATLINE = 'STATE_FLATLINE',
  STATE_ALIVE = 'STATE_ALIVE'
}

// Surgical Object Types
export enum SurgicalObjectType {
  ORGAN = 'ORGAN',
  WIRES = 'WIRES',
  NEEDLE_THREAD = 'NEEDLE_THREAD',
  SCALPEL = 'SCALPEL',
  DISINFECTANT = 'DISINFECTANT',
  TOOLS = 'TOOLS'
}

// Ritual Step Definition
export interface RitualStep {
  name: string;                    // e.g., "Slice Open"
  promptText: string;              // e.g., "Slice Open: Move Joystick Up"
  correctAction: InputAction;      // Required input to complete step
  timeLimit: number;               // Seconds allowed for this step
  surgicalObject?: SurgicalObjectType; // Optional object to display
  surgeonAnimation: string;        // Animation key for surgeon sprite
}

// Ritual Definition (a complete level)
export interface Ritual {
  levelNumber: number;
  steps: RitualStep[];
  baseTimeLimit: number;           // Base time for each step
  timeLimitMultiplier: number;     // Difficulty scaling factor
}

// Interactive Mesh Reference
export interface InteractiveMesh {
  name: string;                    // Human-readable name
  meshId: string;                  // Mesh name in franken.glb
  inputAction: InputAction;        // Action triggered by this mesh
  mesh?: THREE.Mesh;               // Reference to loaded mesh
}

// Game State Data (golem_ prefix for monster state variables per style guide)
export interface GameStateData {
  currentState: GameState;
  currentRitual: Ritual;
  currentStepIndex: number;
  mistakeCount: number;
  timeRemaining: number;
  golem_current_state: EKGState;        // Monster's emotional state
  golem_madnessLevel: number;           // Accumulated mistakes/anger
  levelNumber: number;
}

// EKG Pattern Data
export interface EKGPattern {
  state: EKGState;
  waveform: number[];  // Y-coordinates for drawing
  frequency: number;   // How fast the wave moves
  amplitude: number;   // Wave height
}

// Animation Event
export interface AnimationEvent {
  type: 'surgeon' | 'surgical_object' | '3d_mesh' | 'screen_effect';
  target: string;                  // Animation identifier
  duration: number;                // Milliseconds
  onComplete?: () => void;
}

// Screen Renderer Config
export interface ScreenRenderConfig {
  width: number;                   // Canvas width
  height: number;                  // Canvas height
  pixelSize: number;               // Pixel art scaling factor
  scanlineIntensity: number;       // CRT effect intensity (0-1)
  glitchIntensity: number;         // Chromatic aberration intensity (0-1)
}
