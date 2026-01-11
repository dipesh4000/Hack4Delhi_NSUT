"use client";

import React, { createContext, useContext, useState } from 'react';

interface PollutionContextType {
  aqi: number;
  location: string;
  status: string;
  updatePollutionData: (data: { aqi: number; location: string; status: string }) => void;
}

const PollutionContext = createContext<PollutionContextType | undefined>(undefined);

export function PollutionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState({ 
    aqi: 0, 
    location: 'Delhi', 
    status: 'Unknown' 
  });

  const updatePollutionData = React.useCallback((newData: { aqi: number; location: string; status: string }) => {
    setData(prev => {
      // Only update if data actually changed to prevent unnecessary re-renders
      if (prev.aqi === newData.aqi && prev.location === newData.location && prev.status === newData.status) {
        return prev;
      }
      return newData;
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
