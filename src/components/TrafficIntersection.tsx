
import React from 'react';
import TrafficLight from './TrafficLight';
import { TrafficSystem } from '@/utils/gameTheory';

interface TrafficIntersectionProps {
  system: TrafficSystem;
  title: string;
}

const TrafficIntersection: React.FC<TrafficIntersectionProps> = ({ system, title }) => {
  // Group lights by their sync groups
  const lightsByGroup: Record<number, typeof system.lights> = {};
  system.lights.forEach(light => {
    if (!lightsByGroup[light.syncGroup]) {
      lightsByGroup[light.syncGroup] = [];
    }
    lightsByGroup[light.syncGroup].push(light);
  });

  return (
    <div className="border border-gray-200 bg-slate-50 p-4 rounded-lg shadow-sm h-full">
      <h3 className="text-lg font-medium mb-4 text-center">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(lightsByGroup).map(([groupId, lights]) => (
          <div 
            key={groupId} 
            className={`border border-gray-200 p-3 rounded-md ${parseInt(groupId) === 0 ? 'bg-blue-50' : 'bg-green-50'}`}
          >
            <h4 className="text-sm font-medium mb-2 text-gray-600">
              Sync Group {parseInt(groupId) + 1}
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {lights.map(light => (
                <TrafficLight
                  key={light.id}
                  id={light.id}
                  isGreen={light.isGreen}
                  isYellow={light.isYellow}
                  queueLength={light.queueLength}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficIntersection;
