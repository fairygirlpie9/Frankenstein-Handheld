/**
 * RitualLogic - Core ritual validation and progression functions
 * Following Mad Scientist Style Guide conventions (SCREAMING_SNAKE_CASE for functions)
 */

import { GameFSM } from './GameFSM';
import { InputAction, Ritual, GameState } from '../config/types';

/**
 * Start a ritual sequence (SCREAMING_SNAKE_CASE per style guide)
 */
export function START_RITUAL_SEQUENCE(fsm: GameFSM): void {
  // Transition from IDLE to first RITUAL_STEP
  fsm.TRANSITION_TO_STATE(GameState.STATE_RITUAL_STEP);
}

/**
 * Validate if an input action matches the expected action for current step
 * (SCREAMING_SNAKE_CASE per style guide)
 */
export function VALIDATE_RITUAL_ACTION(
  action: InputAction,
  expectedAction: InputAction
): boolean {
  return action === expectedAction;
}

/**
 * Complete the current ritual step and advance to next
 * (SCREAMING_SNAKE_CASE per style guide)
 */
export function COMPLETE_RITUAL_STEP(fsm: GameFSM): void {
  // Check if this was the last step
  const hasMoreSteps = fsm.ADVANCE_RITUAL_STEP();

  if (!hasMoreSteps) {
    // Ritual complete - transition to ITS_ALIVE
    fsm.TRANSITION_TO_STATE(GameState.STATE_ITS_ALIVE);
  } else {
    // More steps remain - stay in RITUAL_STEP state
    // The state data is already updated by ADVANCE_RITUAL_STEP
  }
}

/**
 * Handle ritual failure (wrong action or timeout)
 * (SCREAMING_SNAKE_CASE per style guide)
 */
export function HANDLE_RITUAL_FAILURE(fsm: GameFSM): void {
  // Register the mistake
  fsm.REGISTER_MISTAKE();

  // Transition to MONSTER_MAD state
  fsm.TRANSITION_TO_STATE(GameState.STATE_MONSTER_MAD);
}

/**
 * Retry the current ritual from the beginning
 */
export function RETRY_RITUAL(fsm: GameFSM): void {
  console.log('>>> RETRY_RITUAL called <<<');
  console.log('Current state before retry:', fsm.getCurrentState());
  
  // Reset to first step
  console.log('Calling resetToFirstStep...');
  fsm.resetToFirstStep();
  console.log('resetToFirstStep completed');

  // Transition back to RITUAL_STEP
  console.log('Calling TRANSITION_TO_STATE(RITUAL_STEP)...');
  const success = fsm.TRANSITION_TO_STATE(GameState.STATE_RITUAL_STEP);
  console.log('Transition result:', success);
  console.log('Current state after retry:', fsm.getCurrentState());
}

/**
 * Load and start a new ritual (for level progression)
 */
export function START_NEW_RITUAL(fsm: GameFSM, ritual: Ritual): void {
  // Load the new ritual
  fsm.loadRitual(ritual);

  // Start the ritual sequence
  START_RITUAL_SEQUENCE(fsm);
}
