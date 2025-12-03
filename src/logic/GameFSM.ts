/**
 * GameFSM - Finite State Machine for game state management
 * Following Mad Scientist Style Guide conventions
 */

import { GameState, GameStateData, Ritual, EKGState } from '../config/types';
import { MISTAKE_THRESHOLDS } from '../config/constants';

// State change callback type
type StateChangeCallback = (newState: GameState, stateData: GameStateData) => void;

export class GameFSM {
  private stateData: GameStateData;
  private stateChangeCallbacks: StateChangeCallback[];

  constructor(initialRitual: Ritual) {
    this.stateData = {
      currentState: GameState.STATE_IDLE,
      currentRitual: initialRitual,
      currentStepIndex: 0,
      mistakeCount: 0,
      timeRemaining: initialRitual.steps[0]?.timeLimit || 5,
      golem_current_state: EKGState.STATE_CALM,
      golem_madnessLevel: 0,
      levelNumber: initialRitual.levelNumber
    };
    this.stateChangeCallbacks = [];
  }

  /**
   * Get current game state
   */
  getCurrentState(): GameState {
    return this.stateData.currentState;
  }

  /**
   * Get complete state data
   */
  getStateData(): GameStateData {
    return { ...this.stateData };
  }

  /**
   * Transition to a new state (SCREAMING_SNAKE_CASE per style guide)
   * Returns true if transition was valid, false otherwise
   */
  TRANSITION_TO_STATE(newState: GameState): boolean {
    const currentState = this.stateData.currentState;

    // Validate state transition
    if (!this.isValidTransition(currentState, newState)) {
      console.warn(`Invalid state transition: ${currentState} -> ${newState}`);
      return false;
    }

    // Update state
    this.stateData.currentState = newState;

    // Handle state entry logic
    this.onStateEnter(newState);

    // Emit state change event
    this.emitStateChange(newState);

    return true;
  }

  /**
   * Validate if a state transition is allowed
   */
  private isValidTransition(from: GameState, to: GameState): boolean {
    // Define valid transitions
    const validTransitions: Record<GameState, GameState[]> = {
      [GameState.STATE_IDLE]: [GameState.STATE_RITUAL_STEP],
      [GameState.STATE_RITUAL_STEP]: [
        GameState.STATE_RITUAL_STEP,  // Next step
        GameState.STATE_MONSTER_MAD,  // Failure
        GameState.STATE_ITS_ALIVE     // Success
      ],
      [GameState.STATE_MONSTER_MAD]: [GameState.STATE_RITUAL_STEP, GameState.STATE_IDLE],
      [GameState.STATE_ITS_ALIVE]: [GameState.STATE_RITUAL_STEP, GameState.STATE_IDLE]
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Handle state entry logic
   */
  private onStateEnter(state: GameState): void {
    switch (state) {
      case GameState.STATE_IDLE:
        // Reset for new game
        this.stateData.currentStepIndex = 0;
        this.stateData.mistakeCount = 0;
        this.stateData.golem_madnessLevel = 0;
        this.stateData.golem_current_state = EKGState.STATE_CALM;
        break;

      case GameState.STATE_RITUAL_STEP:
        // Set time for current step
        const currentStep = this.stateData.currentRitual.steps[this.stateData.currentStepIndex];
        if (currentStep) {
          this.stateData.timeRemaining = currentStep.timeLimit;
        }
        break;

      case GameState.STATE_MONSTER_MAD:
        // Set EKG to flatline
        this.stateData.golem_current_state = EKGState.STATE_FLATLINE;
        break;

      case GameState.STATE_ITS_ALIVE:
        // Set EKG to alive
        this.stateData.golem_current_state = EKGState.STATE_ALIVE;
        break;
    }
  }

  /**
   * Advance to next ritual step (SCREAMING_SNAKE_CASE per style guide)
   * Returns true if advanced, false if ritual is complete
   */
  ADVANCE_RITUAL_STEP(): boolean {
    this.stateData.currentStepIndex++;

    // Check if ritual is complete
    if (this.stateData.currentStepIndex >= this.stateData.currentRitual.steps.length) {
      return false; // Ritual complete
    }

    // Update time for new step
    const currentStep = this.stateData.currentRitual.steps[this.stateData.currentStepIndex];
    if (currentStep) {
      this.stateData.timeRemaining = currentStep.timeLimit;
    }

    return true;
  }

  /**
   * Register a mistake and update monster state (SCREAMING_SNAKE_CASE per style guide)
   */
  REGISTER_MISTAKE(): void {
    this.stateData.mistakeCount++;
    this.stateData.golem_madnessLevel++;

    // Update EKG state based on mistake count
    this.updateGolemState();
  }

  /**
   * Update golem emotional state based on madness level
   */
  private updateGolemState(): void {
    const madness = this.stateData.golem_madnessLevel;

    if (madness >= MISTAKE_THRESHOLDS.ANGRY) {
      this.stateData.golem_current_state = EKGState.STATE_ANGRY;
    } else if (madness >= MISTAKE_THRESHOLDS.NERVOUS) {
      this.stateData.golem_current_state = EKGState.STATE_NERVOUS;
    } else {
      this.stateData.golem_current_state = EKGState.STATE_CALM;
    }
  }

  /**
   * Update time remaining and handle timeout
   */
  updateTime(deltaTime: number): void {
    if (this.stateData.currentState !== GameState.STATE_RITUAL_STEP) {
      return;
    }

    this.stateData.timeRemaining -= deltaTime / 1000; // Convert ms to seconds

    // Check for timeout
    if (this.stateData.timeRemaining <= 0) {
      this.stateData.timeRemaining = 0;
      this.TRANSITION_TO_STATE(GameState.STATE_MONSTER_MAD);
    }
  }

  /**
   * Register a state change callback
   */
  on(event: 'stateChange', callback: StateChangeCallback): void {
    if (event === 'stateChange') {
      this.stateChangeCallbacks.push(callback);
    }
  }

  /**
   * Emit state change event
   */
  private emitStateChange(newState: GameState): void {
    for (const callback of this.stateChangeCallbacks) {
      callback(newState, this.getStateData());
    }
  }

  /**
   * Remove a callback
   */
  off(callback: StateChangeCallback): void {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Load a new ritual (for level progression)
   */
  loadRitual(ritual: Ritual): void {
    this.stateData.currentRitual = ritual;
    this.stateData.currentStepIndex = 0;
    this.stateData.levelNumber = ritual.levelNumber;
    this.stateData.timeRemaining = ritual.steps[0]?.timeLimit || 5;
  }

  /**
   * Reset to first step of current ritual (for retry)
   */
  resetToFirstStep(): void {
    this.stateData.currentStepIndex = 0;
    this.stateData.mistakeCount = 0;
    this.stateData.golem_madnessLevel = 0;
    this.stateData.golem_current_state = EKGState.STATE_CALM;
    this.stateData.timeRemaining = this.stateData.currentRitual.steps[0]?.timeLimit || 5;
  }

  /**
   * Get current ritual step
   */
  getCurrentStep() {
    return this.stateData.currentRitual.steps[this.stateData.currentStepIndex];
  }

  /**
   * Check if ritual is complete
   */
  isRitualComplete(): boolean {
    return this.stateData.currentStepIndex >= this.stateData.currentRitual.steps.length;
  }
}
