
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface HistoricalChartProps {
  historicalData: {
    tick: number;
    gameTheoryWait: number;
    fixedTimingWait: number;
    gameTheoryQueue: number;
    fixedTimingQueue: number;
  }[];
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ historicalData }) => {
  // Filter historical data to show only the last 20 data points
  const limitedHistoricalData = historicalData.slice(-20);

  return (
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
          <ChartTooltip content={<CustomTooltipContent />} />
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
  );
};

// Custom tooltip component with type safety
const CustomTooltipContent = (props: any) => {
  // Helper function to safely format values
  const formatValue = (value: any): string => {
    return typeof value === 'number' ? value.toFixed(1) : String(value);
  };

  return <ChartTooltipContent {...props} formatter={(value) => formatValue(value)} />;
};

export default HistoricalChart;
