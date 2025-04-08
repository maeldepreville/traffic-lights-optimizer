
/**
 * Fixed timing traffic light control algorithm
 */
import { TrafficSystem } from './types';

// Fixed timing simulation for comparison
export const fixedTimingSimulation = (
  system: TrafficSystem,
  greenTime: number = 20,
  yellowTime: number = 5
): TrafficSystem => {
  const updatedSystem = { ...system };
  const syncGroups = Array.from(new Set(system.lights.map(l => l.syncGroup)));
  
  // Find the currently active group (green or yellow)
  let activeGroup = -1;
  let isActiveGroupYellow = false;
  
  for (const light of system.lights) {
    if (light.isGreen) {
      activeGroup = light.syncGroup;
      break;
    } else if (light.isYellow) {
      activeGroup = light.syncGroup;
      isActiveGroupYellow = true;
      break;
    }
  }
  
  // If no active group, start with the first sync group
  if (activeGroup === -1) {
    activeGroup = syncGroups[0];
    
    // Turn all lights in this group green
    updatedSystem.lights = updatedSystem.lights.map(light => {
      if (light.syncGroup === activeGroup) {
        return {
          ...light,
          isGreen: true,
          greenTimeElapsed: 0
        };
      }
      return light;
    });
    
    return updatedSystem;
  }
  
  // Process existing light states
  updatedSystem.lights = system.lights.map(light => {
    if (light.syncGroup === activeGroup) {
      if (light.isYellow) {
        // Process yellow time
        const newYellowTimeRemaining = light.yellowTimeRemaining - 1;
        
        if (newYellowTimeRemaining <= 0) {
          // Yellow phase over, return to red state (not green)
          return {
            ...light,
            isYellow: false,
            yellowTimeRemaining: 0
          };
        } else {
          // Continue yellow phase
          return {
            ...light,
            yellowTimeRemaining: newYellowTimeRemaining
          };
        }
      } else if (light.isGreen) {
        // Process green time
        const newGreenTimeElapsed = light.greenTimeElapsed + 1;
        
        if (newGreenTimeElapsed >= greenTime) {
          // Green phase over, switch to yellow
          return {
            ...light,
            isGreen: false,
            isYellow: true,
            yellowTimeRemaining: yellowTime,
            greenTimeElapsed: 0
          };
        } else {
          // Continue green phase
          return {
            ...light,
            greenTimeElapsed: newGreenTimeElapsed
          };
        }
      }
    }
    return light;
  });
  
  // If the active group just finished its yellow phase, activate the next group
  const allYellowLightsFinished = !updatedSystem.lights.some(
    l => l.syncGroup === activeGroup && l.isYellow
  );
  
  if (isActiveGroupYellow && allYellowLightsFinished) {
    // Find the next group to activate
    const currentIndex = syncGroups.indexOf(activeGroup);
    const nextIndex = (currentIndex + 1) % syncGroups.length;
    const nextGroup = syncGroups[nextIndex];
    
    // Turn all lights in the next group green
    updatedSystem.lights = updatedSystem.lights.map(light => {
      if (light.syncGroup === nextGroup) {
        return {
          ...light,
          isGreen: true,
          greenTimeElapsed: 0
        };
      }
      return light;
    });
  }
  
  return updatedSystem;
};
