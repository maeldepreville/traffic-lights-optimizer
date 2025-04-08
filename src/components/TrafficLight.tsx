
import React from 'react';
import { cn } from '@/lib/utils';

interface TrafficLightProps {
  isGreen: boolean;
  isYellow: boolean;
  queueLength: number;
  id: number;
}

const TrafficLight: React.FC<TrafficLightProps> = ({ 
  isGreen, 
  isYellow, 
  queueLength,
  id 
}) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="text-sm font-medium mb-1">Light {id + 1}</div>
      <div className="bg-gray-800 p-2 rounded-lg relative">
        <div className={cn(
          "w-6 h-6 rounded-full mb-2",
          isGreen ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]" : "bg-gray-700"
        )}></div>
        <div className={cn(
          "w-6 h-6 rounded-full mb-2",
          isYellow ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.7)]" : "bg-gray-700"
        )}></div>
        <div className={cn(
          "w-6 h-6 rounded-full",
          !isGreen && !isYellow ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]" : "bg-gray-700"
        )}></div>
      </div>
      <div className="mt-2 flex items-center">
        <span className="text-xs font-semibold mr-2">Queue:</span>
        <div className="flex">
          {Array.from({ length: Math.min(queueLength, 10) }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-2 h-4 mx-[1px]",
                queueLength > 5 ? "bg-red-500" : "bg-blue-500"
              )}
            ></div>
          ))}
          {queueLength > 10 && (
            <span className="text-xs ml-1">+{queueLength - 10}</span>
          )}
          {queueLength === 0 && (
            <span className="text-xs text-green-500">Empty</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficLight;
