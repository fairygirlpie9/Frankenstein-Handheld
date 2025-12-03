/**
 * Ritual definitions for the Frankenstein Ritual Game
 * Each ritual represents a complete level with surgical steps
 */

import { Ritual, InputAction, SurgicalObjectType } from './types';

// Action variations for each surgical task
const DISINFECT_ACTIONS = [
  { action: InputAction.BUTTON_A, text: 'Press Button A' },
  { action: InputAction.BUTTON_B, text: 'Press Button B' },
  { action: InputAction.DPAD_UP, text: 'D-Pad Up' }
];

const SLICE_ACTIONS = [
  { action: InputAction.JOYSTICK_UP, text: 'Move Joystick Up' },
  { action: InputAction.JOYSTICK_DOWN, text: 'Move Joystick Down' },
  { action: InputAction.JOYSTICK_LEFT, text: 'Move Joystick Left' },
  { action: InputAction.JOYSTICK_RIGHT, text: 'Move Joystick Right' }
];

const REMOVE_ACTIONS = [
  { action: InputAction.BUTTON_B, text: 'Press Button B' },
  { action: InputAction.BUTTON_A, text: 'Press Button A' },
  { action: InputAction.DPAD_DOWN, text: 'D-Pad Down' }
];

const CONNECT_ACTIONS = [
  { action: InputAction.DPAD_RIGHT, text: 'D-Pad Right' },
  { action: InputAction.DPAD_LEFT, text: 'D-Pad Left' },
  { action: InputAction.JOYSTICK_RIGHT, text: 'Move Joystick Right' },
  { action: InputAction.JOYSTICK_LEFT, text: 'Move Joystick Left' }
];

const SEW_ACTIONS = [
  { action: InputAction.JOYSTICK_DOWN, text: 'Move Joystick Down' },
  { action: InputAction.JOYSTICK_UP, text: 'Move Joystick Up' },
  { action: InputAction.DPAD_DOWN, text: 'D-Pad Down' },
  { action: InputAction.DPAD_UP, text: 'D-Pad Up' }
];

const CLEAN_ACTIONS = [
  { action: InputAction.DPAD_LEFT, text: 'D-Pad Left' },
  { action: InputAction.DPAD_RIGHT, text: 'D-Pad Right' },
  { action: InputAction.JOYSTICK_LEFT, text: 'Move Joystick Left' },
  { action: InputAction.JOYSTICK_RIGHT, text: 'Move Joystick Right' }
];

/**
 * Get a random action from an array of action variations
 */
function getRandomAction(actions: Array<{ action: InputAction; text: string }>) {
  return actions[Math.floor(Math.random() * actions.length)];
}

/**
 * Generate a ritual with varied inputs
 */
function generateVariedRitual(levelNumber: number, baseTimeLimit: number, timeLimitMultiplier: number): Ritual {
  const disinfect = getRandomAction(DISINFECT_ACTIONS);
  const slice = getRandomAction(SLICE_ACTIONS);
  const remove = getRandomAction(REMOVE_ACTIONS);
  const connect = getRandomAction(CONNECT_ACTIONS);
  const sew = getRandomAction(SEW_ACTIONS);
  
  const steps = [
    {
      name: 'Disinfect',
      promptText: `Disinfect: ${disinfect.text}`,
      correctAction: disinfect.action,
      timeLimit: Math.max(3, Math.floor(baseTimeLimit * timeLimitMultiplier)),
      surgicalObject: SurgicalObjectType.DISINFECTANT,
      surgeonAnimation: 'spray_disinfectant'
    },
    {
      name: 'Slice Open',
      promptText: `Slice Open: ${slice.text}`,
      correctAction: slice.action,
      timeLimit: Math.max(3, Math.floor(baseTimeLimit * timeLimitMultiplier)),
      surgicalObject: SurgicalObjectType.SCALPEL,
      surgeonAnimation: 'slice_incision'
    },
    {
      name: 'Remove Organ',
      promptText: `Remove Organ: ${remove.text}`,
      correctAction: remove.action,
      timeLimit: Math.max(3, Math.floor(baseTimeLimit * timeLimitMultiplier)),
      surgicalObject: SurgicalObjectType.ORGAN,
      surgeonAnimation: 'remove_organ'
    },
    {
      name: 'Connect Wires',
      promptText: `Connect Wires: ${connect.text}`,
      correctAction: connect.action,
      timeLimit: Math.max(3, Math.floor(baseTimeLimit * timeLimitMultiplier)),
      surgicalObject: SurgicalObjectType.WIRES,
      surgeonAnimation: 'connect_wires'
    },
    {
      name: 'Sew Shut',
      promptText: `Sew Shut: ${sew.text}`,
      correctAction: sew.action,
      timeLimit: Math.max(3, Math.floor(baseTimeLimit * timeLimitMultiplier)),
      surgicalObject: SurgicalObjectType.NEEDLE_THREAD,
      surgeonAnimation: 'sew_stitches'
    }
  ];
  
  // Add extra steps every 3 levels
  const extraStepsCount = Math.floor((levelNumber - 1) / 3);
  if (extraStepsCount > 0) {
    for (let i = 0; i < extraStepsCount; i++) {
      const clean = getRandomAction(CLEAN_ACTIONS);
      steps.push({
        name: 'Clean Tools',
        promptText: `Clean Tools: ${clean.text}`,
        correctAction: clean.action,
        timeLimit: Math.max(3, Math.floor(8 * timeLimitMultiplier)),
        surgicalObject: SurgicalObjectType.TOOLS,
        surgeonAnimation: 'clean_tools'
      });
    }
  }
  
  return {
    levelNumber,
    baseTimeLimit,
    timeLimitMultiplier,
    steps
  };
}

// Level 1 Ritual - Basic Frankenstein Surgery (for reference)
export const LEVEL_1_RITUAL: Ritual = generateVariedRitual(1, 10, 1.0);

/**
 * Get ritual for a specific level number with varied inputs
 * Applies difficulty scaling based on level
 */
export function getRitualForLevel(levelNumber: number): Ritual {
  const baseTimeLimit = 10;
  
  // Apply difficulty scaling - slower progression for beginners
  const timeReduction = 1 - (0.05 * (levelNumber - 1)); // 5% reduction per level
  const timeLimitMultiplier = Math.max(0.6, timeReduction); // Minimum 60%
  
  return generateVariedRitual(levelNumber, baseTimeLimit, timeLimitMultiplier);
}

/**
 * Get all available rituals
 */
export const RITUALS = {
  level1: LEVEL_1_RITUAL
};
