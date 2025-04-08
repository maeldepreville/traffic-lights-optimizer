
import React from 'react';
import { SimulationMetrics } from '@/utils/trafficSimulation';
import MetricCard from './metrics/MetricCard';
import HistoricalChart from './metrics/HistoricalChart';
import StatsTable from './metrics/StatsTable';

interface MetricsDisplayProps {
  metrics: SimulationMetrics;
  historicalData: {
    tick: number;
    gameTheoryWait: number;
    fixedTimingWait: number;
    gameTheoryQueue: number;
    fixedTimingQueue: number;
  }[];
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics, historicalData }) => {
  // Calculate improvement percentages
  const waitTimeImprovement = metrics.fixedTiming.totalWaitTime > 0 ? 
    ((metrics.fixedTiming.totalWaitTime - metrics.gameTheory.totalWaitTime) / metrics.fixedTiming.totalWaitTime) * 100 : 0;
  
  const queueImprovement = metrics.fixedTiming.avgQueueLength > 0 ?
    ((metrics.fixedTiming.avgQueueLength - metrics.gameTheory.avgQueueLength) / metrics.fixedTiming.avgQueueLength) * 100 : 0;
  
  const throughputImprovement = metrics.fixedTiming.throughput > 0 ?
    ((metrics.gameTheory.throughput - metrics.fixedTiming.throughput) / metrics.fixedTiming.throughput) * 100 : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <h3 className="text-lg font-medium mb-4 text-center">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MetricCard 
          title="Total Wait Time" 
          gameTheory={metrics.gameTheory.totalWaitTime}
          fixedTiming={metrics.fixedTiming.totalWaitTime}
          improvement={waitTimeImprovement}
          unit="ticks"
          preferLower={true}
        />
        
        <MetricCard 
          title="Avg Queue Length" 
          gameTheory={metrics.gameTheory.avgQueueLength}
          fixedTiming={metrics.fixedTiming.avgQueueLength}
          improvement={queueImprovement}
          unit="vehicles"
          preferLower={true}
        />
        
        <MetricCard 
          title="Vehicle Throughput" 
          gameTheory={metrics.gameTheory.throughput}
          fixedTiming={metrics.fixedTiming.throughput}
          improvement={throughputImprovement}
          unit="vehicles"
          preferLower={false}
        />
      </div>
      
      {/* Line Chart for Historical Data */}
      <HistoricalChart historicalData={historicalData} />
      
      {/* Detailed Stats Table */}
      <StatsTable 
        metrics={metrics}
        waitTimeImprovement={waitTimeImprovement}
        queueImprovement={queueImprovement}
        throughputImprovement={throughputImprovement}
      />
    </div>
  );
};

export default MetricsDisplay;
