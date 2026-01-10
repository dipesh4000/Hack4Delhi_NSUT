"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Car, Factory, Construction, MapPin } from 'lucide-react';

interface Ward {
  wardId: string;
  wardName: string;
  aqi: number;
  pollutionSources?: {
    vehicular: number;
    industrial: number;
    construction: number;
    residential: number;
  };
}

interface WardGeographicalMapProps {
  ward: Ward;
}

// Ward coordinates mapping
const WARD_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'Narela': { lat: 28.8544, lng: 77.0917 },
  'Bankner': { lat: 28.8200, lng: 77.1100 },
  'Holambi Kalan': { lat: 28.8300, lng: 77.1200 },
  'Alipur': { lat: 28.8044, lng: 77.1436 },
  'Rohini-A': { lat: 28.7041, lng: 77.1025 },
  'Rohini-B': { lat: 28.7141, lng: 77.1125 },
  'Dwarka-A': { lat: 28.5921, lng: 77.0460 },
  'Dwarka-B': { lat: 28.5821, lng: 77.0560 },
  'Dwarka-C': { lat: 28.5721, lng: 77.0660 },
  'Connaught Place': { lat: 28.6315, lng: 77.2167 },
  'Karol Bagh': { lat: 28.6519, lng: 77.1909 },
  'Lajpat Nagar': { lat: 28.5677, lng: 77.2436 },
  'Vasant Kunj': { lat: 28.5244, lng: 77.1588 },
  'Mehrauli': { lat: 28.5244, lng: 77.1855 },
  'Shahdara': { lat: 28.6692, lng: 77.2889 },
  'Najafgarh': { lat: 28.6089, lng: 76.9794 },
  'Chandni Chowk': { lat: 28.6506, lng: 77.2303 },
  'Delhi Gate': { lat: 28.6406, lng: 77.2403 },
  'Jama Masjid': { lat: 28.6506, lng: 77.2333 },
  'Civil Lines': { lat: 28.6706, lng: 77.2203 }
};

// Generate pollution sources based on ward data
const generatePollutionSources = (ward: Ward, center: { lat: number; lng: number }) => {
  const sources = [];
  
  if (ward.pollutionSources) {
    // Traffic congestion points
    const trafficCount = Math.floor(ward.pollutionSources.vehicular / 10);
    for (let i = 0; i < trafficCount; i++) {
      sources.push({
        type: 'traffic',
        lat: center.lat + (Math.random() - 0.5) * 0.02,
        lng: center.lng + (Math.random() - 0.5) * 0.02,
        intensity: ward.pollutionSources.vehicular,
        name: `Traffic Hotspot ${i + 1}`,
        description: `High traffic congestion area with ${ward.pollutionSources.vehicular}% pollution contribution`
      });
    }
    
    // Industrial sources
    const industrialCount = Math.floor(ward.pollutionSources.industrial / 15);
    for (let i = 0; i < industrialCount; i++) {
      sources.push({
        type: 'industrial',
        lat: center.lat + (Math.random() - 0.5) * 0.03,
        lng: center.lng + (Math.random() - 0.5) * 0.03,
        intensity: ward.pollutionSources.industrial,
        name: `Industrial Unit ${i + 1}`,
        description: `Manufacturing/Industrial facility contributing ${ward.pollutionSources.industrial}% pollution`
      });
    }
    
    // Construction sites
    const constructionCount = Math.floor(ward.pollutionSources.construction / 12);
    for (let i = 0; i < constructionCount; i++) {
      sources.push({
        type: 'construction',
        lat: center.lat + (Math.random() - 0.5) * 0.025,
        lng: center.lng + (Math.random() - 0.5) * 0.025,
        intensity: ward.pollutionSources.construction,
        name: `Construction Site ${i + 1}`,
        description: `Active construction contributing ${ward.pollutionSources.construction}% pollution`
      });
    }
  }
  
  // Add AQI monitoring station
  sources.push({
    type: 'monitoring',
    lat: center.lat,
    lng: center.lng,
    intensity: ward.aqi,
    name: `${ward.wardName} AQI Station`,
    description: `Air Quality Monitoring Station - Current AQI: ${ward.aqi}`
  });
  
  return sources;
};

export default function WardGeographicalMap({ ward }: WardGeographicalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const center = WARD_COORDINATES[ward.wardName] || { 
      lat: 28.6139 + (Math.random() - 0.5) * 0.1, 
      lng: 77.2090 + (Math.random() - 0.5) * 0.1 
    };

    // Initialize map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 14);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Generate pollution sources
    const sources = generatePollutionSources(ward, center);

    // Add markers for pollution sources
    sources.forEach(source => {
      let iconHtml = '';
      let color = '';
      
      switch (source.type) {
        case 'traffic':
          color = '#3b82f6';
          iconHtml = `
            <div style="
              background-color: ${color};
              width: 25px;
              height: 25px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">🚗</div>
          `;
          break;
        case 'industrial':
          color = '#ef4444';
          iconHtml = `
            <div style="
              background-color: ${color};
              width: 25px;
              height: 25px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">🏭</div>
          `;
          break;
        case 'construction':
          color = '#f97316';
          iconHtml = `
            <div style="
              background-color: ${color};
              width: 25px;
              height: 25px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">🏗️</div>
          `;
          break;
        case 'monitoring':
          color = '#10b981';
          iconHtml = `
            <div style="
              background-color: ${color};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            ">📡</div>
          `;
          break;
      }

      const customIcon = L.divIcon({
        className: 'custom-pollution-marker',
        html: iconHtml,
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5]
      });

      const marker = L.marker([source.lat, source.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${source.name}</h3>
            <p style="margin: 4px 0; font-size: 14px;">${source.description}</p>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${source.type}</p>
            <p style="margin: 4px 0;"><strong>Impact:</strong> ${source.intensity}${source.type === 'monitoring' ? ' AQI' : '% contribution'}</p>
          </div>
        `);
    });

    // Add ward boundary circle
    L.circle([center.lat, center.lng], {
      color: '#6366f1',
      fillColor: '#6366f1',
      fillOpacity: 0.1,
      radius: 1000
    }).addTo(map);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [ward]);

  return (
    <div className="w-full">
      <div ref={mapRef} className="h-[400px] w-full rounded-xl border border-slate-200" />
      
      {/* Pollution Sources Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Car size={20} className="text-blue-600" />
          <div>
            <div className="text-lg font-bold text-blue-900">{ward.pollutionSources?.vehicular}%</div>
            <div className="text-sm text-blue-700 font-medium">Traffic</div>
            <div className="text-xs text-blue-600">{Math.floor((ward.pollutionSources?.vehicular || 0) / 10)} hotspots</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <Factory size={20} className="text-red-600" />
          <div>
            <div className="text-lg font-bold text-red-900">{ward.pollutionSources?.industrial}%</div>
            <div className="text-sm text-red-700 font-medium">Industrial</div>
            <div className="text-xs text-red-600">{Math.floor((ward.pollutionSources?.industrial || 0) / 15)} units</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <Construction size={20} className="text-orange-600" />
          <div>
            <div className="text-lg font-bold text-orange-900">{ward.pollutionSources?.construction}%</div>
            <div className="text-sm text-orange-700 font-medium">Construction</div>
            <div className="text-xs text-orange-600">{Math.floor((ward.pollutionSources?.construction || 0) / 12)} sites</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <MapPin size={20} className="text-green-600" />
          <div>
            <div className="text-lg font-bold text-green-900">{ward.aqi}</div>
            <div className="text-sm text-green-700 font-medium">AQI Station</div>
            <div className="text-xs text-green-600">Live monitoring</div>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
          <span className="text-sm font-medium text-blue-900">Traffic</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
          <div className="w-4 h-4 bg-red-600 rounded-full"></div>
          <span className="text-sm font-medium text-red-900">Industrial</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
          <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
          <span className="text-sm font-medium text-orange-900">Construction</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <div className="w-4 h-4 bg-green-600 rounded-full"></div>
          <span className="text-sm font-medium text-green-900">AQI Station</span>
        </div>
      </div>
    </div>
  );
}