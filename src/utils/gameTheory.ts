/**
 * Game Theory Traffic Light Optimization Algorithm
 */

export interface TrafficLight {
  id: number;
  queueLength: number;
  isGreen: boolean;
  isYellow: boolean;
  yellowTimeRemaining: number;
  greenTimeElapsed: number;
  minGreenTime: number;
  maxGreenTime: number;
  syncGroup: number; // Lights with the same syncGroup will change together
}

export interface TrafficSystem {
  lights: TrafficLight[];
  totalWaitTime: number;
  conflicts: [number, number][]; // Pairs of light IDs that conflict (can't be green simultaneously)
}

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

// Add vehicles to random queues
export const addRandomTraffic = (system: TrafficSystem, maxNewVehicles: number = 3): TrafficSystem => {
  const updatedSystem = { ...system };
  
  updatedSystem.lights = system.lights.map(light => {
    const newVehicles = Math.floor(Math.random() * maxNewVehicles);
    return {
      ...light,
      queueLength: light.queueLength + newVehicles
    };
  });
  
  return updatedSystem;
};

// Process traffic movement based on light status
export const processTrafficMovement = (system: TrafficSystem): TrafficSystem => {
  const updatedSystem = { ...system };
  let additionalWaitTime = 0;
  
  updatedSystem.lights = system.lights.map(light => {
    let newQueueLength = light.queueLength;
    let newGreenTimeElapsed = light.greenTimeElapsed;
    let newYellowTimeRemaining = light.yellowTimeRemaining;
    let newIsYellow = light.isYellow;
    let newIsGreen = light.isGreen;
    
    // Process yellow lights
    if (light.isYellow) {
      newYellowTimeRemaining = Math.max(0, light.yellowTimeRemaining - 1);
      if (newYellowTimeRemaining === 0) {
        newIsYellow = false;
      }
    }
    // Process green lights
    else if (light.isGreen) {
      // Remove vehicles from queue (green light allows traffic to flow)
      newQueueLength = Math.max(0, light.queueLength - 1);
      newGreenTimeElapsed = light.greenTimeElapsed + 1;
    }
    // Waiting vehicles at red lights
    else {
      additionalWaitTime += light.queueLength;
    }
    
    return {
      ...light,
      queueLength: newQueueLength,
      greenTimeElapsed: newGreenTimeElapsed,
      yellowTimeRemaining: newYellowTimeRemaining,
      isYellow: newIsYellow,
      isGreen: newIsGreen
    };
  });
  
  updatedSystem.totalWaitTime += additionalWaitTime;
  return updatedSystem;
};

// Utility function to check if two lights conflict
const doLightsConflict = (light1: number, light2: number, conflicts: [number, number][]): boolean => {
  return conflicts.some(([a, b]) => 
    (a === light1 && b === light2) || (a === light2 && b === light1)
  );
};

// Find lights that would conflict if given light turns green
const findConflicts = (lightId: number, system: TrafficSystem): number[] => {
  return system.lights
    .filter(other => other.id !== lightId && other.isGreen && 
      doLightsConflict(lightId, other.id, system.conflicts))
    .map(light => light.id);
};

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
  const lightsByGroup: Record<number, TrafficLight[]> = {};
  
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
  if (isActiveGroupYellow) {
    // Check if all lights in the active group are no longer yellow
    const allYellowLightsFinished = !updatedSystem.lights.some(
      l => l.syncGroup === activeGroup && l.isYellow
    );
    
    if (allYellowLightsFinished) {
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
  }
  
  return updatedSystem;
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
