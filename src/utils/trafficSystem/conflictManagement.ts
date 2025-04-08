
/**
 * Functions for managing conflicts between traffic lights
 */
import { TrafficSystem } from './types';

// Utility function to check if two lights conflict
export const doLightsConflict = (light1: number, light2: number, conflicts: [number, number][]): boolean => {
  return conflicts.some(([a, b]) => 
    (a === light1 && b === light2) || (a === light2 && b === light1)
  );
};

// Find lights that would conflict if given light turns green
export const findConflicts = (lightId: number, system: TrafficSystem): number[] => {
  return system.lights
    .filter(other => other.id !== lightId && other.isGreen && 
      doLightsConflict(lightId, other.id, system.conflicts))
    .map(light => light.id);
};

// Validate that no conflicting lights are green simultaneously
export const validateNoConflicts = (system: TrafficSystem): boolean => {
  for (const [light1, light2] of system.conflicts) {
    if (system.lights[light1].isGreen && system.lights[light2].isGreen) {
      return false;
    }
  }
  return true;
};
