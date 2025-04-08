
import React from 'react';

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

export default MetricCard;
