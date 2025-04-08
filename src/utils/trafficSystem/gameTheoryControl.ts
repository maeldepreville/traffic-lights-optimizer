
/**
 * Game Theory traffic light control algorithm
 */
import { TrafficSystem } from './types';
import { findConflicts } from './conflictManagement';

// Game theory decision algorithm for next light to turn green
export const makeGameTheoryDecision = (system: TrafficSystem): TrafficSystem => {
  const updatedSystem = { ...system };
  
  // Track which sync groups are processing yellow lights
  const yellowGroups = new Set<number>();
  system.lights.forEach(light => {
    if (light.isYellow) {
      yellowGroups.add(light.syncGroup);
    }
  });
  
  // Find lights that are candidates for turning green (not yellow, not green)
  const lightsByGroup: Record<number, typeof system.lights> = {};
  
  system.lights.forEach(light => {
    if (!light.isGreen && !light.isYellow && !yellowGroups.has(light.syncGroup)) {
      if (!lightsByGroup[light.syncGroup]) {
        lightsByGroup[light.syncGroup] = [];
      }
      lightsByGroup[light.syncGroup].push(light);
    }
  });
  
  // For each green light, check if it should turn yellow
  system.lights.forEach(light => {
    if (light.isGreen) {
      // Check if this light has been green long enough and has a low queue
      const shouldTurnYellow = 
        light.greenTimeElapsed >= light.minGreenTime &&
        (light.queueLength <= 2 || light.greenTimeElapsed >= light.maxGreenTime);
      
      if (shouldTurnYellow) {
        // Turn all lights in this sync group yellow
        const syncGroup = light.syncGroup;
        updatedSystem.lights = updatedSystem.lights.map(l => {
          if (l.syncGroup === syncGroup && l.isGreen) {
            return {
              ...l,
              isGreen: false,
              isYellow: true,
              yellowTimeRemaining: 3,
              greenTimeElapsed: 0
            };
          }
          return l;
        });
      }
    }
  });
  
  // For each sync group that could turn green, evaluate the potential benefit
  const groupBenefits: [number, number][] = []; // [syncGroup, benefit]
  
  Object.entries(lightsByGroup).forEach(([groupStr, lights]) => {
    const syncGroup = parseInt(groupStr);
    
    // Skip if any light in this group would conflict with a green light
    const wouldConflict = lights.some(light => 
      findConflicts(light.id, system).length > 0
    );
    
    if (!wouldConflict) {
      // Calculate benefit as total queue length of all lights in this group
      const totalQueue = lights.reduce((sum, light) => sum + light.queueLength, 0);
      groupBenefits.push([syncGroup, totalQueue]);
    }
  });
  
  // Sort groups by benefit (highest first)
  groupBenefits.sort((a, b) => b[1] - a[1]);
  
  // Turn the highest benefit group green if it has waiting vehicles
  if (groupBenefits.length > 0 && groupBenefits[0][1] > 0) {
    const [bestGroup] = groupBenefits[0];
    updatedSystem.lights = updatedSystem.lights.map(light => {
      if (light.syncGroup === bestGroup && !light.isYellow && !light.isGreen) {
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
