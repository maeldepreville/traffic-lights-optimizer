
import React from 'react';
import { SimulationMetrics } from '@/utils/trafficSimulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tick" label={{ value: 'Simulation Time', position: 'insideBottom', offset: -5 }} />
            <YAxis yAxisId="left" label={{ value: 'Wait Time', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Queue Length', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="gameTheoryWait" 
              name="Game Theory Wait Time" 
              stroke="#10b981" 
              activeDot={{ r: 8 }}
              strokeWidth={2} 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="fixedTimingWait" 
              name="Fixed Timing Wait Time" 
              stroke="#ef4444" 
              strokeWidth={2} 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="gameTheoryQueue" 
              name="Game Theory Queue" 
              stroke="#0ea5e9" 
              strokeDasharray="5 5" 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="fixedTimingQueue" 
              name="Fixed Timing Queue" 
              stroke="#f97316" 
              strokeDasharray="5 5" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  gameTheory: number;
  fixedTiming: number;
  improvement: number;
  unit: string;
  preferLower: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  gameTheory, 
  fixedTiming, 
  improvement,
  unit,
  preferLower
}) => {
  // Format numbers nicely
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };
  
  // Determine if the improvement is positive (better) or negative (worse)
  const isImprovement = preferLower ? improvement > 0 : improvement < 0;
  const absImprovement = Math.abs(improvement);
  
  return (
    <div className="bg-slate-50 p-3 rounded-md border border-gray-100">
      <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-gray-500">Game Theory</div>
          <div className="font-bold text-emerald-600">{formatNumber(gameTheory)} {unit}</div>
        </div>
        <div>
          <div className="text-gray-500">Fixed Timing</div>
          <div className="font-bold text-red-500">{formatNumber(fixedTiming)} {unit}</div>
        </div>
      </div>
      <div className={`mt-2 text-xs font-medium ${isImprovement ? 'text-green-600' : 'text-amber-600'}`}>
        {isImprovement ? (
          <span>Improved by {absImprovement.toFixed(1)}%</span>
        ) : (
          <span>Decreased by {absImprovement.toFixed(1)}%</span>
        )}
      </div>
    </div>
  );
};

export default MetricsDisplay;
