# Design Document

## Overview

The Frankenstein Ritual Game is a browser-based interactive experience that combines 3D rendering (three.js) with 2D retro-style gameplay. The architecture separates concerns into distinct layers: 3D scene management, 2D screen rendering, game state management (FSM), input handling, and animation systems. The game renders a 3D Frankenstein handheld console model and projects 2D gameplay graphics onto the console's screen mesh, creating the illusion of a functional retro gaming device.

The core gameplay loop involves players following on-screen prompts to perform surgical actions using the console's interactive elements (joystick, buttons, d-pad). A finite state machine manages transitions between IDLE, RITUAL_STEP, MONSTER_MAD, and ITS_ALIVE states. Visual feedback occurs both on the 2D screen (prompts, EKG, surgeon animations, surgical objects) and through 3D model animations (bolt shaking, eye glowing, stitches pulsing).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │  Input Manager │────────▶│   Game FSM       │            │
│  │  (Keyboard/    │         │  (State Machine) │            │
│  │   Touch)       │         └────────┬─────────┘            │
│  └────────────────┘                  │                      │
│                                      │                      │
│                    ┌─────────────────▼─────────────────┐    │
│                    │    Game Controller                │    │
│                    │  (Orchestrates all systems)       │    │
│                    └─────────────────┬─────────────────┘    │
│                                      │                      │
│         ┌────────────────────────────┼────────────────┐     │
│         │                            │                │     │
│    ┌────▼─────┐            ┌────────▼──────┐   ┌─────▼────┐│
│    │ 3D Scene │            │ 2D Screen     │   │Animation │││
│    │ Manager  │            │ Renderer      │   │ System   │││
│    │(three.js)│            │(Canvas/WebGL) │   │          │││
│    └────┬─────┘            └────────┬──────┘   └─────┬────┘│
│         │                           │                │     │
│         │                           │                │     │
│    ┌────▼──────────────────────────▼────────────────▼────┐ │
│    │              Render Pipeline                         │ │
│    │  (Combines 3D scene + 2D screen texture)            │ │
│    └──────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Input Manager**
- Detects keyboard events (desktop) and touch events (mobile)
- Maps raw input to game actions (e.g., "joystick_up", "button_3_press")
- Provides raycasting for 3D mesh interaction on mobile
- Emits input events to Game Controller

**Game FSM**
- Maintains current game state (IDLE, RITUAL_STEP, MONSTER_MAD, ITS_ALIVE)
- Validates state transitions based on game rules
- Tracks ritual progress (current step, mistakes, time remaining)
- Emits state change events

**Game Controller**
- Central orchestrator receiving input events and state changes
- Validates player actions against current ritual step requirements
- Triggers animations on 3D Scene Manager and 2D Screen Renderer
- Manages level progression and difficulty scaling
- Coordinates timing and countdown logic

**3D Scene Manager**
- Loads and manages the franken.glb model
- Provides references to named meshes (bolts, eyes, stitches, screen, buttons, etc.)
- Applies animations to 3D meshes (shaking, glowing, pulsing)
- Handles camera positioning and lighting
- Manages raycasting for touch input

**2D Screen Renderer**
- Renders retro-style graphics to a canvas texture
- Draws prompts, EKG line, time indicator, surgeon character, surgical objects
- Applies post-processing effects (CRT scanlines, glitch shader)
- Maps canvas texture to the screen mesh material

**Animation System**
- Manages sprite animations for surgeon character
- Handles surgical object animations (organs, wires, tools)
- Controls timing and sequencing of visual effects
- Provides animation state callbacks

## Components and Interfaces

### Technology Stack

**Mandatory Technologies (per Mad Scientist Style Guide):**
- **Core Rendering**: three.js (sole 3D rendering engine)
- **Logic & Types**: TypeScript (all game logic and data typing)
- **Animations**: Tween.js (all 3D object and camera animations)
- **Lighting**: Custom light types adapted from drei concepts

### TypeScript Interfaces

```typescript
// FSM States (SCREAMING_SNAKE_CASE per style guide)
enum GameState {
  STATE_IDLE = 'STATE_IDLE',
  STATE_RITUAL_STEP = 'STATE_RITUAL_STEP',
  STATE_MONSTER_MAD = 'STATE_MONSTER_MAD',
  STATE_ITS_ALIVE = 'STATE_ITS_ALIVE'
}

// Input Actions
enum InputAction {
  JOYSTICK_UP = 'JOYSTICK_UP',
  JOYSTICK_DOWN = 'JOYSTICK_DOWN',
  JOYSTICK_LEFT = 'JOYSTICK_LEFT',
  JOYSTICK_RIGHT = 'JOYSTICK_RIGHT',
  BUTTON_3 = 'BUTTON_3',
  BUTTON_4 = 'BUTTON_4',
  BUTTON_START = 'BUTTON_START',
  BUTTON_PAUSE = 'BUTTON_PAUSE',
  DPAD_UP = 'DPAD_UP',
  DPAD_DOWN = 'DPAD_DOWN',
  DPAD_LEFT = 'DPAD_LEFT',
  DPAD_RIGHT = 'DPAD_RIGHT'
}

// Ritual Step Definition
interface RitualStep {
  name: string;                    // e.g., "Slice Open"
  promptText: string;              // e.g., "Slice Open: Move Joystick Up"
  correctAction: InputAction;      // Required input to complete step
  timeLimit: number;               // Seconds allowed for this step
  surgicalObject?: SurgicalObjectType; // Optional object to display
  surgeonAnimation: string;        // Animation key for surgeon sprite
}

// Ritual Definition (a complete level)
interface Ritual {
  levelNumber: number;
  steps: RitualStep[];
  baseTimeLimit: number;           // Base time for each step
  timeLimitMultiplier: number;     // Difficulty scaling factor
}

// Interactive Mesh Reference
interface InteractiveMesh {
  name: string;                    // Human-readable name
  meshId: string;                  // Mesh name in franken.glb
  inputAction: InputAction;        // Action triggered by this mesh
  mesh?: THREE.Mesh;               // Reference to loaded mesh
}

// Surgical Object Types
enum SurgicalObjectType {
  ORGAN = 'ORGAN',
  WIRES = 'WIRES',
  NEEDLE_THREAD = 'NEEDLE_THREAD',
  SCALPEL = 'SCALPEL',
  DISINFECTANT = 'DISINFECTANT',
  TOOLS = 'TOOLS'
}

// EKG State (SCREAMING_SNAKE_CASE per style guide)
enum EKGState {
  STATE_CALM = 'STATE_CALM',
  STATE_NERVOUS = 'STATE_NERVOUS',
  STATE_ANGRY = 'STATE_ANGRY',
  STATE_FLATLINE = 'STATE_FLATLINE',
  STATE_ALIVE = 'STATE_ALIVE'
}

// Game State Data (golem_ prefix for monster state variables per style guide)
interface GameStateData {
  currentState: GameState;
  currentRitual: Ritual;
  currentStepIndex: number;
  mistakeCount: number;
  timeRemaining: number;
  golem_current_state: EKGState;        // Monster's emotional state
  golem_madnessLevel: number;           // Accumulated mistakes/anger
  levelNumber: number;
}

// Animation Event
interface AnimationEvent {
  type: 'surgeon' | 'surgical_object' | '3d_mesh' | 'screen_effect';
  target: string;                  // Animation identifier
  duration: number;                // Milliseconds
  onComplete?: () => void;
}

// Screen Renderer Config
interface ScreenRenderConfig {
  width: number;                   // Canvas width
  height: number;                  // Canvas height
  pixelSize: number;               // Pixel art scaling factor
  scanlineIntensity: number;       // CRT effect intensity (0-1)
  glitchIntensity: number;         // Chromatic aberration intensity (0-1)
}
```

### Directory Structure (per Mad Scientist Style Guide)

```
project-root/
├── src/
│   ├── logic/              # FSM and core game rules
│   │   ├── GameFSM.ts
│   │   └── RitualLogic.ts
│   ├── render/             # three.js scene setup and visual effects
│   │   ├── SceneManager.ts
│   │   ├── ScreenRenderer.ts
│   │   └── AnimationSystem.ts
│   ├── config/             # Constants and configuration
│   │   ├── constants.ts
│   │   ├── rituals.ts
│   │   └── inputMappings.ts
│   └── main.ts             # Entry point
├── assets/
│   └── models/
│       └── franken.glb     # 3D model
└── tests/                  # Unit and property tests
```

### Component Classes

```typescript
// src/logic/GameFSM.ts
class GameFSM {
  private state: GameState;
  private stateData: GameStateData;
  
  constructor(initialRitual: Ritual);
  
  // State queries
  getCurrentState(): GameState;
  getStateData(): GameStateData;
  
  // State transitions (SCREAMING_SNAKE_CASE per style guide)
  TRANSITION_TO_STATE(newState: GameState): boolean;
  ADVANCE_RITUAL_STEP(): boolean;
  REGISTER_MISTAKE(): void;
  
  // Time management
  updateTime(deltaTime: number): void;
  
  // Event emitter
  on(event: 'stateChange', callback: (newState: GameState) => void): void;
}

// src/logic/RitualLogic.ts
// Core ritual functions (SCREAMING_SNAKE_CASE per style guide)
function START_RITUAL_SEQUENCE(ritual: Ritual): void;
function VALIDATE_RITUAL_ACTION(action: InputAction, expectedAction: InputAction): boolean;
function COMPLETE_RITUAL_STEP(fsm: GameFSM): void;
function HANDLE_RITUAL_FAILURE(fsm: GameFSM): void;

// src/render/SceneManager.ts
class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private interactiveMeshes: Map<string, InteractiveMesh>;
  
  constructor();
  
  // Model loading
  async LOAD_MODEL(path: string): Promise<void>;
  
  // Mesh access
  getMesh(meshId: string): THREE.Mesh | undefined;
  getInteractiveMeshes(): InteractiveMesh[];
  
  // Animations using Tween.js (per style guide)
  ANIMATE_BOLTS(duration: number): void;
  ANIMATE_EYES(intensity: number, duration: number): void;
  ANIMATE_STITCHES(): void; // Continuous pulsing
  
  // Rendering
  render(): void;
}

// src/render/ScreenRenderer.ts
class ScreenRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private config: ScreenRenderConfig;
  
  constructor(config: ScreenRenderConfig);
  
  // Get texture for screen mesh
  getTexture(): THREE.CanvasTexture;
  
  // Drawing methods
  clear(): void;
  drawPrompt(text: string, y: number): void;
  drawEKG(golem_state: EKGState, time: number): void;  // golem_ prefix per style guide
  drawTimeIndicator(timeRemaining: number, timeLimit: number): void;
  drawSurgeon(animationFrame: string, x: number, y: number): void;
  drawSurgicalObject(objectType: SurgicalObjectType, frame: number): void;
  drawIdleScreen(): void;
  drawItsAliveScreen(): void;
  
  // Effects
  applyScanlines(): void;
  applyGlitchEffect(intensity: number): void;
  
  // Update texture
  updateTexture(): void;
}

// src/render/AnimationSystem.ts
class AnimationSystem {
  private animations: Map<string, Animation>;
  private activeAnimations: AnimationEvent[];
  
  constructor();
  
  // Load sprite sheets and animation data
  loadSurgeonAnimations(spriteSheet: HTMLImageElement): void;
  loadSurgicalObjectAnimations(spriteSheet: HTMLImageElement): void;
  
  // Play animations
  playSurgeonAnimation(animationKey: string): void;
  playSurgicalObjectAnimation(objectType: SurgicalObjectType): void;
  
  // Get current frame
  getSurgeonFrame(): string;
  getSurgicalObjectFrame(objectType: SurgicalObjectType): number;
  
  // Update animations
  update(deltaTime: number): void;
}

// Input handling (separate from rendering)
class InputManager {
  constructor(scene: THREE.Scene, camera: THREE.Camera);
  
  // Setup input listeners
  initKeyboardInput(): void;
  initTouchInput(): void;
  
  // Map keys to actions
  mapKeyToAction(key: string, action: InputAction): void;
  
  // Raycasting for touch
  getTouchedMesh(touchX: number, touchY: number): THREE.Mesh | null;
  
  // Core input handler (SCREAMING_SNAKE_CASE per style guide)
  HANDLE_BUTTON_PRESS(action: InputAction): void;
  
  // Event emitter
  on(event: 'input', callback: (action: InputAction) => void): void;
}

// Main game controller
class GameController {
  private fsm: GameFSM;
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private screenRenderer: ScreenRenderer;
  private animationSystem: AnimationSystem;
  
  constructor(/* dependencies */);
  
  // Main game loop
  update(deltaTime: number): void;
  
  // Handle input
  handleInput(action: InputAction): void;
  
  // Validate action against current step
  validateAction(action: InputAction): boolean;
  
  // Trigger feedback
  triggerCorrectFeedback(): void;
  triggerIncorrectFeedback(): void;
  
  // Level management
  startLevel(levelNumber: number): void;
  completeLevel(): void;
}
```

## Data Models

### Ritual Data Structure

Rituals are defined as JSON configurations that can be loaded dynamically:

```json
{
  "levelNumber": 1,
  "baseTimeLimit": 5,
  "timeLimitMultiplier": 1.0,
  "steps": [
    {
      "name": "Disinfect",
      "promptText": "Disinfect: Press Button 3",
      "correctAction": "BUTTON_3",
      "timeLimit": 5,
      "surgicalObject": "DISINFECTANT",
      "surgeonAnimation": "spray_disinfectant"
    },
    {
      "name": "Slice Open",
      "promptText": "Slice Open: Move Joystick Up",
      "correctAction": "JOYSTICK_UP",
      "timeLimit": 5,
      "surgicalObject": "SCALPEL",
      "surgeonAnimation": "slice_incision"
    },
    {
      "name": "Remove Organ",
      "promptText": "Remove Organ: Press Button 4",
      "correctAction": "BUTTON_4",
      "timeLimit": 5,
      "surgicalObject": "ORGAN",
      "surgeonAnimation": "remove_organ"
    },
    {
      "name": "Connect Wires",
      "promptText": "Connect Wires: D-Pad Right",
      "correctAction": "DPAD_RIGHT",
      "timeLimit": 5,
      "surgicalObject": "WIRES",
      "surgeonAnimation": "connect_wires"
    },
    {
      "name": "Sew Shut",
      "promptText": "Sew Shut: Move Joystick Down",
      "correctAction": "JOYSTICK_DOWN",
      "timeLimit": 5,
      "surgicalObject": "NEEDLE_THREAD",
      "surgeonAnimation": "sew_stitches"
    }
  ]
}
```

### Interactive Mesh Mapping

```typescript
const INTERACTIVE_MESHES: InteractiveMesh[] = [
  { name: 'Joystick', meshId: 'joystick', inputAction: InputAction.JOYSTICK_UP }, // Direction determined by touch/key
  { name: 'Button 3', meshId: 'button_3', inputAction: InputAction.BUTTON_3 },
  { name: 'Button 4', meshId: 'button_4', inputAction: InputAction.BUTTON_4 },
  { name: 'Button Start', meshId: 'button_start', inputAction: InputAction.BUTTON_START },
  { name: 'Button Pause', meshId: 'button_pause', inputAction: InputAction.BUTTON_PAUSE },
  { name: 'D-Pad', meshId: 'dpad', inputAction: InputAction.DPAD_UP } // Direction determined by touch/key
];
```

### Keyboard Mapping (Desktop)

```typescript
const KEYBOARD_MAP: Record<string, InputAction> = {
  'ArrowUp': InputAction.JOYSTICK_UP,
  'ArrowDown': InputAction.JOYSTICK_DOWN,
  'ArrowLeft': InputAction.JOYSTICK_LEFT,
  'ArrowRight': InputAction.JOYSTICK_RIGHT,
  'w': InputAction.DPAD_UP,
  's': InputAction.DPAD_DOWN,
  'a': InputAction.DPAD_LEFT,
  'd': InputAction.DPAD_RIGHT,
  'z': InputAction.BUTTON_3,
  'x': InputAction.BUTTON_4,
  'Enter': InputAction.BUTTON_START,
  'Escape': InputAction.BUTTON_PAUSE
};
```

### EKG Pattern Data

```typescript
interface EKGPattern {
  state: EKGState;
  waveform: number[];  // Y-coordinates for drawing
  frequency: number;   // How fast the wave moves
  amplitude: number;   // Wave height
}

// src/config/constants.ts
const EKG_PATTERNS: Record<EKGState, EKGPattern> = {
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
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Input mapping correctness

*For any* mapped keyboard key or interactive mesh touch, triggering that input should produce the correct corresponding Input Action immediately.

**Validates: Requirements 2.1, 2.3, 2.4**

### Property 2: Visual feedback for input actions

*For any* Input Action triggered, the Game System should provide visual feedback either on the Interactive Mesh or on the Screen Mesh.

**Validates: Requirements 2.5**

### Property 3: Prompt display correctness

*For any* Ritual Step that begins, the Game System should display a prompt on the Screen Mesh that includes both the action name and the required input.

**Validates: Requirements 3.1, 3.2**

### Property 4: Prompt transitions

*For any* Ritual Step that is completed, the Game System should clear the current prompt and either display the next prompt or transition to ITS_ALIVE state if all steps are complete.

**Validates: Requirements 3.4**

### Property 5: Incorrect action feedback

*For any* incorrect Input Action performed during a Ritual Step, the Game System should animate both the bolt meshes (shaking) and eye meshes (glowing).

**Validates: Requirements 4.1, 4.2**

### Property 6: Stitches pulse in active states

*For any* active game state (not IDLE), the stitches mesh should continuously pulse intermittently.

**Validates: Requirements 4.3**

### Property 7: Correct action feedback

*For any* correct Input Action performed during a Ritual Step, the Game System should provide positive visual feedback on the Screen Mesh.

**Validates: Requirements 4.4**

### Property 8: Animation cleanup

*For any* visual feedback animation that completes, the Interactive Meshes should return to their default visual state.

**Validates: Requirements 4.5**

### Property 9: EKG pattern reflects mistakes

*For any* number of mistakes made by the player, the EKG Display should render with a pattern that becomes increasingly erratic as mistake count increases.

**Validates: Requirements 5.3**

### Property 10: Time indicator lifecycle

*For any* Ritual Step, the Time Indicator should display when the step begins, count down as time elapses, and reset when the step is completed.

**Validates: Requirements 6.1, 6.2, 6.5**

### Property 11: Time warning at low threshold

*For any* Ritual Step where remaining time falls below a warning threshold, the Time Indicator should provide visual warning cues.

**Validates: Requirements 6.4**

### Property 12: FSM state transition integrity

*For any* current FSM state, only state transitions explicitly defined by the FSM rules should be allowed, and all other transitions should be rejected.

**Validates: Requirements 7.5**

### Property 13: Ritual step progression

*For any* Ritual Step where the player performs the correct Input Action, the FSM should transition to the next RITUAL_STEP state or to ITS_ALIVE state if all steps are complete.

**Validates: Requirements 7.3, 10.3**

### Property 14: Failure transitions to MONSTER_MAD

*For any* Ritual Step where the player fails (incorrect action or timeout), the FSM should transition to MONSTER_MAD state.

**Validates: Requirements 7.4**

### Property 15: Successful completion transitions to ITS_ALIVE

*For any* Ritual where all steps are completed successfully, the FSM should transition to ITS_ALIVE state.

**Validates: Requirements 9.1**

### Property 16: Difficulty progression

*For any* Level completion, the next Level should have increased difficulty through reduced time limits or additional Ritual Steps.

**Validates: Requirements 9.5, 12.1, 12.2**

### Property 17: Level number display

*For any* Level that begins, the Game System should display the current level number on the Screen Mesh.

**Validates: Requirements 12.4**

### Property 18: Ritual action mapping

*For any* Ritual Step defined in a Ritual, that step should have a valid Input Action mapped to it.

**Validates: Requirements 10.2**

### Property 19: Mistake registration

*For any* incorrect Input Action performed during a Ritual Step, the Game System should increment the mistake count and update the monster's state (EKG pattern).

**Validates: Requirements 10.4**

### Property 20: Sequential step completion

*For any* Ritual with multiple steps, the steps must be completed in sequential order, and skipping steps should not be allowed.

**Validates: Requirements 10.5**

### Property 21: Surgeon character lifecycle

*For any* Ritual Step, the Surgeon Character should be displayed on the Screen Mesh, animate when correct actions are performed, and transition to the next pose when the step completes.

**Validates: Requirements 13.1, 13.2, 13.4**

### Property 22: Surgical object display

*For any* Ritual Step that involves a Surgical Object, that object should be displayed on the Screen Mesh and removed or transitioned appropriately when the animation completes.

**Validates: Requirements 14.1, 14.8**

## Error Handling

### Input Errors

**Invalid Input During Wrong State**
- If input is received while FSM is in IDLE or ITS_ALIVE state, ignore the input
- If input is received during state transitions, queue the input for processing after transition completes

**Unmapped Input**
- If a keyboard key or touch event doesn't map to any Input Action, log a warning but don't crash
- Provide visual feedback that the input was not recognized (subtle screen flash)

**Rapid Input Spam**
- Implement debouncing to prevent accidental double-inputs
- Limit input processing to once per 100ms per action type

### Model Loading Errors

**Missing Meshes**
- If franken.glb loads but expected meshes are missing, log errors with mesh names
- Provide fallback behavior: disable interactions for missing meshes
- Display error message on screen: "Console hardware malfunction"

**Model Load Failure**
- If franken.glb fails to load entirely, display error screen
- Provide retry button
- Log detailed error information to console

### Animation Errors

**Missing Animation Frames**
- If surgeon or surgical object sprite sheets are missing frames, use placeholder graphics
- Log warning with missing frame identifiers
- Continue gameplay without crashing

**Animation Timing Issues**
- If animations don't complete within expected timeframe, force completion after timeout
- Ensure game state doesn't get stuck waiting for animations

### State Machine Errors

**Invalid State Transition**
- If code attempts an invalid state transition, reject it and log error
- Maintain current state to prevent corruption
- Provide recovery mechanism: allow manual reset to IDLE state

**State Data Corruption**
- Validate state data on every state transition
- If corruption detected, reset to safe default values
- Log corruption details for debugging

### Timing Errors

**Timer Drift**
- Use requestAnimationFrame for consistent timing
- Calculate delta time to handle variable frame rates
- Prevent negative time values

**Time Limit Edge Cases**
- If time limit is set to 0 or negative, use default minimum (1 second)
- If time remaining becomes negative due to lag, immediately trigger timeout

### Rendering Errors

**Canvas Context Loss**
- If WebGL context is lost, attempt to restore it
- Display "Restoring display..." message during restoration
- If restoration fails after 3 attempts, show error and reload button

**Texture Update Failures**
- If canvas texture fails to update, log error but continue rendering
- Retry texture update on next frame
- Prevent infinite retry loops with max attempt counter

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and integration points:

**FSM State Transitions**
- Test IDLE → RITUAL_STEP transition when game starts
- Test RITUAL_STEP → ITS_ALIVE when all steps complete
- Test RITUAL_STEP → MONSTER_MAD on failure
- Test MONSTER_MAD → RITUAL_STEP on retry
- Test invalid transition rejection

**Input Mapping**
- Test each keyboard key maps to correct action
- Test unmapped keys are ignored
- Test input debouncing prevents spam

**Time Management**
- Test timer counts down correctly
- Test timeout triggers MONSTER_MAD state
- Test timer resets between steps
- Test warning threshold triggers visual cues

**Ritual Data Loading**
- Test valid ritual JSON loads correctly
- Test invalid JSON is rejected with error
- Test ritual steps are in correct order

**EKG Pattern Selection**
- Test CALM pattern when mistakes = 0
- Test NERVOUS pattern when mistakes = 1-2
- Test ANGRY pattern when mistakes >= 3
- Test FLATLINE pattern in MONSTER_MAD state
- Test ALIVE pattern in ITS_ALIVE state

**Difficulty Scaling**
- Test time limits decrease by correct percentage each level
- Test step count increases at specified levels
- Test level number increments correctly

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property testing library). Each test will run a minimum of 100 iterations.

**Configuration:**
```typescript
import fc from 'fast-check';

const PBT_CONFIG = {
  numRuns: 100,
  seed: 42, // For reproducibility
  verbose: true
};
```

**Property Test 1: Input mapping correctness**
- Generate random keyboard keys and touch coordinates
- Verify mapped inputs produce correct actions
- Verify unmapped inputs are ignored
- **Feature: frankenstein-ritual-game, Property 1: Input mapping correctness**

**Property Test 2: Visual feedback for input actions**
- Generate random Input Actions
- Verify each action triggers visual feedback
- Verify feedback is either on mesh or screen
- **Feature: frankenstein-ritual-game, Property 2: Visual feedback for input actions**

**Property Test 3: Prompt display correctness**
- Generate random Ritual Steps
- Verify prompts contain action name and required input
- Verify prompt format is consistent
- **Feature: frankenstein-ritual-game, Property 3: Prompt display correctness**

**Property Test 4: Prompt transitions**
- Generate random ritual sequences
- Verify completing each step clears and updates prompt
- Verify final step transitions to ITS_ALIVE
- **Feature: frankenstein-ritual-game, Property 4: Prompt transitions**

**Property Test 5: Incorrect action feedback**
- Generate random incorrect actions during ritual steps
- Verify bolts shake and eyes glow for each incorrect action
- **Feature: frankenstein-ritual-game, Property 5: Incorrect action feedback**

**Property Test 6: Stitches pulse in active states**
- Generate random active game states
- Verify stitches are pulsing in all active states
- Verify stitches stop in IDLE state
- **Feature: frankenstein-ritual-game, Property 6: Stitches pulse in active states**

**Property Test 7: Correct action feedback**
- Generate random correct actions during ritual steps
- Verify positive feedback appears on screen for each
- **Feature: frankenstein-ritual-game, Property 7: Correct action feedback**

**Property Test 8: Animation cleanup**
- Generate random animations
- Verify meshes return to default state after completion
- **Feature: frankenstein-ritual-game, Property 8: Animation cleanup**

**Property Test 9: EKG pattern reflects mistakes**
- Generate random mistake counts (0-10)
- Verify EKG pattern intensity increases with mistakes
- Verify pattern frequency increases with mistakes
- **Feature: frankenstein-ritual-game, Property 9: EKG pattern reflects mistakes**

**Property Test 10: Time indicator lifecycle**
- Generate random ritual steps with various time limits
- Verify indicator displays, counts down, and resets correctly
- **Feature: frankenstein-ritual-game, Property 10: Time indicator lifecycle**

**Property Test 11: Time warning at low threshold**
- Generate random time values below warning threshold
- Verify warning cues appear for all low time values
- **Feature: frankenstein-ritual-game, Property 11: Time warning at low threshold**

**Property Test 12: FSM state transition integrity**
- Generate random state transition attempts
- Verify only valid transitions are allowed
- Verify invalid transitions are rejected
- **Feature: frankenstein-ritual-game, Property 12: FSM state transition integrity**

**Property Test 13: Ritual step progression**
- Generate random rituals with varying step counts
- Verify correct actions advance to next step
- Verify final step transitions to ITS_ALIVE
- **Feature: frankenstein-ritual-game, Property 13: Ritual step progression**

**Property Test 14: Failure transitions to MONSTER_MAD**
- Generate random failure scenarios (wrong action, timeout)
- Verify all failures transition to MONSTER_MAD
- **Feature: frankenstein-ritual-game, Property 14: Failure transitions to MONSTER_MAD**

**Property Test 15: Successful completion transitions to ITS_ALIVE**
- Generate random rituals
- Complete all steps correctly
- Verify transition to ITS_ALIVE in all cases
- **Feature: frankenstein-ritual-game, Property 15: Successful completion transitions to ITS_ALIVE**

**Property Test 16: Difficulty progression**
- Generate random level numbers (1-20)
- Verify time limits decrease with each level
- Verify step counts increase at appropriate levels
- **Feature: frankenstein-ritual-game, Property 16: Difficulty progression**

**Property Test 17: Level number display**
- Generate random level numbers
- Verify level number is displayed when level begins
- **Feature: frankenstein-ritual-game, Property 17: Level number display**

**Property Test 18: Ritual action mapping**
- Generate random ritual definitions
- Verify every step has a valid Input Action
- Verify no steps have undefined or null actions
- **Feature: frankenstein-ritual-game, Property 18: Ritual action mapping**

**Property Test 19: Mistake registration**
- Generate random incorrect actions
- Verify mistake count increments for each
- Verify EKG state updates with mistake count
- **Feature: frankenstein-ritual-game, Property 19: Mistake registration**

**Property Test 20: Sequential step completion**
- Generate random rituals
- Attempt to skip steps
- Verify steps must be completed in order
- **Feature: frankenstein-ritual-game, Property 20: Sequential step completion**

**Property Test 21: Surgeon character lifecycle**
- Generate random ritual steps
- Verify surgeon displays, animates, and transitions for each step
- **Feature: frankenstein-ritual-game, Property 21: Surgeon character lifecycle**

**Property Test 22: Surgical object display**
- Generate random ritual steps with surgical objects
- Verify objects display and cleanup correctly
- **Feature: frankenstein-ritual-game, Property 22: Surgical object display**

### Integration Testing

Integration tests will verify component interactions:

**3D Scene + Input Manager**
- Test raycasting correctly identifies touched meshes
- Test mesh highlighting on hover/touch

**Game Controller + FSM**
- Test controller correctly updates FSM based on input
- Test FSM state changes trigger correct controller actions

**Screen Renderer + Animation System**
- Test surgeon animations render correctly on screen texture
- Test surgical object animations sync with game state

**Game Controller + Scene Manager**
- Test controller triggers correct 3D mesh animations
- Test bolt shaking, eye glowing, stitches pulsing

**Full Gameplay Flow**
- Test complete ritual from IDLE to ITS_ALIVE
- Test complete ritual from IDLE to MONSTER_MAD
- Test retry after failure
- Test multiple level progression

### Test Utilities

**Mock Ritual Generator**
```typescript
function generateMockRitual(stepCount: number, timeLimit: number): Ritual {
  // Generate ritual with specified parameters for testing
}
```

**FSM State Inspector**
```typescript
function inspectFSMState(fsm: GameFSM): GameStateData {
  // Extract current state data for assertions
}
```

**Input Simulator**
```typescript
function simulateInput(action: InputAction): void {
  // Programmatically trigger input actions
}
```

**Time Controller**
```typescript
function advanceTime(deltaMs: number): void {
  // Fast-forward game time for testing
}
```
