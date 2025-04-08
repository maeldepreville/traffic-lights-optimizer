
/**
 * Traffic system initialization functions
 */
import { TrafficLight, TrafficSystem } from './types';

// Initialize a traffic system with n lights
export const initializeTrafficSystem = (
  n: number,
  syncGroups: number[] = [],
  minGreenTime: number = 5,
  maxGreenTime: number = 30
): TrafficSystem => {
  const lights: TrafficLight[] = [];
  
  for (let i = 0; i < n; i++) {
    lights.push({
      id: i,
      queueLength: Math.floor(Math.random() * 10), // Random initial queue
      isGreen: i === 0, // First light starts green
      isYellow: false,
      yellowTimeRemaining: 0,
      greenTimeElapsed: 0,
      minGreenTime: minGreenTime,
      maxGreenTime: maxGreenTime,
      syncGroup: syncGroups[i] || i // Default: each light in its own group
    });
  }
  
  // Generate default conflicts: each light conflicts with every other light
  // except those in the same sync group
  const conflicts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (lights[i].syncGroup !== lights[j].syncGroup) {
        conflicts.push([i, j]);
      }
    }
  }
  
  return {
    lights,
    totalWaitTime: 0,
    conflicts
  };
};
