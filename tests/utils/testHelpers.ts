/**
 * Test helper functions for game testing
 * Provides utilities for creating mock data and inspecting game state
 */

import { Ritual, RitualStep, InputAction, SurgicalObjectType, GameStateData, GameState, EKGState } from '../../src/config/types';
import { GameFSM } from '../../src/logic/GameFSM';

/**
 * Generate a mock ritual for testing
 */
export function generateMockRitual(stepCount: number = 3, timeLimit: number = 5): Ritual {
  const steps: RitualStep[] = [];
  
  const actions = [
    InputAction.BUTTON_3,
    InputAction.BUTTON_4,
    InputAction.JOYSTICK_UP,
    InputAction.JOYSTICK_DOWN,
    InputAction.DPAD_RIGHT
  ];
  
  const objects = [
    SurgicalObjectType.DISINFECTANT,
    SurgicalObjectType.SCALPEL,
    SurgicalObjectType.ORGAN,
    SurgicalObjectType.WIRES,
    SurgicalObjectType.NEEDLE_THREAD
  ];
  
  const animations = [
    'spray_disinfectant',
    'slice_incision',
    'remove_organ',
    'connect_wires',
    'sew_stitches'
  ];
  
  for (let i = 0; i < stepCount; i++) {
    const actionIndex = i % actions.length;
    steps.push({
      name: `Step ${i + 1}`,
      promptText: `Perform Step ${i + 1}`,
      correctAction: actions[actionIndex],
      timeLimit,
      surgicalObject: objects[actionIndex],
      surgeonAnimation: animations[actionIndex]
    });
  }
  
  return {
    levelNumber: 1,
    baseTimeLimit: timeLimit,
    timeLimitMultiplier: 1.0,
    steps
  };
}

/**
 * Inspect FSM state for assertions
 */
export function inspectFSMState(fsm: GameFSM): GameStateData {
  return fsm.getStateData();
}

/**
 * Simulate input action (for programmatic testing)
 */
export function simulateInput(action: InputAction, callback: (action: InputAction) => void): void {
  callback(action);
}

/**
 * Advance time in FSM (for time-based testing)
 */
export function advanceTime(fsm: GameFSM, deltaMs: number): void {
  fsm.updateTime(deltaMs);
}

/**
 * Create a minimal mock ritual with one step
 */
export function createMinimalRitual(action: InputAction = InputAction.BUTTON_3): Ritual {
  return {
    levelNumber: 1,
    baseTimeLimit: 5,
    timeLimitMultiplier: 1.0,
    steps: [
      {
        name: 'Test Step',
        promptText: 'Test: Press Button',
        correctAction: action,
        timeLimit: 5,
        surgicalObject: SurgicalObjectType.DISINFECTANT,
        surgeonAnimation: 'spray_disinfectant'
      }
    ]
  };
}

/**
 * Assert FSM is in expected state
 */
export function assertFSMState(fsm: GameFSM, expectedState: GameState): boolean {
  return fsm.getCurrentState() === expectedState;
}

/**
 * Assert FSM has expected step index
 */
export function assertStepIndex(fsm: GameFSM, expectedIndex: number): boolean {
  return fsm.getStateData().currentStepIndex === expectedIndex;
}

/**
 * Assert FSM has expected mistake count
 */
export function assertMistakeCount(fsm: GameFSM, expectedCount: number): boolean {
  return fsm.getStateData().mistakeCount === expectedCount;
}

/**
 * Assert FSM has expected EKG state
 */
export function assertEKGState(fsm: GameFSM, expectedState: EKGState): boolean {
  return fsm.getStateData().golem_current_state === expectedState;
}

/**
 * Complete a ritual step successfully
 */
export function completeStep(fsm: GameFSM): boolean {
  const currentStep = fsm.getCurrentStep();
  if (!currentStep) return false;
  
  return fsm.ADVANCE_RITUAL_STEP();
}

/**
 * Trigger a timeout by setting time to zero
 */
export function triggerTimeout(fsm: GameFSM): void {
  const stateData = fsm.getStateData();
  fsm.updateTime(stateData.timeRemaining * 1000 + 100); // Advance past time limit
}

/**
 * Create a ritual with specific actions
 */
export function createRitualWithActions(actions: InputAction[]): Ritual {
  const steps: RitualStep[] = actions.map((action, index) => ({
    name: `Step ${index + 1}`,
    promptText: `Perform action ${action}`,
    correctAction: action,
    timeLimit: 5,
    surgicalObject: SurgicalObjectType.DISINFECTANT,
    surgeonAnimation: 'spray_disinfectant'
  }));
  
  return {
    levelNumber: 1,
    baseTimeLimit: 5,
    timeLimitMultiplier: 1.0,
    steps
  };
}
