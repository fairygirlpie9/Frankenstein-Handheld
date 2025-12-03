/**
 * InputManager - Handles keyboard and touch input for the game
 * Following Mad Scientist Style Guide conventions
 */

import * as THREE from 'three';
import { InputAction } from '../config/types';
import { KEYBOARD_MAP, TIMING } from '../config/constants';

// Event callback type
type InputCallback = (action: InputAction) => void;

export class InputManager {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private raycaster: THREE.Raycaster;
  private inputCallbacks: InputCallback[];
  private lastInputTime: Map<InputAction, number>;
  private keyboardEnabled: boolean;
  private touchEnabled: boolean;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.inputCallbacks = [];
    this.lastInputTime = new Map();
    this.keyboardEnabled = false;
    this.touchEnabled = false;
  }

  /**
   * Initialize keyboard input listeners
   */
  initKeyboardInput(): void {
    if (this.keyboardEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key, 'Code:', event.code);
      const action = KEYBOARD_MAP[event.key];
      if (action) {
        console.log('Mapped to action:', action);
        event.preventDefault();
        this.HANDLE_BUTTON_PRESS(action);
      } else {
        console.log('No mapping found for key:', event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    this.keyboardEnabled = true;
  }

  /**
   * Initialize touch input listeners with raycasting
   */
  initTouchInput(): void {
    if (this.touchEnabled) return;

    const handleTouch = (event: TouchEvent) => {
      event.preventDefault();
      
      if (event.touches.length === 0) return;
      
      const touch = event.touches[0];
      const mesh = this.getTouchedMesh(touch.clientX, touch.clientY);
      
      if (mesh) {
        // Determine action based on mesh name
        const action = this.getMeshAction(mesh);
        if (action) {
          this.HANDLE_BUTTON_PRESS(action);
        }
      }
    };

    window.addEventListener('touchstart', handleTouch, { passive: false });
    
    // Also add mouse click support for desktop
    const handleClick = (event: MouseEvent) => {
      console.log('=== MOUSE CLICK DETECTED ===', event.clientX, event.clientY);
      const mesh = this.getTouchedMesh(event.clientX, event.clientY);
      
      console.log('Clicked mesh:', mesh?.name || 'none');
      
      if (mesh) {
        const action = this.getMeshAction(mesh);
        console.log('Action for mesh:', action);
        if (action) {
          this.HANDLE_BUTTON_PRESS(action);
        } else {
          console.log('No action mapped for this mesh');
        }
      } else {
        console.log('No mesh hit by raycast');
      }
    };
    
    window.addEventListener('click', handleClick);
    this.touchEnabled = true;
  }

  /**
   * Map keyboard key to action (for dynamic remapping)
   */
  mapKeyToAction(key: string, action: InputAction): void {
    // This would modify KEYBOARD_MAP, but since it's a const,
    // we'd need a mutable copy. For now, this is a placeholder.
    console.log(`Mapping ${key} to ${action}`);
  }

  /**
   * Get the mesh that was touched using raycasting
   * Returns both the mesh and the intersection point
   */
  getTouchedMesh(touchX: number, touchY: number): THREE.Mesh | null {
    // Get canvas element for proper coordinate conversion
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.warn('Canvas not found for raycasting');
      return null;
    }

    // Convert touch coordinates to normalized device coordinates (-1 to +1)
    const rect = canvas.getBoundingClientRect();
    const x = ((touchX - rect.left) / rect.width) * 2 - 1;
    const y = -((touchY - rect.top) / rect.height) * 2 + 1;

    console.log('Click coords:', { touchX, touchY, normalizedX: x, normalizedY: y });

    // Update raycaster
    const mouse = new THREE.Vector2(x, y);
    this.raycaster.setFromCamera(mouse, this.camera);

    // Check for intersections - filter out particle systems (THREE.Points)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    console.log('Raycaster intersects:', intersects.length, 'objects');
    if (intersects.length > 0) {
      console.log('First 5 intersected objects:', intersects.slice(0, 5).map(i => `${i.object.name} (${i.object.type})`));
      
      // Find the first mesh (skip particle systems and other non-mesh objects)
      for (const intersect of intersects) {
        const object = intersect.object;
        // Skip particle systems (THREE.Points) and sprites
        if (object instanceof THREE.Mesh) {
          console.log('Selected mesh for interaction:', object.name);
          // Store the intersection point for zone detection
          (object as any).lastIntersectionPoint = intersect.point;
          return object;
        }
      }
    }

    return null;
  }

  /**
   * Get action associated with a mesh
   */
  private getMeshAction(mesh: THREE.Mesh): InputAction | null {
    const meshName = mesh.name.toLowerCase();
    console.log('Checking mesh action for:', meshName);

    // Map mesh names to actions - exact matching for clarity
    if (meshName.includes('joystick') || meshName.includes('stick') || meshName.includes('jpy') || meshName.includes('new_stick')) {
      // Joystick - determine direction based on click position
      return this.getJoystickDirection(mesh);
    } else if (meshName.includes('button_start')) {
      // Start button
      return InputAction.BUTTON_START;
    } else if (meshName === 'dpad' || meshName.includes('dpad') || meshName.includes('d-pad') || meshName.includes('d_pad')) {
      // D-pad - determine direction based on click zone
      return this.getDpadDirection(mesh);
    } else if (meshName.includes('button_a')) {
      // Button A
      return InputAction.BUTTON_A;
    } else if (meshName.includes('button_b')) {
      // Button B
      return InputAction.BUTTON_B;
    } else if (meshName.includes('pause') || meshName.includes('select')) {
      // Pause/Select button
      return InputAction.BUTTON_PAUSE;
    }

    console.log('No action found for mesh:', meshName);
    return null;
  }

  /**
   * Determine joystick direction based on where it was clicked
   */
  private getJoystickDirection(mesh: THREE.Mesh): InputAction {
    const intersectionPoint = (mesh as any).lastIntersectionPoint as THREE.Vector3;
    
    if (!intersectionPoint) {
      console.warn('No intersection point for joystick, defaulting to UP');
      return InputAction.JOYSTICK_UP;
    }

    // Get mesh center position
    const meshCenter = new THREE.Vector3();
    mesh.getWorldPosition(meshCenter);

    // Calculate relative position from center
    const relativeX = intersectionPoint.x - meshCenter.x;
    const relativeY = intersectionPoint.y - meshCenter.y;

    console.log('Joystick click - Center:', meshCenter, 'Intersection:', intersectionPoint, 'Relative:', { relativeX, relativeY });

    // Use a threshold to avoid tiny movements
    const threshold = 0.001;
    
    // Determine direction based on which axis has greater magnitude
    if (Math.abs(relativeX) > Math.abs(relativeY) && Math.abs(relativeX) > threshold) {
      // Horizontal movement dominates
      const direction = relativeX > 0 ? InputAction.JOYSTICK_RIGHT : InputAction.JOYSTICK_LEFT;
      console.log('Joystick direction:', direction);
      return direction;
    } else if (Math.abs(relativeY) > threshold) {
      // Vertical movement dominates
      const direction = relativeY > 0 ? InputAction.JOYSTICK_UP : InputAction.JOYSTICK_DOWN;
      console.log('Joystick direction:', direction);
      return direction;
    } else {
      console.log('Joystick click too close to center, defaulting to UP');
      return InputAction.JOYSTICK_UP;
    }
  }

  /**
   * Determine d-pad direction based on which zone was clicked
   */
  private getDpadDirection(mesh: THREE.Mesh): InputAction {
    const intersectionPoint = (mesh as any).lastIntersectionPoint as THREE.Vector3;
    
    if (!intersectionPoint) {
      console.warn('No intersection point for d-pad, defaulting to UP');
      return InputAction.DPAD_UP;
    }

    // Get mesh center position
    const meshCenter = new THREE.Vector3();
    mesh.getWorldPosition(meshCenter);

    // Calculate relative position from center
    const relativeX = intersectionPoint.x - meshCenter.x;
    const relativeY = intersectionPoint.y - meshCenter.y;

    console.log('D-pad click - relativeX:', relativeX.toFixed(4), 'relativeY:', relativeY.toFixed(4));

    // Use a minimum threshold to avoid center clicks
    const minThreshold = 0.015; // 1.5cm minimum distance from center
    
    // Check if click is far enough from center
    if (Math.abs(relativeX) < minThreshold && Math.abs(relativeY) < minThreshold) {
      console.log('D-pad click too close to center, defaulting to UP');
      return InputAction.DPAD_UP;
    }

    // Simple quadrant detection - whichever is larger determines direction
    // Add a bias factor to make it easier to hit UP/DOWN
    const horizontalBias = 1.2; // Horizontal needs to be 20% stronger to win
    
    if (Math.abs(relativeX) * horizontalBias > Math.abs(relativeY)) {
      // Horizontal dominates
      const direction = relativeX > 0 ? InputAction.DPAD_RIGHT : InputAction.DPAD_LEFT;
      console.log('D-pad direction:', direction, '(horizontal)');
      return direction;
    } else {
      // Vertical dominates
      const direction = relativeY > 0 ? InputAction.DPAD_UP : InputAction.DPAD_DOWN;
      console.log('D-pad direction:', direction, '(vertical)');
      return direction;
    }
  }

  /**
   * Core input handler with debouncing (SCREAMING_SNAKE_CASE per style guide)
   */
  HANDLE_BUTTON_PRESS(action: InputAction): void {
    // Check debouncing
    const now = Date.now();
    const lastTime = this.lastInputTime.get(action) || 0;
    const timeSinceLastInput = now - lastTime;
    
    if (timeSinceLastInput < TIMING.INPUT_DEBOUNCE_MS) {
      console.log(`Input debounced: ${action} (${timeSinceLastInput}ms since last)`);
      return; // Ignore rapid repeated inputs
    }

    console.log(`Input accepted: ${action}`);
    
    // Update last input time
    this.lastInputTime.set(action, now);

    // Emit input event to all registered callbacks
    this.emitInput(action);
  }

  /**
   * Register a callback for input events
   */
  on(event: 'input', callback: InputCallback): void {
    if (event === 'input') {
      this.inputCallbacks.push(callback);
    }
  }

  /**
   * Emit input event to all callbacks
   */
  private emitInput(action: InputAction): void {
    for (const callback of this.inputCallbacks) {
      callback(action);
    }
  }

  /**
   * Remove a callback
   */
  off(callback: InputCallback): void {
    const index = this.inputCallbacks.indexOf(callback);
    if (index > -1) {
      this.inputCallbacks.splice(index, 1);
    }
  }

  /**
   * Clear all input state
   */
  reset(): void {
    this.lastInputTime.clear();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.inputCallbacks = [];
    this.lastInputTime.clear();
    // Note: Event listeners would need to be stored to properly remove them
  }
}
