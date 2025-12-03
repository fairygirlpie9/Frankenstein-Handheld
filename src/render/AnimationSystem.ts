/**
 * AnimationSystem - Manages sprite animations for surgeon character and surgical objects
 * Following Mad Scientist Style Guide conventions
 */

import { SurgicalObjectType } from '../config/types';
import { TIMING } from '../config/constants';

// Animation frame data structure
interface AnimationFrame {
  x: number;      // X position in sprite sheet
  y: number;      // Y position in sprite sheet
  width: number;  // Frame width
  height: number; // Frame height
}

// Animation sequence definition
interface AnimationSequence {
  frames: AnimationFrame[];
  frameDuration: number;  // Duration per frame in ms
  loop: boolean;          // Whether animation loops
}

// Active animation state
interface ActiveAnimation {
  sequence: AnimationSequence;
  currentFrame: number;
  elapsedTime: number;
  isComplete: boolean;
}

export class AnimationSystem {
  private surgeonAnimations: Map<string, AnimationSequence>;
  private surgicalObjectAnimations: Map<SurgicalObjectType, AnimationSequence>;
  private activeSurgeonAnimation: ActiveAnimation | null;
  private activeSurgicalObjectAnimation: Map<SurgicalObjectType, ActiveAnimation>;
  
  // Placeholder sprite sheets (in-memory canvas)
  private surgeonSpriteSheet: HTMLCanvasElement;
  private surgicalObjectSpriteSheet: HTMLCanvasElement;

  constructor() {
    this.surgeonAnimations = new Map();
    this.surgicalObjectAnimations = new Map();
    this.activeSurgeonAnimation = null;
    this.activeSurgicalObjectAnimation = new Map();

    // Create placeholder sprite sheets
    this.surgeonSpriteSheet = this.createSurgeonSpriteSheet();
    this.surgicalObjectSpriteSheet = this.createSurgicalObjectSpriteSheet();

    // Define surgeon animation sequences
    this.defineSurgeonAnimations();
    
    // Define surgical object animation sequences
    this.defineSurgicalObjectAnimations();
  }

  /**
   * Create placeholder pixel art sprite sheet for surgeon
   * Simple colored rectangles/shapes representing different poses
   */
  private createSurgeonSpriteSheet(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 320;  // 5 frames x 64px
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create surgeon sprite sheet context');

    // Frame 0: Idle pose (white coat)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(10, 10, 44, 44);

    // Frame 1: Spray disinfectant (blue spray)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(64, 0, 64, 64);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(74, 10, 44, 44);
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(100, 20, 20, 10);

    // Frame 2: Slice incision (holding scalpel)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(128, 0, 64, 64);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(138, 10, 44, 44);
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(160, 30, 20, 4);

    // Frame 3: Remove organ (holding red object)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(192, 0, 64, 64);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(202, 10, 44, 44);
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(224, 25, 8, 0, Math.PI * 2);
    ctx.fill();

    // Frame 4: Connect wires (holding yellow wires)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(256, 0, 64, 64);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(266, 10, 44, 44);
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 30);
    ctx.lineTo(300, 30);
    ctx.stroke();

    return canvas;
  }

  /**
   * Create placeholder pixel art sprite sheet for surgical objects
   */
  private createSurgicalObjectSpriteSheet(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 288;  // 6 objects x 48px
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create surgical object sprite sheet context');

    const size = 48;

    // Object 0: Organ (red circle)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();

    // Object 1: Wires (yellow lines)
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(size, size / 2);
    ctx.lineTo(size * 2, size / 2);
    ctx.stroke();

    // Object 2: Needle/Thread (white diagonal line)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size * 2, 0);
    ctx.lineTo(size * 3, size);
    ctx.stroke();

    // Object 3: Scalpel (gray blade)
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(size * 3, size / 3, size, size / 3);
    ctx.fillStyle = '#666666';
    ctx.fillRect(size * 3, size / 3, size / 4, size / 3);

    // Object 4: Disinfectant (cyan bottle)
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(size * 4 + size / 4, 0, size / 2, size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size * 4 + size / 3, size / 4, size / 3, size / 2);

    // Object 5: Tools (gray instruments)
    ctx.fillStyle = '#888888';
    ctx.fillRect(size * 5, 0, size, size / 4);
    ctx.fillRect(size * 5, size / 2, size, size / 4);

    return canvas;
  }

  /**
   * Define animation sequences for surgeon actions
   */
  private defineSurgeonAnimations(): void {
    const frameSize = 64;
    const frameDuration = TIMING.FRAME_ANIMATION_MS;

    // Idle animation (single frame, loops)
    this.surgeonAnimations.set('idle', {
      frames: [{ x: 0, y: 0, width: frameSize, height: frameSize }],
      frameDuration,
      loop: true
    });

    // Spray disinfectant animation
    this.surgeonAnimations.set('spray_disinfectant', {
      frames: [
        { x: 0, y: 0, width: frameSize, height: frameSize },
        { x: frameSize, y: 0, width: frameSize, height: frameSize },
        { x: frameSize, y: 0, width: frameSize, height: frameSize }
      ],
      frameDuration,
      loop: false
    });

    // Slice incision animation
    this.surgeonAnimations.set('slice_incision', {
      frames: [
        { x: 0, y: 0, width: frameSize, height: frameSize },
        { x: frameSize * 2, y: 0, width: frameSize, height: frameSize },
        { x: frameSize * 2, y: 0, width: frameSize, height: frameSize }
      ],
      frameDuration,
      loop: false
    });

    // Remove organ animation
    this.surgeonAnimations.set('remove_organ', {
      frames: [
        { x: 0, y: 0, width: frameSize, height: frameSize },
        { x: frameSize * 3, y: 0, width: frameSize, height: frameSize },
        { x: frameSize * 3, y: 0, width: frameSize, height: frameSize }
      ],
      frameDuration,
      loop: false
    });

    // Connect wires animation
    this.surgeonAnimations.set('connect_wires', {
      frames: [
        { x: 0, y: 0, width: frameSize, height: frameSize },
        { x: frameSize * 4, y: 0, width: frameSize, height: frameSize },
        { x: frameSize * 4, y: 0, width: frameSize, height: frameSize }
      ],
      frameDuration,
      loop: false
    });

    // Sew stitches animation (reuses needle/thread frame)
    this.surgeonAnimations.set('sew_stitches', {
      frames: [
        { x: 0, y: 0, width: frameSize, height: frameSize },
        { x: frameSize * 2, y: 0, width: frameSize, height: frameSize },
        { x: frameSize * 2, y: 0, width: frameSize, height: frameSize }
      ],
      frameDuration,
      loop: false
    });
  }

  /**
   * Define animation sequences for surgical objects
   */
  private defineSurgicalObjectAnimations(): void {
    const frameSize = 48;
    const frameDuration = TIMING.FRAME_ANIMATION_MS;

    // Each object has a simple appear animation (single frame)
    this.surgicalObjectAnimations.set(SurgicalObjectType.ORGAN, {
      frames: [{ x: 0, y: 0, width: frameSize, height: frameSize }],
      frameDuration,
      loop: false
    });

    this.surgicalObjectAnimations.set(SurgicalObjectType.WIRES, {
      frames: [{ x: frameSize, y: 0, width: frameSize, height: frameSize }],
      frameDuration,
      loop: false
    });

    this.surgicalObjectAnimations.set(SurgicalObjectType.NEEDLE_THREAD, {
      frames: [{ x: frameSize * 2, y: 0, width: frameSize, height: frameSize }],
      frameDuration,
      loop: false
    });

    this.surgicalObjectAnimations.set(SurgicalObjectType.SCALPEL, {
      frames: [{ x: frameSize * 3, y: 0, width: frameSize, height: frameSize }],
      frameDuration,
      loop: false
    });

    this.surgicalObjectAnimations.set(SurgicalObjectType.DISINFECTANT, {
      frames: [{ x: frameSize * 4, y: 0, width: frameSize, height: frameSize }],
      frameDuration,
      loop: false
    });

    this.surgicalObjectAnimations.set(SurgicalObjectType.TOOLS, {
      frames: [{ x: frameSize * 5, y: 0, width: frameSize, height: frameSize }],
      frameDuration,
      loop: false
    });
  }

  /**
   * Load surgeon sprite sheet (for future use with actual image files)
   */
  loadSurgeonAnimations(spriteSheet: HTMLImageElement): void {
    // In a full implementation, this would load an actual sprite sheet image
    // For now, we use the placeholder canvas
    console.log('Surgeon sprite sheet loaded:', spriteSheet.src);
  }

  /**
   * Load surgical object sprite sheet (for future use with actual image files)
   */
  loadSurgicalObjectAnimations(spriteSheet: HTMLImageElement): void {
    // In a full implementation, this would load an actual sprite sheet image
    // For now, we use the placeholder canvas
    console.log('Surgical object sprite sheet loaded:', spriteSheet.src);
  }

  /**
   * Play surgeon animation
   */
  playSurgeonAnimation(animationKey: string): void {
    const sequence = this.surgeonAnimations.get(animationKey);
    if (!sequence) {
      console.warn(`Surgeon animation not found: ${animationKey}`);
      return;
    }

    this.activeSurgeonAnimation = {
      sequence,
      currentFrame: 0,
      elapsedTime: 0,
      isComplete: false
    };
  }

  /**
   * Play surgical object animation
   */
  playSurgicalObjectAnimation(objectType: SurgicalObjectType): void {
    const sequence = this.surgicalObjectAnimations.get(objectType);
    if (!sequence) {
      console.warn(`Surgical object animation not found: ${objectType}`);
      return;
    }

    this.activeSurgicalObjectAnimation.set(objectType, {
      sequence,
      currentFrame: 0,
      elapsedTime: 0,
      isComplete: false
    });
  }

  /**
   * Get current surgeon animation frame data
   * Returns animation key and frame for rendering
   */
  getSurgeonFrame(): { animationKey: string; frame: AnimationFrame; spriteSheet: HTMLCanvasElement } | null {
    if (!this.activeSurgeonAnimation) {
      // Return idle frame by default
      const idleSequence = this.surgeonAnimations.get('idle');
      if (idleSequence) {
        return {
          animationKey: 'idle',
          frame: idleSequence.frames[0],
          spriteSheet: this.surgeonSpriteSheet
        };
      }
      return null;
    }

    const { sequence, currentFrame } = this.activeSurgeonAnimation;
    return {
      animationKey: 'active',
      frame: sequence.frames[currentFrame],
      spriteSheet: this.surgeonSpriteSheet
    };
  }

  /**
   * Get current surgical object animation frame
   */
  getSurgicalObjectFrame(objectType: SurgicalObjectType): { frame: AnimationFrame; spriteSheet: HTMLCanvasElement } | null {
    const activeAnim = this.activeSurgicalObjectAnimation.get(objectType);
    if (!activeAnim) {
      return null;
    }

    const { sequence, currentFrame } = activeAnim;
    return {
      frame: sequence.frames[currentFrame],
      spriteSheet: this.surgicalObjectSpriteSheet
    };
  }

  /**
   * Check if surgeon animation is complete
   */
  isSurgeonAnimationComplete(): boolean {
    return this.activeSurgeonAnimation?.isComplete ?? true;
  }

  /**
   * Check if surgical object animation is complete
   */
  isSurgicalObjectAnimationComplete(objectType: SurgicalObjectType): boolean {
    return this.activeSurgicalObjectAnimation.get(objectType)?.isComplete ?? true;
  }

  /**
   * Stop surgeon animation
   */
  stopSurgeonAnimation(): void {
    this.activeSurgeonAnimation = null;
  }

  /**
   * Stop surgical object animation
   */
  stopSurgicalObjectAnimation(objectType: SurgicalObjectType): void {
    this.activeSurgicalObjectAnimation.delete(objectType);
  }

  /**
   * Update animations based on delta time
   */
  update(deltaTime: number): void {
    // Update surgeon animation
    if (this.activeSurgeonAnimation && !this.activeSurgeonAnimation.isComplete) {
      this.activeSurgeonAnimation.elapsedTime += deltaTime;

      const { sequence, elapsedTime } = this.activeSurgeonAnimation;
      const frameDuration = sequence.frameDuration;

      // Check if we should advance to next frame
      if (elapsedTime >= frameDuration) {
        this.activeSurgeonAnimation.elapsedTime = 0;
        this.activeSurgeonAnimation.currentFrame++;

        // Check if animation is complete
        if (this.activeSurgeonAnimation.currentFrame >= sequence.frames.length) {
          if (sequence.loop) {
            this.activeSurgeonAnimation.currentFrame = 0;
          } else {
            this.activeSurgeonAnimation.currentFrame = sequence.frames.length - 1;
            this.activeSurgeonAnimation.isComplete = true;
          }
        }
      }
    }

    // Update surgical object animations
    for (const [, activeAnim] of this.activeSurgicalObjectAnimation.entries()) {
      if (activeAnim.isComplete) continue;

      activeAnim.elapsedTime += deltaTime;

      const { sequence, elapsedTime } = activeAnim;
      const frameDuration = sequence.frameDuration;

      // Check if we should advance to next frame
      if (elapsedTime >= frameDuration) {
        activeAnim.elapsedTime = 0;
        activeAnim.currentFrame++;

        // Check if animation is complete
        if (activeAnim.currentFrame >= sequence.frames.length) {
          if (sequence.loop) {
            activeAnim.currentFrame = 0;
          } else {
            activeAnim.currentFrame = sequence.frames.length - 1;
            activeAnim.isComplete = true;
          }
        }
      }
    }
  }

  /**
   * Get all available surgeon animation keys
   */
  getAvailableSurgeonAnimations(): string[] {
    return Array.from(this.surgeonAnimations.keys());
  }

  /**
   * Get all available surgical object types
   */
  getAvailableSurgicalObjects(): SurgicalObjectType[] {
    return Array.from(this.surgicalObjectAnimations.keys());
  }
}
