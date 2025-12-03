/**
 * ScreenRenderer - Manages 2D canvas rendering for the screen mesh
 * Following Mad Scientist Style Guide conventions
 */

import * as THREE from 'three';
import { ScreenRenderConfig, EKGState } from '../config/types';
import { EKG_PATTERNS, VISUAL } from '../config/constants';

export class ScreenRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private config: ScreenRenderConfig;
  private monsterImages: Map<string, HTMLImageElement>;
  private surgeonHandImages: Map<string, HTMLImageElement>;
  private tableImage?: HTMLImageElement;
  private currentSurgeonHand: string = 'idle';

  constructor(config?: Partial<ScreenRenderConfig>) {
    // Initialize configuration with defaults
    this.config = {
      width: config?.width ?? VISUAL.SCREEN_WIDTH,
      height: config?.height ?? VISUAL.SCREEN_HEIGHT,
      pixelSize: config?.pixelSize ?? VISUAL.PIXEL_SIZE,
      scanlineIntensity: config?.scanlineIntensity ?? VISUAL.SCANLINE_INTENSITY,
      glitchIntensity: config?.glitchIntensity ?? VISUAL.GLITCH_INTENSITY
    };

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;

    // Get 2D context
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;

    // Create THREE.js texture from canvas
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;

    // Initialize monster images
    this.monsterImages = new Map();
    this.surgeonHandImages = new Map();
    this.loadMonsterImages();
    this.loadSurgeonHandImages();
    this.loadTableImage();

    // Initialize with clear screen
    this.clear();
  }

  /**
   * Load monster PNG images
   */
  private loadMonsterImages(): void {
    const states = ['calm', 'angry', 'alive'];
    states.forEach(state => {
      const img = new Image();
      img.src = `assets/frankenstein-${state}.png`;
      img.onload = () => {
        console.log(`Loaded monster image: ${state}`);
      };
      img.onerror = () => {
        console.error(`Failed to load monster image: ${state}`);
      };
      this.monsterImages.set(state, img);
    });
  }

  /**
   * Load surgeon hand PNG images
   */
  private loadSurgeonHandImages(): void {
    const hands = ['idle', 'incision', 'organ', 'sew', 'spray', 'wires'];
    hands.forEach(hand => {
      const img = new Image();
      img.src = `assets/frankenstein-${hand}.png`;
      img.onload = () => {
        console.log(`Loaded surgeon hand image: ${hand}`);
      };
      img.onerror = () => {
        console.error(`Failed to load surgeon hand image: ${hand}`);
      };
      this.surgeonHandImages.set(hand, img);
    });
  }

  /**
   * Load table PNG image
   */
  private loadTableImage(): void {
    const img = new Image();
    img.src = 'assets/frankenstein-table.png';
    img.onload = () => {
      console.log('Loaded table image');
    };
    img.onerror = () => {
      console.error('Failed to load table image');
    };
    this.tableImage = img;
  }

  /**
   * Set the current surgeon hand animation
   */
  setSurgeonHand(action: string): void {
    const handMap: Record<string, string> = {
      'spray_disinfectant': 'spray',
      'slice_incision': 'incision',
      'remove_organ': 'organ',
      'connect_wires': 'wires',
      'sew_stitches': 'sew',
      'idle': 'idle'
    };
    
    this.currentSurgeonHand = handMap[action] || 'idle';
  }

  /**
   * Draw table image behind monster
   */
  private drawTable(): void {
    if (!this.tableImage || !this.tableImage.complete) return;

    // Table should be behind monster, same position, 50% larger
    const baseX = 156;
    const baseY = 140;
    const baseWidth = 300; // 200 * 1.5
    const baseHeight = 225; // 150 * 1.5
    
    // Center the enlarged image
    const x = baseX - (baseWidth - 200) / 2;
    const y = baseY - (baseHeight - 150) / 2;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(this.tableImage, x, y, baseWidth, baseHeight);
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Draw monster image on screen with pulsing animation
   * @param state - Monster state (calm, angry, alive)
   * @param time - Current time for animation (in seconds)
   */
  drawMonster(state: 'calm' | 'angry' | 'alive', time: number): void {
    // Draw table first (behind monster)
    this.drawTable();

    const img = this.monsterImages.get(state);
    if (!img || !img.complete) return;

    // Fixed position - centered horizontally, positioned for visibility
    // 50% larger base size
    const baseX = 156;
    const baseY = 140;
    const baseWidth = 300; // 200 * 1.5
    const baseHeight = 225; // 150 * 1.5

    // Calculate pulse based on state
    let pulseAmount = 0;
    let pulseSpeed = 0;
    
    switch (state) {
      case 'calm':
        pulseAmount = 0.02; // 2% pulse
        pulseSpeed = 1.5;   // Slow pulse
        break;
      case 'alive':
        pulseAmount = 0.06; // 6% pulse
        pulseSpeed = 3.0;   // Medium pulse
        break;
      case 'angry':
        pulseAmount = 0.12; // 12% pulse
        pulseSpeed = 5.0;   // Fast pulse
        break;
    }

    // Calculate pulsing scale
    const pulse = Math.sin(time * pulseSpeed) * pulseAmount;
    const scale = 1 + pulse;
    
    const width = baseWidth * scale;
    const height = baseHeight * scale;
    
    // Center the enlarged image
    const x = baseX - (width - 200) / 2;
    const y = baseY - (height - 150) / 2;

    // Draw with reduced pixelation for clarity
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(img, x, y, width, height);
    this.ctx.imageSmoothingEnabled = false;

    // Draw surgeon hands on top
    this.drawSurgeonHands(time);
  }

  /**
   * Draw surgeon hands with animation
   */
  private drawSurgeonHands(time: number): void {
    const img = this.surgeonHandImages.get(this.currentSurgeonHand);
    if (!img || !img.complete) return;

    // Use the same time parameter as the monster for consistent animation
    const animTime = time;

    // Same dimensions as monster/table for overlay, 50% larger
    const baseX = 156;
    const baseY = 140;
    const baseWidth = 300; // 200 * 1.5
    const baseHeight = 225; // 150 * 1.5

    // Different animations based on hand type - scaled up for larger images
    let offsetX = 0;
    let offsetY = 0;

    switch (this.currentSurgeonHand) {
      case 'incision':
        // Straight cutting motion (up and down)
        offsetY = Math.sin(animTime * 3) * 6;
        break;
      case 'spray':
        // Circular spraying motion
        offsetX = Math.sin(animTime * 4) * 8;
        offsetY = Math.cos(animTime * 4) * 8;
        break;
      case 'organ':
      case 'wires':
      case 'sew':
        // Subtle two-hand movement
        offsetX = Math.sin(animTime * 2) * 4;
        offsetY = Math.cos(animTime * 2.5) * 3;
        break;
      case 'idle':
        // Gentle idle breathing movement
        offsetY = Math.sin(animTime * 1.5) * 3;
        break;
    }

    // Center the enlarged image
    const x = baseX - (baseWidth - 200) / 2 + offsetX;
    const y = baseY - (baseHeight - 150) / 2 + offsetY;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(img, x, y, baseWidth, baseHeight);
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Get the canvas texture for mapping to screen mesh
   */
  getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
  }

  /**
   * Update the texture to reflect canvas changes
   */
  updateTexture(): void {
    try {
      this.texture.needsUpdate = true;
    } catch (error) {
      console.error('Failed to update texture:', error);
    }
  }

  /**
   * Apply CRT scanline effect
   */
  applyScanlines(): void {
    const intensity = this.config.scanlineIntensity;
    const lineHeight = 2;

    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;

    for (let y = 0; y < this.config.height; y += lineHeight * 2) {
      this.ctx.fillRect(0, y, this.config.width, lineHeight);
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Apply glitch effect with chromatic aberration (reduced intensity for monster visibility)
   */
  applyGlitchEffect(intensity: number = this.config.glitchIntensity, skipMonsterArea: boolean = true): void {
    const imageData = this.ctx.getImageData(0, 0, this.config.width, this.config.height);
    const offset = Math.floor(intensity * 5); // Reduced from 10 to 5

    // Create temporary canvas for chromatic aberration
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.config.width;
    tempCanvas.height = this.config.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Copy original
    tempCtx.putImageData(imageData, 0, 0);

    // Clear and redraw with channel separation
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);

    // Red channel shifted left
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.globalAlpha = 0.8;
    this.ctx.drawImage(tempCanvas, -offset, 0);

    // Green channel (original position)
    this.ctx.globalAlpha = 0.8;
    this.ctx.drawImage(tempCanvas, 0, 0);

    // Blue channel shifted right
    this.ctx.globalAlpha = 0.8;
    this.ctx.drawImage(tempCanvas, offset, 0);

    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1.0;

    // Add random horizontal glitch lines (but avoid monster area if specified)
    const glitchLineCount = Math.floor(intensity * 3); // Reduced from 5 to 3
    for (let i = 0; i < glitchLineCount; i++) {
      let y = Math.floor(Math.random() * this.config.height);
      
      // Skip monster area (y: 140-290) if requested
      if (skipMonsterArea && y > 140 && y < 290) {
        continue;
      }
      
      const height = Math.floor(Math.random() * 5) + 1; // Reduced from 10 to 5
      const xOffset = Math.floor((Math.random() - 0.5) * offset * 2);

      this.ctx.drawImage(
        tempCanvas,
        0, y, this.config.width, height,
        xOffset, y, this.config.width, height
      );
    }
  }

  /**
   * Draw text prompt for ritual step instructions
   */
  drawPrompt(text: string, y: number = 100): void {
    this.ctx.font = 'bold 24px monospace';
    this.ctx.fillStyle = '#00ff00';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Draw text with pixel art style (no anti-aliasing simulation)
    this.ctx.fillText(text, this.config.width / 2, y);
  }

  /**
   * Draw time indicator with countdown and warning colors
   */
  drawTimeIndicator(timeRemaining: number, timeLimit: number): void {
    const percentage = timeRemaining / timeLimit;
    const barWidth = 300;
    const barHeight = 20;
    const x = (this.config.width - barWidth) / 2;
    const y = 50;

    // Determine color based on remaining time
    let color = '#00ff00'; // Green
    if (percentage < 0.3) {
      color = '#ff0000'; // Red (warning)
    } else if (percentage < 0.5) {
      color = '#ffff00'; // Yellow
    }

    // Draw background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Draw filled portion
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, barWidth * Math.max(0, percentage), barHeight);

    // Draw border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, barWidth, barHeight);

    // Draw time text
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      `${Math.ceil(timeRemaining)}s`,
      this.config.width / 2,
      y + barHeight / 2
    );
  }

  /**
   * Draw idle screen with start prompt
   */
  drawIdleScreen(levelNumber?: number): void {
    this.clear();

    // Draw title
    this.ctx.font = 'bold 48px monospace';
    this.ctx.fillStyle = '#00ff00';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('FRANKENSTEIN', this.config.width / 2, 60);

    // Draw subtitle
    this.ctx.font = 'bold 24px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('RITUAL GAME', this.config.width / 2, 100);

    // Draw level number if provided
    if (levelNumber !== undefined && levelNumber > 1) {
      this.ctx.font = 'bold 20px monospace';
      this.ctx.fillStyle = '#00ffff';
      this.ctx.fillText(`LEVEL ${levelNumber}`, this.config.width / 2, 135);
    }

    // Draw instructions - 50% larger font
    this.ctx.font = '18px monospace'; // 12 * 1.5 = 18
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.textAlign = 'left';
    
    const instructions = [
      'CONTROLS:',
      'Arrows-Joystick  WASD-DPad',
      'Z-ButtonA  X-ButtonB  Enter-Start'
    ];
    
    let y = 170;
    instructions.forEach(line => {
      this.ctx.fillText(line, 40, y);
      y += 24; // 16 * 1.5 = 24
    });

    // Draw start prompt - moved down for better spacing
    this.ctx.font = 'bold 24px monospace';
    this.ctx.fillStyle = '#ffff00';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('>>> PRESS NOSE TO START <<<', this.config.width / 2, 300);

    this.applyScanlines();
    this.updateTexture();
  }

  /**
   * Draw "IT'S ALIVE" success screen
   */
  drawItsAliveScreen(levelNumber?: number): void {
    this.clear();

    // Draw main text
    this.ctx.font = 'bold 64px monospace';
    this.ctx.fillStyle = '#00ff00';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText("IT'S ALIVE!", this.config.width / 2, this.config.height / 2);

    // Draw level completed
    if (levelNumber !== undefined) {
      this.ctx.font = 'bold 24px monospace';
      this.ctx.fillStyle = '#00ffff';
      this.ctx.fillText(`LEVEL ${levelNumber} COMPLETE!`, this.config.width / 2, this.config.height / 2 + 60);
    }

    // Draw lightning effect (simple zigzag lines)
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 3;
    const lightningCount = 3;
    for (let i = 0; i < lightningCount; i++) {
      const startX = Math.random() * this.config.width;
      const startY = 0;
      let currentX = startX;
      let currentY = startY;

      this.ctx.beginPath();
      this.ctx.moveTo(currentX, currentY);

      while (currentY < this.config.height) {
        currentX += (Math.random() - 0.5) * 50;
        currentY += Math.random() * 50 + 20;
        this.ctx.lineTo(currentX, currentY);
      }

      this.ctx.stroke();
    }

    this.applyScanlines();
    this.updateTexture();
  }

  /**
   * Draw EKG waveform based on monster state
   */
  drawEKG(golem_state: EKGState, time: number, golem_madnessLevel: number = 0): void {
    const pattern = EKG_PATTERNS[golem_state];
    const baselineY = VISUAL.EKG_BASELINE_Y;
    const waveform = pattern.waveform;
    const frequency = pattern.frequency;
    const amplitude = pattern.amplitude * (1 + golem_madnessLevel * 0.1);

    // Calculate scroll offset based on time and frequency
    const scrollSpeed = frequency * 100;
    const offset = (time * scrollSpeed) % this.config.width;

    // Draw EKG background
    this.ctx.fillStyle = '#001100';
    this.ctx.fillRect(0, baselineY - VISUAL.EKG_LINE_HEIGHT / 2, this.config.width, VISUAL.EKG_LINE_HEIGHT);

    // Draw baseline
    this.ctx.strokeStyle = '#003300';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, baselineY);
    this.ctx.lineTo(this.config.width, baselineY);
    this.ctx.stroke();

    // Draw waveform
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const waveformLength = waveform.length;
    const segmentWidth = this.config.width / 20; // Number of waveforms to display

    for (let x = 0; x < this.config.width; x++) {
      const adjustedX = (x + offset) % this.config.width;
      const waveformIndex = Math.floor((adjustedX / segmentWidth) * waveformLength) % waveformLength;
      const y = baselineY - waveform[waveformIndex] * amplitude;

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  /**
   * Draw surgeon character sprite from sprite sheet
   */
  drawSurgeon(
    spriteSheet: HTMLCanvasElement | HTMLImageElement,
    frameX: number,
    frameY: number,
    frameWidth: number,
    frameHeight: number,
    x: number,
    y: number
  ): void {
    this.ctx.drawImage(
      spriteSheet,
      frameX, frameY, frameWidth, frameHeight,
      x, y, frameWidth, frameHeight
    );
  }

  /**
   * Draw surgical object sprite from sprite sheet
   */
  drawSurgicalObject(
    spriteSheet: HTMLCanvasElement | HTMLImageElement,
    frameX: number,
    frameY: number,
    frameWidth: number,
    frameHeight: number,
    x: number,
    y: number
  ): void {
    this.ctx.drawImage(
      spriteSheet,
      frameX, frameY, frameWidth, frameHeight,
      x, y, frameWidth, frameHeight
    );
  }

  /**
   * Get canvas element (for debugging)
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get rendering context (for advanced operations)
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.texture.dispose();
  }
}
