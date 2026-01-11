"use client";

import React, { createContext, useContext, useState } from 'react';

interface PollutionContextType {
  aqi: number;
  location: string;
  status: string;
  pollutants: any[];
  dominantPollutant: string;
  pollutionData: any;
  updatePollutionData: (data: any) => void;
}

const PollutionContext = createContext<PollutionContextType | undefined>(undefined);

export function PollutionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>({ 
    aqi: 0, 
    location: 'Delhi', 
    status: 'Unknown',
    pollutants: [],
    dominantPollutant: 'PM2.5',
    pollutionData: null
  });

  const updatePollutionData = React.useCallback((newData: any) => {
    setData((prev: any) => {
      const aqi = newData.aqi ?? prev.aqi;
      const location = newData.name || newData.location || prev.location;
      const status = newData.status || prev.status;
      const pollutants = newData.pollutantComposition || newData.pollutants || prev.pollutants || [];
      const dominantPollutant = newData.dominantPollutant || prev.dominantPollutant;
      
      return {
        ...prev,
        aqi,
        location,
        status,
        pollutants,
        dominantPollutant,
        pollutionData: newData
      };
    });
  }, []);

  const value = React.useMemo(() => ({
    ...data,
    updatePollutionData
  }), [data, updatePollutionData]);

  return (
    <PollutionContext.Provider value={value}>
      {children}
    </PollutionContext.Provider>
  );
}

export const usePollution = () => {
  const context = useContext(PollutionContext);
  if (!context) {
    throw new Error('usePollution must be used within a PollutionProvider');
  }
  return context;
};
