
import { 
  TrafficSystem, 
  addRandomTraffic, 
  processTrafficMovement, 
  makeGameTheoryDecision,
  fixedTimingSimulation,
  validateNoConflicts
} from './gameTheory';

export interface SimulationState {
  gameTheorySystem: TrafficSystem;
  fixedTimingSystem: TrafficSystem;
  simulationTick: number;
  isRunning: boolean;
  simulationSpeed: number; // milliseconds per tick
  trafficRate: number; // 1-10 scale
  newVehicleRate: number;
}

export interface SimulationMetrics {
  gameTheory: {
    totalWaitTime: number;
    avgQueueLength: number;
    throughput: number;
  };
  fixedTiming: {
    totalWaitTime: number;
    avgQueueLength: number;
    throughput: number;
  };
}

// Run a single simulation step
export const runSimulationStep = (state: SimulationState): SimulationState => {
  // Process game theory system
  let gameTheorySystem = { ...state.gameTheorySystem };
  gameTheorySystem = addRandomTraffic(gameTheorySystem, calculateNewVehicles(state.trafficRate));
  gameTheorySystem = processTrafficMovement(gameTheorySystem);
  gameTheorySystem = makeGameTheoryDecision(gameTheorySystem);
  
  // Check for conflicts in game theory system
  const gtHasConflicts = !validateNoConflicts(gameTheorySystem);
  if (gtHasConflicts) {
    console.error("Warning: Conflicting signals detected in Game Theory system");
    // Resolve conflicts by turning conflicting lights yellow
    gameTheorySystem = resolveConflicts(gameTheorySystem);
  }
  
  // Process fixed timing system
  let fixedTimingSystem = { ...state.fixedTimingSystem };
  fixedTimingSystem = addRandomTraffic(fixedTimingSystem, calculateNewVehicles(state.trafficRate));
  fixedTimingSystem = processTrafficMovement(fixedTimingSystem);
  fixedTimingSystem = fixedTimingSimulation(fixedTimingSystem);
  
  // Check for conflicts in fixed timing system
  const ftHasConflicts = !validateNoConflicts(fixedTimingSystem);
  if (ftHasConflicts) {
    console.error("Warning: Conflicting signals detected in Fixed Timing system");
    fixedTimingSystem = resolveConflicts(fixedTimingSystem);
  }
  
  return {
    ...state,
    gameTheorySystem,
    fixedTimingSystem,
    simulationTick: state.simulationTick + 1
  };
};

// Calculate how many new vehicles to add based on traffic rate
const calculateNewVehicles = (trafficRate: number): number => {
  const baseRate = trafficRate / 10; // Convert 1-10 scale to 0.1-1.0
  const maxNewVehicles = Math.ceil(baseRate * 5); // Scale up to 1-5 vehicles
  return Math.floor(Math.random() * (maxNewVehicles + 1));
};

// Resolve conflicts by turning conflicting lights yellow
const resolveConflicts = (system: TrafficSystem): TrafficSystem => {
  const updatedSystem = { ...system };
  const conflictsDetected = new Set<number>();
  
  // Find all conflicts
  for (const [light1, light2] of system.conflicts) {
    if (system.lights[light1].isGreen && system.lights[light2].isGreen) {
      conflictsDetected.add(light1);
      conflictsDetected.add(light2);
    }
  }
  
  // Resolve conflicts by turning conflicting lights yellow
  if (conflictsDetected.size > 0) {
    updatedSystem.lights = system.lights.map((light, index) => {
      if (conflictsDetected.has(index) && light.isGreen) {
        return {
          ...light,
          isGreen: false,
          isYellow: true,
          yellowTimeRemaining: 3
        };
      }
      return light;
    });
  }
  
  return updatedSystem;
};

// Calculate metrics for the simulation
export const calculateMetrics = (state: SimulationState): SimulationMetrics => {
  // Calculate metrics for game theory system
  const gtTotalQueue = state.gameTheorySystem.lights.reduce(
    (sum, light) => sum + light.queueLength, 0
  );
  const gtAvgQueue = gtTotalQueue / state.gameTheorySystem.lights.length;
  
  // Calculate metrics for fixed timing system
  const ftTotalQueue = state.fixedTimingSystem.lights.reduce(
    (sum, light) => sum + light.queueLength, 0
  );
  const ftAvgQueue = ftTotalQueue / state.fixedTimingSystem.lights.length;
  
  // Estimate throughput (total vehicles processed)
  // This is a simplified calculation based on wait time and simulation ticks
  const gtThroughput = state.simulationTick * state.gameTheorySystem.lights.length - state.gameTheorySystem.totalWaitTime;
  const ftThroughput = state.simulationTick * state.fixedTimingSystem.lights.length - state.fixedTimingSystem.totalWaitTime;
  
  return {
    gameTheory: {
      totalWaitTime: state.gameTheorySystem.totalWaitTime,
      avgQueueLength: gtAvgQueue,
      throughput: Math.max(0, gtThroughput)
    },
    fixedTiming: {
      totalWaitTime: state.fixedTimingSystem.totalWaitTime,
      avgQueueLength: ftAvgQueue,
      throughput: Math.max(0, ftThroughput)
    }
  };
};
