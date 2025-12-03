/**
 * GameController - Main game orchestrator
 * Coordinates all subsystems and manages game loop
 */

import { GameFSM } from './GameFSM';
import { InputManager } from './InputManager';
import { SceneManager } from '../render/SceneManager';
import { ScreenRenderer } from '../render/ScreenRenderer';
import { AnimationSystem } from '../render/AnimationSystem';
import { AudioSystem } from '../render/AudioSystem';
import { 
  VALIDATE_RITUAL_ACTION, 
  COMPLETE_RITUAL_STEP, 
  HANDLE_RITUAL_FAILURE,
  RETRY_RITUAL,
  START_NEW_RITUAL
} from './RitualLogic';
import { InputAction, GameState } from '../config/types';
import { getRitualForLevel } from '../config/rituals';
import { TIMING } from '../config/constants';

export class GameController {
  private fsm: GameFSM;
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private screenRenderer: ScreenRenderer;
  private animationSystem: AnimationSystem;
  public audioSystem: AudioSystem; // Public so audio toggle can access it
  private lastFrameTime: number;
  private animationFrameId: number | null;
  private currentLevel: number;
  private animationDelayActive: boolean = false;

  constructor(
    sceneManager: SceneManager,
    screenRenderer: ScreenRenderer
  ) {
    this.sceneManager = sceneManager;
    this.screenRenderer = screenRenderer;
    this.animationSystem = new AnimationSystem();
    this.audioSystem = new AudioSystem();
    this.currentLevel = 1;

    // Initialize FSM with level 1 ritual
    const initialRitual = getRitualForLevel(1);
    this.fsm = new GameFSM(initialRitual);

    // Initialize input manager
    this.inputManager = new InputManager(
      sceneManager.getScene(),
      sceneManager.getCamera()
    );

    // Setup input listeners
    this.inputManager.initKeyboardInput();
    this.inputManager.initTouchInput();

    // Register input handler
    this.inputManager.on('input', (action) => this.handleInput(action));

    // Register state change handler
    this.fsm.on('stateChange', (newState, stateData) => {
      console.log(`State changed to: ${newState}`, stateData);
      
      // Trigger effects when entering RITUAL_STEP state
      if (newState === GameState.STATE_RITUAL_STEP) {
        this.sceneManager.CREATE_ELECTRIC_SPARKS();
      }
      
      // Trigger effects when entering ITS_ALIVE state
      if (newState === GameState.STATE_ITS_ALIVE) {
        this.triggerLevelComplete();
      }
      
      // Trigger effects when entering MONSTER_MAD state
      if (newState === GameState.STATE_MONSTER_MAD) {
        this.triggerMonsterMad();
      }
      
      // Clean up particles when returning to IDLE
      if (newState === GameState.STATE_IDLE) {
        this.sceneManager.REMOVE_PARTICLE_SYSTEM();
      }
    });

    this.lastFrameTime = performance.now();
    this.animationFrameId = null;

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  start(): void {
    this.lastFrameTime = performance.now();
    this.sceneManager.ANIMATE_IDLE();
    this.sceneManager.ANIMATE_TOP_STITCHES_CONTINUOUS();
    
    this.update();
  }

  private update = (): void => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    this.fsm.updateTime(deltaTime);
    this.animationSystem.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.update);
  };

  handleInput(action: InputAction): void {
    const state = this.fsm.getCurrentState();
    console.log(`GameController.handleInput: ${action} in state ${state}, animationDelayActive: ${this.animationDelayActive}`);
    
    // Animate controls based on input (always show visual feedback)
    if (action === InputAction.JOYSTICK_UP || action === InputAction.JOYSTICK_DOWN || 
        action === InputAction.JOYSTICK_LEFT || action === InputAction.JOYSTICK_RIGHT) {
      this.sceneManager.ANIMATE_JOYSTICK(action);
    } else if (action === InputAction.DPAD_UP || action === InputAction.DPAD_DOWN || 
               action === InputAction.DPAD_LEFT || action === InputAction.DPAD_RIGHT) {
      this.sceneManager.ANIMATE_DPAD(action);
    } else if (action === InputAction.BUTTON_A || action === InputAction.BUTTON_B) {
      this.sceneManager.ANIMATE_BUTTON(action);
    } else if (action === InputAction.BUTTON_START) {
      this.sceneManager.ANIMATE_BUTTON_START();
    }
    
    // Block input during animation delay, EXCEPT for START button
    if (this.animationDelayActive && action !== InputAction.BUTTON_START) {
      console.log('Input blocked during animation delay');
      return;
    }

    switch (state) {
      case GameState.STATE_IDLE:
        if (action === InputAction.BUTTON_START) {
          this.audioSystem.playStartSound();
          this.startLevel(this.currentLevel);
        }
        break;

      case GameState.STATE_RITUAL_STEP:
        if (this.validateAction(action)) {
          this.triggerCorrectFeedback();
          this.audioSystem.playElectricZap();
        } else {
          this.triggerIncorrectFeedback();
          this.audioSystem.playErrorSound();
        }
        break;

      case GameState.STATE_MONSTER_MAD:
        console.log('=== IN MONSTER_MAD STATE ===');
        console.log('Action received:', action);
        console.log('BUTTON_START constant:', InputAction.BUTTON_START);
        console.log('Are they equal?', action === InputAction.BUTTON_START);
        console.log('animationDelayActive:', this.animationDelayActive);
        
        if (action === InputAction.BUTTON_START) {
          console.log('>>> CALLING RETRY_RITUAL <<<');
          RETRY_RITUAL(this.fsm);
          console.log('>>> RETRY_RITUAL COMPLETED <<<');
          console.log('New state:', this.fsm.getCurrentState());
        } else {
          console.log('Action was not BUTTON_START, ignoring');
        }
        break;

      case GameState.STATE_ITS_ALIVE:
        if (action === InputAction.BUTTON_START) {
          this.completeLevel();
        }
        break;
    }
  }

  validateAction(action: InputAction): boolean {
    const currentStep = this.fsm.getCurrentStep();
    if (!currentStep) return false;
    return VALIDATE_RITUAL_ACTION(action, currentStep.correctAction);
  }

  triggerCorrectFeedback(): void {
    const currentStep = this.fsm.getCurrentStep();
    if (!currentStep) return;

    this.animationSystem.playSurgeonAnimation(currentStep.surgeonAnimation);

    if (currentStep.surgicalObject) {
      this.animationSystem.playSurgicalObjectAnimation(currentStep.surgicalObject);
    }

    COMPLETE_RITUAL_STEP(this.fsm);
  }

  triggerIncorrectFeedback(): void {
    this.sceneManager.ANIMATE_BOLTS(TIMING.ANIMATION_BOLT_SHAKE_MS);
    this.sceneManager.ANIMATE_EYES(2.0, TIMING.ANIMATION_EYE_GLOW_MS);
    this.sceneManager.SET_FRANKENSTEIN_STATE('angry');

    HANDLE_RITUAL_FAILURE(this.fsm);
  }

  private render(): void {
    const state = this.fsm.getCurrentState();

    const stateData = this.fsm.getStateData();

    this.screenRenderer.clear();

    switch (state) {
      case GameState.STATE_IDLE:
        this.renderIdleState();
        break;

      case GameState.STATE_RITUAL_STEP:
        this.renderRitualStepState(stateData);
        break;

      case GameState.STATE_MONSTER_MAD:
        this.renderMonsterMadState();
        break;

      case GameState.STATE_ITS_ALIVE:
        this.renderItsAliveState();
        break;
    }

    this.screenRenderer.updateTexture();
    this.sceneManager.render();
  }

  private renderIdleState(): void {
    this.screenRenderer.drawIdleScreen(this.currentLevel);
  }

  private renderRitualStepState(stateData: any): void {
    const currentStep = this.fsm.getCurrentStep();
    if (!currentStep) return;

    const time = performance.now() / 1000;

    // Set surgeon hand to match the current step BEFORE drawing
    if (currentStep.surgeonAnimation) {
      this.screenRenderer.setSurgeonHand(currentStep.surgeonAnimation);
    }

    // Draw time indicator at top
    this.screenRenderer.drawTimeIndicator(
      stateData.timeRemaining,
      currentStep.timeLimit
    );

    // Draw prompt above monster (position 100)
    this.screenRenderer.drawPrompt(currentStep.promptText, 100);

    // Draw monster at fixed position (140-290 area) with pulsing
    let monsterState: "calm" | "angry" | "alive" = "calm";
    if (stateData.golem_madnessLevel > 2) {
      monsterState = "angry";
    }
    this.screenRenderer.drawMonster(monsterState, time);

    // Draw EKG at bottom
    this.screenRenderer.drawEKG(
      stateData.golem_current_state,
      time,
      stateData.golem_madnessLevel
    );

    // Apply scanlines only (no glitch during gameplay)
    this.screenRenderer.applyScanlines();
  }

  private renderMonsterMadState(): void {
    const time = performance.now() / 1000;

    // Set surgeon hands to idle for failure state
    this.screenRenderer.setSurgeonHand('idle');

    // Draw angry monster at fixed position with heavy pulsing
    this.screenRenderer.drawMonster("angry", time);

    // Draw failure message above monster
    this.screenRenderer.drawPrompt('MONSTER MAD!', 80);
    
    // Always show retry prompt - below monster
    this.screenRenderer.drawPrompt('Press NOSE to Retry', 310);

    // Apply glitch effect but skip monster area for visibility
    this.screenRenderer.applyGlitchEffect(0.6, true);
    this.screenRenderer.applyScanlines();
  }

  private renderItsAliveState(): void {
    const time = performance.now() / 1000;
    const ctx = this.screenRenderer.getContext();

    // Set surgeon hands to idle for celebration
    this.screenRenderer.setSurgeonHand('idle');

    // Draw alive monster at fixed position with strong pulsing
    this.screenRenderer.drawMonster("alive", time);

    // Draw main text above monster
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("IT'S ALIVE!", 256, 80);

    // Draw level completed below monster
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`LEVEL ${this.currentLevel} COMPLETE!`, 256, 310);

    // Draw lightning bolts on the sides (avoid monster area)
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    
    // Left lightning
    ctx.beginPath();
    ctx.moveTo(50, 0);
    let x = 50, y = 0;
    while (y < 380) {
      x += (Math.random() - 0.5) * 30;
      y += Math.random() * 40 + 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Right lightning
    ctx.beginPath();
    ctx.moveTo(462, 0);
    x = 462;
    y = 0;
    while (y < 380) {
      x += (Math.random() - 0.5) * 30;
      y += Math.random() * 40 + 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Always show continue prompt
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('Press NOSE for Next Level', 256, 350);

    this.screenRenderer.applyScanlines();
  }

  startLevel(levelNumber: number): void {
    console.log('>>> STARTING LEVEL', levelNumber);
    
    this.currentLevel = levelNumber;
    const ritual = getRitualForLevel(levelNumber);
    START_NEW_RITUAL(this.fsm, ritual);

    console.log('>>> Cleaning up animations and effects');
    this.sceneManager.FORCE_STOP_ALL_ANIMATIONS();
    this.sceneManager.STOP_BACKGROUND_FLASH();
    this.sceneManager.REMOVE_PARTICLE_SYSTEM();
    
    this.sceneManager.SET_FRANKENSTEIN_STATE('calm');
    this.sceneManager.ANIMATE_TOP_STITCHES_CONTINUOUS();
    
    // Reset surgeon hands to idle
    this.screenRenderer.setSurgeonHand('idle');
    
    this.animationDelayActive = false;
    
    console.log('>>> Level started');
  }

  completeLevel(): void {
    this.currentLevel++;
    this.startLevel(this.currentLevel);
  }

  triggerLevelComplete(): void {
    console.log('=== TRIGGERING LEVEL COMPLETE EFFECTS ===');
    
    this.sceneManager.SET_FRANKENSTEIN_STATE('alive');
    this.sceneManager.ANIMATE_ITS_ALIVE();
    this.sceneManager.ANIMATE_EYEBROWS();
    this.sceneManager.FLASH_BACKGROUND();
    
    // Success glow particles streaming upward
    this.sceneManager.CREATE_SUCCESS_GLOW();
    
    // Play "It's Alive!" voice-over and success sound
    this.audioSystem.playItsAlive();
    this.audioSystem.playSuccessSound();
    this.audioSystem.increaseStatic(1500);
    
    this.animationDelayActive = true;
    setTimeout(() => {
      this.animationDelayActive = false;
      console.log('=== ANIMATION DELAY COMPLETE - INPUT ENABLED ===');
    }, 2000);
    
    console.log('=== LEVEL COMPLETE EFFECTS TRIGGERED ===');
  }

  triggerMonsterMad(): void {
    console.log('=== TRIGGERING MONSTER MAD EFFECTS ===');
    
    // Explosive burst when player fails
    this.sceneManager.CREATE_EXPLOSION_BURST();
    
    // Increase static for dramatic effect
    this.audioSystem.increaseStatic(2000);
    
    this.animationDelayActive = true;
    setTimeout(() => {
      this.animationDelayActive = false;
      this.sceneManager.STOP_TOP_STITCHES_ANIMATION();
      this.sceneManager.ANIMATE_TOP_STITCHES_CONTINUOUS();
      console.log('=== ANIMATION DELAY COMPLETE - INPUT ENABLED ===');
    }, 2000);
  }

  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.sceneManager.handleResize(width, height);
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  dispose(): void {
    this.stop();
    this.inputManager.dispose();
    this.screenRenderer.dispose();
    this.audioSystem.dispose();
  }
}
