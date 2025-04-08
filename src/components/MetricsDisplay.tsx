
import React from 'react';
import { SimulationMetrics } from '@/utils/trafficSimulation';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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

  // Data for the wait time comparison pie chart
  const waitTimeData = [
    { name: 'Game Theory', value: metrics.gameTheory.totalWaitTime, color: '#10b981' },
    { name: 'Fixed Timing', value: metrics.fixedTiming.totalWaitTime, color: '#ef4444' }
  ];
  
  // Data for the queue length comparison pie chart
  const queueLengthData = [
    { name: 'Game Theory', value: metrics.gameTheory.avgQueueLength, color: '#0ea5e9' },
    { name: 'Fixed Timing', value: metrics.fixedTiming.avgQueueLength, color: '#f97316' }
  ];

  // Data for the throughput comparison pie chart
  const throughputData = [
    { name: 'Game Theory', value: metrics.gameTheory.throughput, color: '#8b5cf6' },
    { name: 'Fixed Timing', value: metrics.fixedTiming.throughput, color: '#ec4899' }
  ];
  
  // Filter historical data to show only the last 20 data points
  const limitedHistoricalData = historicalData.slice(-20);

  // Helper function to safely format numbers
  const formatValue = (value: any): string => {
    return typeof value === 'number' ? value.toFixed(1) : String(value);
  };

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
      
      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 h-[200px]">
        <div className="bg-slate-50 p-3 rounded-md border border-gray-100">
          <h4 className="text-sm font-medium text-center mb-2">Wait Time Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={waitTimeData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {waitTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatValue(value) + " ticks", 'Wait Time']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-slate-50 p-3 rounded-md border border-gray-100">
          <h4 className="text-sm font-medium text-center mb-2">Queue Length Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={queueLengthData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {queueLengthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatValue(value) + " vehicles", 'Queue Length']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-slate-50 p-3 rounded-md border border-gray-100">
          <h4 className="text-sm font-medium text-center mb-2">Throughput Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={throughputData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {throughputData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatValue(value) + " vehicles", 'Throughput']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Line Chart for Historical Data */}
      <div className="flex-grow border border-gray-200 rounded-md p-3 bg-white">
        <h4 className="text-sm font-medium mb-2 text-center">Historical Performance</h4>
        <ChartContainer 
          className="h-[200px]"
          config={{
            gameTheoryWait: { label: "Game Theory Wait Time", color: "#10b981" },
            fixedTimingWait: { label: "Fixed Timing Wait Time", color: "#ef4444" },
            gameTheoryQueue: { label: "Game Theory Queue", color: "#0ea5e9" },
            fixedTimingQueue: { label: "Fixed Timing Queue", color: "#f97316" }
          }}
        >
          <LineChart data={limitedHistoricalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="tick" 
              label={{ value: 'Tick', position: 'insideBottomRight', offset: 0 }}
              ticks={limitedHistoricalData.length > 0 ? 
                [limitedHistoricalData[0].tick, limitedHistoricalData[limitedHistoricalData.length - 1].tick] : 
                []}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="gameTheoryWait" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="fixedTimingWait" 
              stroke="#ef4444" 
              strokeWidth={2} 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="gameTheoryQueue" 
              stroke="#0ea5e9" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="fixedTimingQueue" 
              stroke="#f97316" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      
      {/* Detailed Stats Table */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Detailed Statistics</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Game Theory</TableHead>
              <TableHead>Fixed Timing</TableHead>
              <TableHead>Improvement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Total Wait Time</TableCell>
              <TableCell>{metrics.gameTheory.totalWaitTime.toFixed(1)}</TableCell>
              <TableCell>{metrics.fixedTiming.totalWaitTime.toFixed(1)}</TableCell>
              <TableCell className={waitTimeImprovement > 0 ? "text-green-600" : "text-amber-600"}>
                {waitTimeImprovement.toFixed(1)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Avg Queue Length</TableCell>
              <TableCell>{metrics.gameTheory.avgQueueLength.toFixed(1)}</TableCell>
              <TableCell>{metrics.fixedTiming.avgQueueLength.toFixed(1)}</TableCell>
              <TableCell className={queueImprovement > 0 ? "text-green-600" : "text-amber-600"}>
                {queueImprovement.toFixed(1)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Throughput</TableCell>
              <TableCell>{metrics.gameTheory.throughput.toFixed(1)}</TableCell>
              <TableCell>{metrics.fixedTiming.throughput.toFixed(1)}</TableCell>
              <TableCell className={throughputImprovement > 0 ? "text-green-600" : "text-amber-600"}>
                {throughputImprovement.toFixed(1)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
