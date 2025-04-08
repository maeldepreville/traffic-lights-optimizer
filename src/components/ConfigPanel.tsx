
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfigPanelProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onReset: () => void;
  onConfigureSystem: (config: {
    numLights: number;
    syncGroups: number[];
    conflicts: [number, number][];
  }) => void;
  onSpeedChange: (speed: number) => void;
  onTrafficRateChange: (rate: number) => void;
  simulationSpeed: number;
  trafficRate: number;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  isRunning,
  onToggleSimulation,
  onReset,
  onConfigureSystem,
  onSpeedChange,
  onTrafficRateChange,
  simulationSpeed,
  trafficRate,
}) => {
  const [numLights, setNumLights] = useState(4);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [syncGroups, setSyncGroups] = useState<number[]>([0, 0, 1, 1]);
  const [selectedLight, setSelectedLight] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(0);
  
  // Helper to update sync group for a light
  const updateSyncGroup = (lightId: number, groupId: number) => {
    const newGroups = [...syncGroups];
    newGroups[lightId] = groupId;
    setSyncGroups(newGroups);
  };
  
  // Function to handle number of lights change
  const handleNumLightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNum = parseInt(e.target.value);
    if (isNaN(newNum) || newNum < 2 || newNum > 12) return;
    setNumLights(newNum);
    
    // Update sync groups array length
    const newGroups = [...syncGroups];
    if (newGroups.length < newNum) {
      // Add new lights to default group 0
      while (newGroups.length < newNum) {
        newGroups.push(0);
      }
    } else {
      // Remove extra lights
      newGroups.splice(newNum);
    }
    setSyncGroups(newGroups);
  };
  
  // Generate conflicts based on sync groups
  const generateConflicts = (): [number, number][] => {
    const conflicts: [number, number][] = [];
    for (let i = 0; i < syncGroups.length; i++) {
      for (let j = i + 1; j < syncGroups.length; j++) {
        if (syncGroups[i] !== syncGroups[j]) {
          conflicts.push([i, j]);
        }
      }
    }
    return conflicts;
  };
  
  // Apply configuration to the simulation
  const applyConfiguration = () => {
    const conflicts = generateConflicts();
    onConfigureSystem({
      numLights,
      syncGroups,
      conflicts,
    });
    setShowConfigModal(false);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
        <h3 className="text-lg font-medium mb-4">Simulation Controls</h3>
        
        <div className="space-y-4">
          <div>
            <Button 
              onClick={onToggleSimulation} 
              variant={isRunning ? "destructive" : "default"}
              className="w-full"
            >
              {isRunning ? "Pause Simulation" : "Start Simulation"}
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Simulation Speed</label>
              <span className="text-xs">{(1000 / simulationSpeed).toFixed(1)} ticks/second</span>
            </div>
            <Slider 
              value={[1100 - simulationSpeed]} 
              min={100}
              max={1000}
              step={100}
              onValueChange={(values) => onSpeedChange(1100 - values[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Traffic Rate</label>
              <span className="text-xs">{trafficRate}/10</span>
            </div>
            <Slider 
              value={[trafficRate]} 
              min={1}
              max={10}
              step={1}
              onValueChange={(values) => onTrafficRateChange(values[0])}
            />
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowConfigModal(true)}
            >
              Configure System
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={onReset}
            >
              Reset
            </Button>
          </div>
          
          <div className="mt-4 bg-slate-50 p-3 rounded-md border border-gray-100">
            <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
            <div className="flex flex-wrap gap-1">
              {syncGroups.map((group, index) => (
                <Badge key={index} variant="outline" className="bg-white">
                  Light {index + 1}: Group {group + 1}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Configuration Modal */}
      <AlertDialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Configure Traffic System</AlertDialogTitle>
            <AlertDialogDescription>
              Set up your traffic lights and synchronization groups.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-32">Number of Lights:</label>
              <Input
                type="number"
                min={2}
                max={12}
                value={numLights}
                onChange={handleNumLightsChange}
                className="w-24"
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Sync Groups Configuration</p>
              <p className="text-xs text-gray-500">
                Lights in the same sync group will change together and won't conflict.
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                <label className="text-sm w-24">Select Light:</label>
                <Select 
                  value={selectedLight.toString()} 
                  onValueChange={(value) => setSelectedLight(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select Light" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: numLights }).map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>Light {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="text-sm w-24">Assign to Group:</label>
                <Select 
                  value={syncGroups[selectedLight].toString()} 
                  onValueChange={(value) => updateSyncGroup(selectedLight, parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(numLights, 5) }).map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>Group {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Configuration</p>
              <div className="grid grid-cols-2 gap-2">
                {syncGroups.map((group, index) => (
                  <div 
                    key={index} 
                    className={`p-2 border rounded-md text-sm ${
                      index === selectedLight ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    Light {index + 1} → Group {group + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyConfiguration}>Apply</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfigPanel;
