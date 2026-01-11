'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Heart, AlertTriangle, Loader2 } from 'lucide-react';

interface AIHealthAdvisoryProps {
  aqi: number;
  wardId?: string;
  className?: string;
}

const AIHealthAdvisory: React.FC<AIHealthAdvisoryProps> = ({ 
  aqi, 
  wardId, 
  className = '' 
}) => {
  const [advisory, setAdvisory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const getHealthAdvisory = useCallback(async (aqiValue: number, ward?: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/health-advisory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aqi: aqiValue,
          wardId: ward || 'unknown'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return data.advisory;
      } else {
        throw new Error('Failed to get health advisory');
      }
    } catch (error) {
      console.error('Health Advisory Error:', error);
      return getDefaultHealthAdvisory(aqiValue);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchAdvisory = async () => {
      const result = await getHealthAdvisory(aqi, wardId);
      setAdvisory(result);
    };

    if (aqi > 0) {
      fetchAdvisory();
    }
  }, [aqi, wardId]); // Removed getHealthAdvisory from dependencies

  const getAdvisoryColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-600 bg-green-50 border-green-200';
    if (aqi <= 100) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (aqi <= 150) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (aqi <= 200) return 'text-red-600 bg-red-50 border-red-200';
    if (aqi <= 300) return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-red-800 bg-red-100 border-red-300';
  };

  const getDefaultHealthAdvisory = (aqi: number): string => {
    if (aqi <= 50) return "Air quality is good. Enjoy outdoor activities.";
    if (aqi <= 100) return "Moderate air quality. Sensitive individuals should limit outdoor exposure.";
    if (aqi <= 150) return "Unhealthy for sensitive groups. Wear masks outdoors.";
    if (aqi <= 200) return "Unhealthy air quality. Limit outdoor activities and wear N95 masks.";
    if (aqi <= 300) return "Very unhealthy. Avoid outdoor activities. Stay indoors with air purifiers.";
    return "Hazardous air quality. Emergency conditions. Stay indoors immediately.";
  };

  return (
    <div className={`border rounded-lg p-4 ${getAdvisoryColor(aqi)} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {aqi > 100 ? (
            <AlertTriangle size={20} className="mt-0.5" />
          ) : (
            <Heart size={20} className="mt-0.5" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2">AI Health Advisory</h3>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Getting personalized advice...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{advisory}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIHealthAdvisory;