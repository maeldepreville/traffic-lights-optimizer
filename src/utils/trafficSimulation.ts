
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
  const newVehiclesCount = calculateNewVehicles(state.trafficRate);
  gameTheorySystem = addRandomTraffic(gameTheorySystem, newVehiclesCount);
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
  fixedTimingSystem = addRandomTraffic(fixedTimingSystem, newVehiclesCount);
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
  
  // Calculate throughput (vehicles that have passed through the intersection)
  // Track the number of vehicles that were removed from queues
  const gtVehiclesRemoved = state.gameTheorySystem.lights.reduce(
    (sum, light) => sum + (light.isGreen ? 1 : 0), 0
  );
  
  const ftVehiclesRemoved = state.fixedTimingSystem.lights.reduce(
    (sum, light) => sum + (light.isGreen ? 1 : 0), 0
  );
  
  // We calculate cumulative throughput based on simulation tick
  const gtThroughput = state.simulationTick > 0 ? gtVehiclesRemoved * state.simulationTick : 0;
  const ftThroughput = state.simulationTick > 0 ? ftVehiclesRemoved * state.simulationTick : 0;
  
  return {
    gameTheory: {
      totalWaitTime: state.gameTheorySystem.totalWaitTime,
      avgQueueLength: gtAvgQueue,
      throughput: gtThroughput
    },
    fixedTiming: {
      totalWaitTime: state.fixedTimingSystem.totalWaitTime,
      avgQueueLength: ftAvgQueue,
      throughput: ftThroughput
    }
  };
};
