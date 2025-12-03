# Technology Stack

## Mandatory Technologies

**Core Stack:**
- **three.js** - Sole 3D rendering engine (scene management, model loading, WebGL)
- **TypeScript** - All game logic and data typing with strict type checking
- **Tween.js** (@tweenjs/tween.js) - All 3D object and camera animations
- **fast-check** - Property-based testing (minimum 100 iterations per test)

**Build System:**
- Modern bundler (Vite or Webpack) configured for:
  - TypeScript compilation
  - GLB/GLTF asset loading
  - Development server with hot reload

## Key Dependencies

```json
{
  "three": "3D rendering engine",
  "@tweenjs/tween.js": "Animation library",
  "@types/three": "TypeScript definitions",
  "fast-check": "Property-based testing",
  "typescript": "TypeScript compiler"
}
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build

# Testing
npm test             # All tests
npm run test:watch   # Watch mode
npm run test:unit    # Unit tests only
npm run test:pbt     # Property-based tests only
```

## Asset Requirements

- 3D models: GLB format only
- Location: `assets/models/`
- Primary model: `franken.glb` (Frankenstein handheld console with named meshes)
