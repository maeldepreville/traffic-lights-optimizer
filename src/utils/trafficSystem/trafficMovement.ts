
/**
 * Traffic movement and queue management functions
 */
import { TrafficSystem } from './types';

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
