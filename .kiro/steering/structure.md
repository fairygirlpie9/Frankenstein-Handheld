# Project Structure

Strict directory organization following Mad Scientist Style Guide:

```
project-root/
├── src/
│   ├── logic/              # FSM and core game rules
│   │   ├── GameFSM.ts
│   │   └── RitualLogic.ts
│   ├── render/             # three.js scene and visual effects
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
│       └── franken.glb     # 3D console model
├── tests/                  # Unit and property-based tests
├── index.html
└── package.json
```

## Directory Responsibilities

**src/logic/** - Game state management and business logic
- FSM implementation (state transitions, validation)
- Ritual validation and progression
- Game rules enforcement

**src/render/** - All rendering and visual systems
- 3D scene management (three.js)
- 2D screen rendering (canvas-based retro graphics)
- Animation systems (3D meshes + 2D sprites)

**src/config/** - Configuration and constants only
- Game constants (timing, thresholds, limits)
- Ritual definitions (levels, steps, actions)
- Input mappings (keyboard/touch)
- EKG patterns and visual effects

**assets/models/** - 3D assets only
- GLB/GLTF format required
- Named meshes for interactive elements

## Naming Conventions

- Classes: PascalCase (`GameFSM.ts`, `SceneManager.ts`)
- Config files: camelCase (`constants.ts`, `inputMappings.ts`)
- Test files: `<filename>.test.ts` suffix
