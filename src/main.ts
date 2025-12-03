/**
 * Main entry point for the Frankenstein Ritual Game
 * Initializes the game and starts the main loop
 */

import { SceneManager } from './render/SceneManager';
import { ScreenRenderer } from './render/ScreenRenderer';
import { GameController } from './logic/GameController';
import * as THREE from 'three';

// Get canvas element
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const loadingElement = document.getElementById('loading') as HTMLDivElement;
const errorElement = document.getElementById('error') as HTMLDivElement;
const audioToggleButton = document.getElementById('audio-toggle') as HTMLButtonElement;
const volumeControl = document.getElementById('volume-control') as HTMLDivElement;
const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
const volumeLabel = document.getElementById('volume-label') as HTMLDivElement;

if (!canvas) {
  throw new Error('Canvas element not found');
}

// Initialize subsystems
let sceneManager: SceneManager | null = null;
let screenRenderer: ScreenRenderer | null = null;
let gameController: GameController | null = null;

// Audio toggle state
let audioEnabled = false;

/**
 * Initialize the game
 */
async function init() {
  try {
    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create scene manager
    sceneManager = new SceneManager(canvas);
    
    // Load the Frankenstein console model
    await sceneManager.LOAD_MODEL('/assets/models/franken.glb');
    
    // Create screen renderer
    screenRenderer = new ScreenRenderer();
    
    // Apply screen texture to the screen mesh
    const screenMesh = sceneManager.getMesh('screen');
    if (screenMesh) {
      const material = screenMesh.material as THREE.MeshStandardMaterial;
      const texture = screenRenderer.getTexture();
      
      // Flip texture vertically
      texture.repeat.y = -1;
      texture.offset.y = 1;
      
      material.map = texture;
      // Use white emissive to preserve PNG colors while adding glow
      material.emissive.setHex(0xffffff);
      material.emissiveIntensity = 0.4; // Subtle glow that preserves colors
      material.emissiveMap = texture;
      material.needsUpdate = true;
      console.log('Screen texture applied successfully');
    } else {
      console.warn('Screen mesh not found - display will not work correctly');
    }
    
    // Create game controller
    gameController = new GameController(sceneManager, screenRenderer);
    
    // Setup audio toggle button
    setupAudioToggle(gameController);
    
    // Hide loading message
    loadingElement.style.display = 'none';
    
    // Start game
    gameController.start();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (sceneManager) {
        sceneManager.handleResize(window.innerWidth, window.innerHeight);
      }
    });
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
    errorElement.textContent = `ERROR: Failed to load console\n${error}`;
  }
}

/**
 * Setup audio toggle button
 */
function setupAudioToggle(controller: GameController) {
  // Set initial volume to 80%
  controller.audioSystem.setVolume(80);
  
  audioToggleButton.addEventListener('click', async () => {
    audioEnabled = !audioEnabled;
    
    if (audioEnabled) {
      // Enable audio
      await controller.audioSystem.startAudio();
      controller.audioSystem.unmute();
      audioToggleButton.textContent = '🔊 AUDIO ON';
      audioToggleButton.classList.remove('muted');
      volumeControl.classList.add('visible');
    } else {
      // Disable audio
      controller.audioSystem.mute();
      audioToggleButton.textContent = '🔇 AUDIO OFF';
      audioToggleButton.classList.add('muted');
      volumeControl.classList.remove('visible');
    }
  });
  
  // Volume slider
  volumeSlider.addEventListener('input', () => {
    const volume = parseInt(volumeSlider.value);
    controller.audioSystem.setVolume(volume);
    volumeLabel.textContent = `VOLUME: ${volume}%`;
  });
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
  if (gameController) {
    gameController.dispose();
  }
  if (sceneManager) {
    sceneManager.dispose();
  }
});

// Start the game
init();
