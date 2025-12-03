# Product Overview

Browser-based interactive game that transforms a 3D Frankenstein handheld console model into a playable retro-style surgical game.

## Core Concept

Players perform Frankenstein-themed surgical procedures by following on-screen prompts and using the console's interactive elements (joystick, buttons, d-pad). The game combines:
- 3D rendering of the physical console (three.js)
- 2D retro pixel art gameplay on the console's screen mesh
- FSM-driven gameplay with states: IDLE, RITUAL_STEP, MONSTER_MAD, ITS_ALIVE

## Gameplay Loop

1. Follow on-screen prompts for surgical actions (Slice Open, Connect Wires, Sew Shut, etc.)
2. Perform correct input actions within time limits
3. Monitor real-time EKG feedback showing monster's state
4. Complete all ritual steps → "IT'S ALIVE" success
5. Fail a step → glitchy MONSTER_MAD state with retry option
6. Progressive difficulty across levels (reduced time, more steps)
