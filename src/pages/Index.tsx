
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrafficIntersection from '@/components/TrafficIntersection';
import MetricsDisplay from '@/components/MetricsDisplay';
import ConfigPanel from '@/components/ConfigPanel';
import { initializeTrafficSystem } from '@/utils/trafficSystem';
import { 
  SimulationState, 
  runSimulationStep, 
  calculateMetrics,
  SimulationMetrics 
} from '@/utils/trafficSimulation';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    gameTheorySystem: initializeTrafficSystem(4, [0, 0, 1, 1]),
    fixedTimingSystem: initializeTrafficSystem(4, [0, 0, 1, 1]),
    simulationTick: 0,
    isRunning: false,
    simulationSpeed: 500, // milliseconds per tick
    trafficRate: 5, // 1-10 scale
    newVehicleRate: 2,
  });

  const [metrics, setMetrics] = useState<SimulationMetrics>({
    gameTheory: {
      totalWaitTime: 0,
      avgQueueLength: 0,
      throughput: 0,
    },
    fixedTiming: {
      totalWaitTime: 0,
      avgQueueLength: 0,
      throughput: 0,
    }
  });

  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const simulationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const newMetrics = calculateMetrics(simulationState);
    setMetrics(newMetrics);
    
    if (simulationState.simulationTick % 5 === 0) {
      const dataPoint = {
        tick: simulationState.simulationTick,
        gameTheoryWait: simulationState.gameTheorySystem.totalWaitTime,
        fixedTimingWait: simulationState.fixedTimingSystem.totalWaitTime,
        gameTheoryQueue: newMetrics.gameTheory.avgQueueLength,
        fixedTimingQueue: newMetrics.fixedTiming.avgQueueLength,
      };
      
      setHistoricalData(prev => {
        const newData = [...prev, dataPoint];
        if (newData.length > 50) {
          return newData.slice(-50);
        }
        return newData;
      });
    }
  }, [simulationState]);

  useEffect(() => {
    if (simulationState.isRunning) {
      if (simulationTimerRef.current !== null) {
        window.clearTimeout(simulationTimerRef.current);
      }
      
      simulationTimerRef.current = window.setTimeout(() => {
        const nextState = runSimulationStep(simulationState);
        setSimulationState(nextState);
      }, simulationState.simulationSpeed);
    } else if (simulationTimerRef.current !== null) {
      window.clearTimeout(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    
    return () => {
      if (simulationTimerRef.current !== null) {
        window.clearTimeout(simulationTimerRef.current);
      }
    };
  }, [simulationState.isRunning, simulationState]);

  const handleToggleSimulation = () => {
    setSimulationState(prevState => ({
      ...prevState,
      isRunning: !prevState.isRunning
    }));
  };

  const handleReset = () => {
    setSimulationState(prevState => {
      const { numLights, syncGroups, conflicts } = extractConfigFromSystem(prevState.gameTheorySystem);
      return {
        gameTheorySystem: initializeTrafficSystem(numLights, syncGroups),
        fixedTimingSystem: initializeTrafficSystem(numLights, syncGroups),
        simulationTick: 0,
        isRunning: false,
        simulationSpeed: prevState.simulationSpeed,
        trafficRate: prevState.trafficRate,
        newVehicleRate: prevState.newVehicleRate,
      };
    });
    
    setHistoricalData([]);
    
    toast({
      title: "Simulation Reset",
      description: "The simulation has been reset to initial state.",
    });
  };

  const extractConfigFromSystem = (system: any) => {
    return {
      numLights: system.lights.length,
      syncGroups: system.lights.map((light: any) => light.syncGroup),
      conflicts: system.conflicts
    };
  };

  const handleConfigureSystem = (config: { numLights: number; syncGroups: number[]; conflicts: [number, number][]; }) => {
    setSimulationState(prevState => ({
      ...prevState,
      isRunning: false,
      gameTheorySystem: initializeTrafficSystem(config.numLights, config.syncGroups),
      fixedTimingSystem: initializeTrafficSystem(config.numLights, config.syncGroups),
      simulationTick: 0,
    }));
    
    setHistoricalData([]);
    
    toast({
      title: "Configuration Applied",
      description: `System configured with ${config.numLights} traffic lights.`,
    });
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationState(prevState => ({
      ...prevState,
      simulationSpeed: speed
    }));
  };

  const handleTrafficRateChange = (rate: number) => {
    setSimulationState(prevState => ({
      ...prevState,
      trafficRate: rate
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-emerald-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Traffic Harmony Orchestrator</h1>
          <p className="mt-1 text-emerald-100">Game Theory for Optimized Traffic Flow</p>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="simulation" className="h-full">
              <TabsList className="mb-4">
                <TabsTrigger value="simulation">Simulation</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="simulation" className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <TrafficIntersection 
                    system={simulationState.gameTheorySystem} 
                    title="Game Theory Control"
                  />
                  <TrafficIntersection 
                    system={simulationState.fixedTimingSystem} 
                    title="Fixed Timing Control"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="h-full">
                <MetricsDisplay 
                  metrics={metrics}
                  historicalData={historicalData}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <ConfigPanel 
              isRunning={simulationState.isRunning}
              onToggleSimulation={handleToggleSimulation}
              onReset={handleReset}
              onConfigureSystem={handleConfigureSystem}
              onSpeedChange={handleSpeedChange}
              onTrafficRateChange={handleTrafficRateChange}
              simulationSpeed={simulationState.simulationSpeed}
              trafficRate={simulationState.trafficRate}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-medium mb-3">Simulation Info</h2>
          <p className="mb-2 text-slate-700">
            This application simulates traffic flow optimization using game theory, where each traffic light acts as a player trying to minimize wait times for its queue of vehicles.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="text-md font-medium mb-2">Game Theory Approach</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>Each traffic light is a player that optimizes for its own queue.</li>
                <li>Lights make decisions based on queue length and wait time.</li>
                <li>The system detects and prevents conflicting green signals.</li>
                <li>Synchronized groups of lights change together.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Fixed Timing Approach</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>Traditional approach with pre-set timings (20s green, 5s yellow, 20s red).</li>
                <li>Lights change in a fixed sequence regardless of traffic conditions.</li>
                <li>Synchronized groups still change together.</li>
                <li>No adaptive behavior for changing traffic patterns.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-slate-500">
            <p>Simulation Tick: {simulationState.simulationTick}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
