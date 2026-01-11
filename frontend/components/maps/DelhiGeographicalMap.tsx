"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Ward {
  wardId: string;
  wardName: string;
  aqi: number;
  status: string;
  ranking?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface DelhiGeographicalMapProps<T extends Ward> {
  wards: T[];
  onWardSelect: (ward: T) => void;
}

// Delhi ward coordinates (actual geographical locations)
const WARD_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'Ward 1': { lat: 28.8544, lng: 77.0917 },
  'Ward 2': { lat: 28.8200, lng: 77.1100 },
  'Ward 3': { lat: 28.8300, lng: 77.1200 },
  'Ward 4': { lat: 28.8044, lng: 77.1436 },
  'Ward 5': { lat: 28.7800, lng: 77.1500 }
};

export default function DelhiGeographicalMap<T extends Ward>({ wards, onWardSelect }: DelhiGeographicalMapProps<T>) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const getColorFromAQI = (aqi: number): string => {
    if (aqi <= 50) return '#10b981'; // Green
    if (aqi <= 100) return '#f59e0b'; // Yellow
    if (aqi <= 200) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 10);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add ward markers
    wards.forEach(ward => {
      const coordinates = WARD_COORDINATES[ward.wardName] || { 
        lat: 28.6139 + (Math.random() - 0.5) * 0.5, 
        lng: 77.2090 + (Math.random() - 0.5) * 0.5 
      };
      
      // Create custom icon based on AQI
      const customIcon = L.divIcon({
        className: 'custom-ward-marker',
        html: `
          <div style="
            background-color: ${getColorFromAQI(ward.aqi)};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${ward.aqi}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([coordinates.lat, coordinates.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${ward.wardName}</h3>
            <p style="margin: 4px 0;"><strong>AQI:</strong> ${ward.aqi}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${ward.status}</p>
            <p style="margin: 4px 0;"><strong>Rank:</strong> #${ward.ranking || 'N/A'}</p>
          </div>
        `);

      marker.on('click', () => {
        onWardSelect(ward);
      });
    });

    // Add Delhi boundary (approximate)
    const delhiBounds: L.LatLngBoundsExpression = [
      [28.4041, 76.8388],
      [28.8841, 77.3488]
    ];
    
    L.rectangle(delhiBounds, {
      color: '#3b82f6',
      weight: 2,
      fillOpacity: 0.1
    }).addTo(map);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [wards, onWardSelect]);

  return (
    <div className="w-full">
      <div ref={mapRef} className="h-[400px] w-full rounded-xl border border-slate-200" />
      
      {/* Map Legend */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-sm font-medium text-green-700">Good</div>
          <div className="text-xs text-green-600">0-50 AQI</div>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          </div>
          <div className="text-sm font-medium text-yellow-700">Moderate</div>
          <div className="text-xs text-yellow-600">51-100 AQI</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          </div>
          <div className="text-sm font-medium text-orange-700">Poor</div>
          <div className="text-xs text-orange-600">101-200 AQI</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          </div>
          <div className="text-sm font-medium text-red-700">Severe</div>
          <div className="text-xs text-red-600">200+ AQI</div>
        </div>
      </div>
    </div>
  );
}