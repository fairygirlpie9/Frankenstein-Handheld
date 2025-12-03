# Requirements Document

## Introduction

The Frankenstein Ritual Game is a browser-based interactive experience built with three.js that transforms a 3D Frankenstein handheld console model into a playable retro-style surgical game. Players must perform a sequence of Frankenstein-themed operating table procedures by following on-screen prompts and using the console's interactive elements (joystick, buttons, d-pad). The game features a finite state machine with multiple states (IDLE, RITUAL_STEP, MONSTER_MAD, ITS_ALIVE), real-time EKG feedback, visual cues through 3D model animations, and progressive difficulty across levels. Success brings the monster to life, while failure triggers a glitchy transition to the MONSTER_MAD state.

## Glossary

- **Game System**: The browser-based three.js application managing game logic, rendering, and user interaction
- **Console Model**: The 3D Frankenstein handheld device (franken.glb) with interactive meshes
- **Ritual**: A sequence of 3-5 surgical steps that must be completed in order
- **Ritual Step**: A single action within a ritual (e.g., "Slice Open", "Connect Wires")
- **FSM**: Finite State Machine controlling game state transitions
- **EKG Display**: Electrocardiogram line visualization showing monster's emotional state
- **Screen Mesh**: The rectangular display area on the Console Model where 2D graphics render
- **Interactive Mesh**: A named mesh in the Console Model that responds to user input (buttons, joystick, d-pad)
- **Glitch Shader**: A chromatic aberration visual effect signaling failure
- **Time Indicator**: Visual countdown showing remaining time for current Ritual Step
- **Input Action**: A player command mapped to keyboard keys (desktop) or touch events (mobile)
- **Level**: A complete Ritual with specific difficulty parameters (time limits, step count)
- **Surgeon Character**: An animated sprite or 2D character displayed on the Screen Mesh performing surgical actions
- **Surgical Object**: A visual representation of items used during the Ritual (organs, wires, needle and thread, scalpel, disinfectant)

## Requirements

### Requirement 1

**User Story:** As a player, I want to see the Frankenstein console load with retro-style graphics on its screen, so that I understand the game's aesthetic and can begin playing.

#### Acceptance Criteria

1. WHEN the Game System initializes THEN the Game System SHALL load the Console Model and display it in the browser viewport
2. WHEN the Console Model is loaded THEN the Game System SHALL render retro-style graphics on the Screen Mesh with pixel art aesthetic and CRT scanline effects
3. WHEN the game enters IDLE state THEN the Game System SHALL display a start prompt on the Screen Mesh
4. WHEN the Screen Mesh renders content THEN the Game System SHALL maintain aspect ratio and visual clarity appropriate for retro gaming
5. WHEN the Console Model is displayed THEN the Game System SHALL position the camera to show the entire console clearly

### Requirement 2

**User Story:** As a player, I want to interact with the console using keyboard controls on desktop or touch controls on mobile, so that I can perform ritual actions regardless of my device.

#### Acceptance Criteria

1. WHEN a player uses a desktop device THEN the Game System SHALL map keyboard keys to Interactive Meshes (joystick directions, button presses, d-pad directions)
2. WHEN a player uses a mobile device THEN the Game System SHALL enable touch input directly on Interactive Meshes in the 3D scene
3. WHEN a player presses a mapped keyboard key THEN the Game System SHALL trigger the corresponding Input Action immediately
4. WHEN a player touches an Interactive Mesh on mobile THEN the Game System SHALL trigger the corresponding Input Action immediately
5. WHEN an Input Action is triggered THEN the Game System SHALL provide visual feedback on the corresponding Interactive Mesh

### Requirement 3

**User Story:** As a player, I want to follow on-screen prompts that tell me which actions to perform, so that I know what to do during each ritual step.

#### Acceptance Criteria

1. WHEN a Ritual Step begins THEN the Game System SHALL display a text prompt on the Screen Mesh describing the required action
2. WHEN displaying a prompt THEN the Game System SHALL include both the action name and the required input (e.g., "Slice Open: Move Joystick Up")
3. WHEN a prompt is displayed THEN the Game System SHALL use clear, readable retro-style typography
4. WHEN a Ritual Step is completed THEN the Game System SHALL clear the current prompt and display the next prompt
5. WHEN all Ritual Steps are completed THEN the Game System SHALL clear prompts and transition to ITS_ALIVE state

### Requirement 4

**User Story:** As a player, I want to see visual feedback on the console model when I perform actions correctly or incorrectly, so that I understand the consequences of my inputs.

#### Acceptance Criteria

1. WHEN a player performs an incorrect Input Action THEN the Game System SHALL animate the bolt meshes (bolt_left, bolt_right) to shake
2. WHEN a player performs an incorrect Input Action THEN the Game System SHALL make the eye meshes (eye_left, eye_right) glow with increased intensity
3. WHEN the game is in any active state THEN the Game System SHALL animate the stitches mesh to pulse intermittently
4. WHEN a player performs a correct Input Action THEN the Game System SHALL provide positive visual feedback on the Screen Mesh
5. WHEN visual feedback animations complete THEN the Game System SHALL return Interactive Meshes to their default visual state

### Requirement 5

**User Story:** As a player, I want to see an EKG line at the bottom of the screen that reflects the monster's state, so that I have real-time feedback on my performance.

#### Acceptance Criteria

1. WHEN the game is in RITUAL_STEP state THEN the Game System SHALL display an EKG Display along the bottom of the Screen Mesh
2. WHEN the monster is calm THEN the Game System SHALL render the EKG Display with a steady, slow heartbeat pattern
3. WHEN the player makes mistakes THEN the Game System SHALL render the EKG Display with an increasingly erratic heartbeat pattern
4. WHEN the game transitions to MONSTER_MAD state THEN the Game System SHALL render the EKG Display with a flatline or chaotic pattern
5. WHEN the game transitions to ITS_ALIVE state THEN the Game System SHALL render the EKG Display with a strong, healthy heartbeat pattern

### Requirement 6

**User Story:** As a player, I want to see a time indicator showing how much time I have left for each step, so that I can manage my actions under pressure.

#### Acceptance Criteria

1. WHEN a Ritual Step begins THEN the Game System SHALL display a Time Indicator on the Screen Mesh
2. WHEN time elapses THEN the Game System SHALL update the Time Indicator to reflect remaining time
3. WHEN time runs out for a Ritual Step THEN the Game System SHALL transition to MONSTER_MAD state
4. WHEN the Time Indicator shows low remaining time THEN the Game System SHALL provide visual warning cues (color change, flashing)
5. WHEN a Ritual Step is completed before time expires THEN the Game System SHALL reset the Time Indicator for the next step

### Requirement 7

**User Story:** As a player, I want the game to follow a clear state machine with distinct states, so that gameplay is predictable and structured.

#### Acceptance Criteria

1. WHEN the Game System initializes THEN the FSM SHALL begin in IDLE state
2. WHEN the player starts the game from IDLE state THEN the FSM SHALL transition to the first RITUAL_STEP state
3. WHEN a player completes a Ritual Step correctly THEN the FSM SHALL transition to the next RITUAL_STEP state or to ITS_ALIVE state if all steps are complete
4. WHEN a player fails a Ritual Step THEN the FSM SHALL transition to MONSTER_MAD state
5. WHEN the FSM is in any state THEN the Game System SHALL only allow state transitions defined by the FSM rules

### Requirement 8

**User Story:** As a player, I want to experience a dramatic glitch effect when I fail, so that the failure feels impactful and thematic.

#### Acceptance Criteria

1. WHEN the FSM transitions to MONSTER_MAD state THEN the Game System SHALL apply the Glitch Shader to the entire Screen Mesh
2. WHEN the Glitch Shader is active THEN the Game System SHALL render chromatic aberration and distortion effects
3. WHEN the Glitch Shader effect completes THEN the Game System SHALL display a failure message on the Screen Mesh
4. WHEN in MONSTER_MAD state THEN the Game System SHALL provide an option to retry the current Level
5. WHEN the player chooses to retry THEN the FSM SHALL transition back to the first RITUAL_STEP of the current Level

### Requirement 9

**User Story:** As a player, I want to see "IT'S ALIVE" displayed when I successfully complete a ritual, so that I feel a sense of accomplishment.

#### Acceptance Criteria

1. WHEN all Ritual Steps in a Level are completed successfully THEN the FSM SHALL transition to ITS_ALIVE state
2. WHEN the FSM enters ITS_ALIVE state THEN the Game System SHALL display "IT'S ALIVE" text prominently on the Screen Mesh
3. WHEN the "IT'S ALIVE" message is displayed THEN the Game System SHALL play a celebratory animation on the Screen Mesh
4. WHEN the ITS_ALIVE state animation completes THEN the Game System SHALL transition to the next Level
5. WHEN transitioning to the next Level THEN the Game System SHALL increase difficulty by reducing time limits or adding more Ritual Steps

### Requirement 10

**User Story:** As a player, I want to perform Frankenstein-themed surgical actions like "Slice Open", "Connect Wires", and "Sew Shut", so that the gameplay feels thematically appropriate.

#### Acceptance Criteria

1. WHEN defining a Ritual THEN the Game System SHALL include Frankenstein-themed action names (Slice Open, Remove Organ, Connect Wires, Sew Shut, Disinfect, Clean Tools)
2. WHEN a Ritual Step requires an action THEN the Game System SHALL map that action to a specific Input Action (joystick direction, button press, d-pad direction)
3. WHEN a player performs the correct Input Action for a Ritual Step THEN the Game System SHALL advance to the next Ritual Step
4. WHEN a player performs an incorrect Input Action THEN the Game System SHALL register a mistake and update the monster's state
5. WHEN a Ritual contains multiple steps THEN the Game System SHALL require steps to be completed in sequential order

### Requirement 11

**User Story:** As a developer, I want clear TypeScript interfaces for three.js objects and game data structures, so that the codebase is maintainable and type-safe.

#### Acceptance Criteria

1. WHEN defining game data structures THEN the Game System SHALL use TypeScript interfaces for all major entities
2. WHEN controlling Interactive Meshes THEN the Game System SHALL define an interface specifying mesh name, target mesh ID, and required Input Action
3. WHEN managing FSM states THEN the Game System SHALL define an interface or enum for all valid states
4. WHEN defining Ritual Steps THEN the Game System SHALL use an interface specifying step name, required action, time limit, and success criteria
5. WHEN accessing three.js objects THEN the Game System SHALL use typed references to meshes, materials, and scene objects

### Requirement 12

**User Story:** As a player, I want progressive difficulty across levels, so that the game remains challenging and engaging.

#### Acceptance Criteria

1. WHEN a player completes a Level THEN the Game System SHALL increase the difficulty for the next Level
2. WHEN increasing difficulty THEN the Game System SHALL reduce time limits for Ritual Steps by a defined percentage
3. WHEN increasing difficulty THEN the Game System SHALL optionally add additional Ritual Steps to the sequence
4. WHEN a Level begins THEN the Game System SHALL display the current level number on the Screen Mesh
5. WHEN difficulty parameters change THEN the Game System SHALL maintain gameplay fairness and completability

### Requirement 13

**User Story:** As a player, I want to see a surgeon character performing the surgical actions on screen, so that the gameplay is visually engaging and clear.

#### Acceptance Criteria

1. WHEN a Ritual Step begins THEN the Game System SHALL display the Surgeon Character on the Screen Mesh
2. WHEN a player performs a correct Input Action THEN the Game System SHALL animate the Surgeon Character performing the corresponding surgical action
3. WHEN the Surgeon Character performs an action THEN the Game System SHALL display the animation in a retro pixel art style
4. WHEN a Ritual Step is completed THEN the Game System SHALL transition the Surgeon Character to the next action pose
5. WHEN the game is in IDLE or MONSTER_MAD state THEN the Game System SHALL hide or show the Surgeon Character in an appropriate idle state

### Requirement 14

**User Story:** As a player, I want to see physical surgical objects appear and interact during the ritual, so that I can visually understand what is happening in the operation.

#### Acceptance Criteria

1. WHEN a Ritual Step involves a Surgical Object THEN the Game System SHALL display that object on the Screen Mesh
2. WHEN the action is "Remove Organ" THEN the Game System SHALL display an organ graphic being removed from the operating area
3. WHEN the action is "Connect Wires" THEN the Game System SHALL display wire graphics appearing and connecting to the monster
4. WHEN the action is "Sew Shut" THEN the Game System SHALL display needle and thread graphics stitching the incision
5. WHEN the action is "Slice Open" THEN the Game System SHALL display a scalpel graphic making an incision
6. WHEN the action is "Disinfect" THEN the Game System SHALL display disinfectant spray or liquid graphics
7. WHEN the action is "Clean Tools" THEN the Game System SHALL display surgical tools being cleaned
8. WHEN a Surgical Object animation completes THEN the Game System SHALL remove or transition the object appropriately for the next step
