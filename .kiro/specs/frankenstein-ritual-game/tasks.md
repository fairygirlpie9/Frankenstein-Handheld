# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create directory structure following Mad Scientist Style Guide (src/logic, src/render, src/config, assets/models)
  - Initialize TypeScript project with tsconfig.json and strict type checking
  - Install dependencies: three.js, @tweenjs/tween.js, @types/three, fast-check
  - Set up Vite bundler with TypeScript and GLB asset loading
  - Move franken.glb to assets/models/
  - Create index.html with canvas element and basic styling
  - Create src/main.ts entry point
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 2. Implement core data structures and constants
  - [x] 2.1 Create TypeScript enums and interfaces in src/config/
    - Define GameState enum with SCREAMING_SNAKE_CASE states
    - Define InputAction enum for all input types
    - Define EKGState enum for monster emotional states
    - Define SurgicalObjectType enum
    - Create interfaces: RitualStep, Ritual, InteractiveMesh, GameStateData, EKGPattern
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 2.2 Create constants configuration file
    - Define EKG_PATTERNS with waveform data for each state
    - Define KEYBOARD_MAP for desktop input mapping
    - Define INTERACTIVE_MESHES array with mesh IDs from franken.glb
    - Define timing constants (debounce delays, animation durations)
    - _Requirements: 2.1, 2.3_

  - [x] 2.3 Create ritual definitions
    - Define Level 1 ritual JSON with 3-5 Frankenstein-themed steps
    - Include actions: Disinfect, Slice Open, Remove Organ, Connect Wires, Sew Shut
    - Map each step to correct InputAction
    - Set base time limits for each step
    - _Requirements: 10.1, 10.2_

- [x] 3. Implement 3D scene management
  - [x] 3.1 Create SceneManager class in src/render/
    - Initialize three.js scene, camera, renderer, and lighting
    - Implement LOAD_MODEL function to load franken.glb using GLTFLoader
    - Extract and store references to named meshes (screen, bolts, eyes, stitches, buttons, joystick, dpad)
    - Position camera to show entire console clearly
    - _Requirements: 1.1, 1.5_

  - [x] 3.2 Implement 3D mesh animations using Tween.js
    - Create ANIMATE_BOLTS function for shaking animation
    - Create ANIMATE_EYES function for glowing effect (emissive intensity)
    - Create ANIMATE_STITCHES function for continuous pulsing
    - Ensure animations return meshes to default state on completion
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 3.3 Write property tests for mesh animations using fast-check (100+ iterations)
    - **Property 5: Incorrect action feedback**
    - **Property 6: Stitches pulse in active states**
    - **Property 8: Animation cleanup**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.5**

- [x] 4. Implement 2D screen rendering system
  - [x] 4.1 Create ScreenRenderer class in src/render/
    - Initialize HTML canvas and 2D context
    - Create THREE.CanvasTexture and map to screen mesh material
    - Implement clear() method
    - Implement updateTexture() to refresh texture from canvas
    - _Requirements: 1.2, 1.4_

  - [x] 4.2 Implement retro visual effects
    - Create applyScanlines() for CRT effect
    - Create applyGlitchEffect() with chromatic aberration
    - Add pixel art scaling with configurable pixel size
    - _Requirements: 1.2, 8.1, 8.2_

  - [x] 4.3 Implement text and UI rendering
    - Create drawPrompt() for displaying ritual step instructions
    - Create drawTimeIndicator() with countdown and warning colors
    - Create drawIdleScreen() with start prompt
    - Create drawItsAliveScreen() with "IT'S ALIVE" text
    - Use retro-style pixel font
    - _Requirements: 1.3, 3.1, 3.2, 6.1, 6.4, 9.2_

  - [x] 4.4 Implement EKG display rendering
    - Create drawEKG() that renders waveform based on EKGState
    - Position EKG along bottom of screen
    - Animate waveform scrolling based on time and frequency
    - Scale amplitude based on golem_madnessLevel
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.5 Write property test for EKG patterns using fast-check (100+ iterations)
    - **Property 9: EKG pattern reflects mistakes**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 5.3**

- [x] 5. Implement surgeon character and surgical objects
  - [x] 5.1 Create AnimationSystem class in src/render/
    - Create placeholder pixel art sprite sheets for surgeon (simple colored rectangles/shapes)
    - Load surgeon sprite sheet into AnimationSystem
    - Define animation frames for each surgical action (spray_disinfectant, slice_incision, remove_organ, connect_wires, sew_stitches)
    - Implement frame-based animation with timing
    - Provide getSurgeonFrame() method
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 5.2 Create surgical object sprites and animations
    - Create placeholder pixel art sprites for: organ, wires, scalpel, needle/thread, disinfectant, tools
    - Load surgical object sprites into AnimationSystem
    - Implement animation sequences for each object type
    - Provide getSurgicalObjectFrame() method
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [x] 5.3 Integrate surgeon and objects into ScreenRenderer
    - Implement drawSurgeon() to render current animation frame
    - Implement drawSurgicalObject() to render object animations
    - Sync animations with ritual step state
    - Remove objects when animations complete
    - _Requirements: 13.4, 13.5, 14.8_

  - [x] 5.4 Write property tests for surgeon and object lifecycle using fast-check (100+ iterations)
    - **Property 21: Surgeon character lifecycle**
    - **Property 22: Surgical object display**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 13.1, 13.2, 13.4, 14.1, 14.8**

- [x] 6. Implement input handling system
  - [x] 6.1 Create InputManager class in src/logic/
    - Initialize keyboard event listeners for desktop
    - Initialize touch event listeners and raycasting for mobile
    - Implement input debouncing (100ms)
    - Map keyboard keys to InputActions using KEYBOARD_MAP
    - Emit input events to game controller
    - _Requirements: 2.1, 2.2_

  - [x] 6.2 Implement HANDLE_BUTTON_PRESS function in InputManager
    - Process input actions and emit events
    - Coordinate with SceneManager for visual feedback on interactive meshes
    - Handle unmapped inputs gracefully
    - _Requirements: 2.3, 2.4, 2.5_

  - [ ]* 6.3 Write property tests for input mapping using fast-check (100+ iterations)
    - **Property 1: Input mapping correctness**
    - **Property 2: Visual feedback for input actions**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.5**

- [x] 7. Implement game FSM and ritual logic
  - [x] 7.1 Create GameFSM class in src/logic/
    - Initialize with STATE_IDLE
    - Implement TRANSITION_TO_STATE with validation
    - Implement ADVANCE_RITUAL_STEP
    - Implement REGISTER_MISTAKE to increment golem_madnessLevel
    - Track current ritual, step index, time remaining
    - Emit stateChange events
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 7.2 Create ritual logic functions in src/logic/RitualLogic.ts
    - Implement START_RITUAL_SEQUENCE
    - Implement VALIDATE_RITUAL_ACTION
    - Implement COMPLETE_RITUAL_STEP
    - Implement HANDLE_RITUAL_FAILURE
    - _Requirements: 10.3, 10.4, 10.5_

  - [x] 7.3 Implement time management
    - Add updateTime() to FSM to count down timeRemaining
    - Transition to STATE_MONSTER_MAD when time reaches zero
    - Update golem_current_state based on golem_madnessLevel
    - _Requirements: 6.2, 6.3, 6.5_

  - [ ]* 7.4 Write property tests for FSM state transitions using fast-check (100+ iterations)
    - **Property 12: FSM state transition integrity**
    - **Property 13: Ritual step progression**
    - **Property 14: Failure transitions to MONSTER_MAD**
    - **Property 15: Successful completion transitions to ITS_ALIVE**
    - **Property 20: Sequential step completion**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 7.3, 7.4, 7.5, 9.1, 10.3, 10.5**

  - [ ]* 7.5 Write property test for mistake tracking using fast-check (100+ iterations)
    - **Property 19: Mistake registration**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 10.4**

- [x] 8. Implement game controller and main loop
  - [x] 8.1 Create GameController class and wire up main.ts
    - Initialize all subsystems (FSM, InputManager, SceneManager, ScreenRenderer, AnimationSystem)
    - Implement update() loop using requestAnimationFrame
    - Calculate delta time for consistent timing
    - Wire GameController initialization in src/main.ts
    - Handle window resize events
    - _Requirements: 1.1_

  - [x] 8.2 Implement input handling in controller
    - Subscribe to InputManager input events
    - Call VALIDATE_RITUAL_ACTION to check correctness
    - Trigger correct or incorrect feedback based on validation
    - _Requirements: 2.3, 2.4_

  - [x] 8.3 Implement feedback coordination
    - Create triggerCorrectFeedback() to show positive screen feedback and advance step
    - Create triggerIncorrectFeedback() to shake bolts, glow eyes, and register mistake
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 8.4 Implement state-based rendering
    - Render appropriate screen content based on current GameState
    - STATE_IDLE: show start screen
    - STATE_RITUAL_STEP: show prompt, EKG, timer, surgeon, objects
    - STATE_MONSTER_MAD: apply glitch effect, show failure message
    - STATE_ITS_ALIVE: show success message and animation
    - _Requirements: 1.3, 3.4, 3.5, 8.1, 8.3, 9.2, 9.3_

  - [ ]* 8.5 Write property tests for prompt and UI display using fast-check (100+ iterations)
    - **Property 3: Prompt display correctness**
    - **Property 4: Prompt transitions**
    - **Property 7: Correct action feedback**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 3.1, 3.2, 3.4, 4.4**

  - [ ]* 8.6 Write property tests for time indicator using fast-check (100+ iterations)
    - **Property 10: Time indicator lifecycle**
    - **Property 11: Time warning at low threshold**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 6.1, 6.2, 6.4, 6.5**

- [x] 9. Implement level progression and difficulty scaling
  - [x] 9.1 Add level management to GameController
    - Implement startLevel() to initialize ritual for given level
    - Implement completeLevel() to transition to next level
    - Display level number on screen when level starts
    - _Requirements: 9.4, 12.4_

  - [x] 9.2 Implement difficulty scaling
    - Reduce time limits by 10% each level (timeLimitMultiplier)
    - Add extra ritual step every 3 levels
    - Update ritual configuration based on level number
    - _Requirements: 9.5, 12.1, 12.2, 12.3_

  - [ ]* 9.3 Write property tests for difficulty progression using fast-check (100+ iterations)
    - **Property 16: Difficulty progression**
    - **Property 17: Level number display**
    - Configure fast-check with minimum 100 iterations
    - **Validates: Requirements 9.5, 12.1, 12.2, 12.4**

- [x] 10. Implement retry and game flow
  - [x] 10.1 Add retry functionality
    - In STATE_MONSTER_MAD, display retry button/prompt
    - On retry input, reset FSM to first step of current level
    - Reset golem_madnessLevel and mistake count
    - _Requirements: 8.4, 8.5_

  - [x] 10.2 Implement complete game flow
    - STATE_IDLE → start game → STATE_RITUAL_STEP
    - Complete all steps → STATE_ITS_ALIVE → next level
    - Fail step → STATE_MONSTER_MAD → retry
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 11. Add error handling and edge cases
  - [x] 11.1 Implement model loading error handling
    - Handle missing franken.glb file
    - Handle missing meshes in model
    - Display error messages on screen
    - _Requirements: 1.1_

  - [x] 11.2 Implement input error handling
    - Handle unmapped keyboard keys
    - Handle rapid input spam with debouncing
    - Handle invalid state for input
    - _Requirements: 2.1, 2.3_

  - [x] 11.3 Implement timing edge cases
    - Handle negative time values
    - Handle timer drift with delta time
    - Handle zero or negative time limits
    - _Requirements: 6.2, 6.3_

  - [x] 11.4 Implement rendering error handling
    - Handle WebGL context loss
    - Handle canvas texture update failures
    - Handle missing animation frames
    - _Requirements: 1.2, 1.4_



- [x] 12. Create test utilities and configuration
  - [x] 12.1 Set up test framework configuration
    - Configure test runner (Vitest or Jest) for TypeScript
    - Set up fast-check with default config (numRuns: 100, seed: 42)
    - Create test setup files
    - _Requirements: All testing requirements_
  
  - [x] 12.2 Create test helper functions in tests/utils/
    - Implement generateMockRitual() for creating test rituals
    - Implement inspectFSMState() for state assertions
    - Implement simulateInput() for programmatic input triggering
    - Implement advanceTime() for time-based testing
    - _Requirements: All testing requirements_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 14. Write integration tests
  - [ ]* 14.1 Test complete ritual flow from IDLE to ITS_ALIVE
    - Simulate full ritual completion
    - Verify all state transitions occur correctly
    - Verify screen updates at each step

  - [ ]* 14.2 Test failure flow from IDLE to MONSTER_MAD
    - Simulate incorrect actions
    - Verify glitch effect applies
    - Verify retry functionality

  - [ ]* 14.3 Test multi-level progression
    - Complete multiple levels
    - Verify difficulty increases
    - Verify level numbers display correctly

  - [ ]* 14.4 Test input handling across devices
    - Test keyboard input on desktop
    - Test touch input on mobile (simulated)
    - Verify raycasting works correctly

- [ ]* 15. Write property test for ritual action validation using fast-check (100+ iterations)
  - **Property 18: Ritual action mapping**
  - Configure fast-check with minimum 100 iterations
  - **Validates: Requirements 10.2**
