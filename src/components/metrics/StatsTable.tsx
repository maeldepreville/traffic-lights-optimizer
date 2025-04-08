
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimulationMetrics } from '@/utils/trafficSimulation';

interface StatsTableProps {
  metrics: SimulationMetrics;
  waitTimeImprovement: number;
  queueImprovement: number;
  throughputImprovement: number;
}

const StatsTable: React.FC<StatsTableProps> = ({ 
  metrics, 
  waitTimeImprovement, 
  queueImprovement, 
  throughputImprovement 
}) => {
  return (
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
  );
};

export default StatsTable;
