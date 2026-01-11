'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Shield, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

interface AIGovtActionProps {
  aqi: number;
  wardId?: string;
  pollutionLevel?: string;
  className?: string;
}

const AIGovtAction: React.FC<AIGovtActionProps> = ({ 
  aqi, 
  wardId, 
  pollutionLevel,
  className = '' 
}) => {
  const [action, setAction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const getGovtAction = useCallback(async (aqiValue: number, ward?: string, level?: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/govt-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aqi: aqiValue,
          wardId: ward || 'unknown',
          pollutionLevel: level || 'moderate'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return data.action;
      } else {
        throw new Error('Failed to get government action');
      }
    } catch (error) {
      console.error('Govt Action Error:', error);
      return getDefaultGovtAction(aqiValue);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchAction = async () => {
      const result = await getGovtAction(aqi, wardId, pollutionLevel);
      setAction(result);
    };

    if (aqi > 0) {
      fetchAction();
    }
  }, [aqi, wardId, pollutionLevel]); // Removed getGovtAction from dependencies

  const getActionColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-700 bg-green-50 border-green-200';
    if (aqi <= 100) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (aqi <= 150) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (aqi <= 200) return 'text-orange-700 bg-orange-50 border-orange-200';
    if (aqi <= 300) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-red-800 bg-red-100 border-red-300';
  };

  const getActionIcon = (aqi: number) => {
    if (aqi <= 50) return <CheckCircle size={20} className="mt-0.5" />;
    if (aqi <= 100) return <Shield size={20} className="mt-0.5" />;
    return <AlertCircle size={20} className="mt-0.5" />;
  };

  const getUrgencyLevel = (aqi: number) => {
    if (aqi <= 50) return 'ROUTINE';
    if (aqi <= 100) return 'MONITOR';
    if (aqi <= 150) return 'ALERT';
    if (aqi <= 200) return 'WARNING';
    if (aqi <= 300) return 'EMERGENCY';
    return 'CRITICAL';
  };

  const getDefaultGovtAction = (aqi: number): string => {
    if (aqi <= 100) return "Priority action: Continue regular monitoring and maintenance.";
    if (aqi <= 150) return "Priority action: Increase street cleaning and monitor industrial emissions.";
    if (aqi <= 200) return "Priority action: Implement traffic restrictions and halt construction activities.";
    if (aqi <= 300) return "Priority action: Emergency measures - ban diesel vehicles and close schools.";
    return "Priority action: Declare public health emergency and implement complete lockdown.";
  };

  return (
    <div className={`border rounded-lg p-4 ${getActionColor(aqi)} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getActionIcon(aqi)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">AI Recommended Action</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              aqi > 200 ? 'bg-red-200 text-red-800' : 
              aqi > 100 ? 'bg-yellow-200 text-yellow-800' : 
              'bg-green-200 text-green-800'
            }`}>
              {getUrgencyLevel(aqi)}
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Analyzing situation...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed font-medium">{action}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGovtAction;