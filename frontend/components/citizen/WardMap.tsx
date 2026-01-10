"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface WardMapProps {
  lat: number;
  lon: number;
  name: string;
}

// Component to update map view when coordinates change
function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();

  useEffect(() => {
    // Fly to new coordinates with smooth animation
    map.flyTo([lat, lon], 13, {
      duration: 1.5, // Animation duration in seconds
    });
  }, [lat, lon, map]);

  return null;
}

export default function WardMap({ lat, lon, name }: WardMapProps) {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden z-0">
      <MapContainer
        center={[lat, lon]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]} icon={icon}>
          <Popup>
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-slate-500">Air Quality Monitoring Station</div>
          </Popup>
        </Marker>
        <MapUpdater lat={lat} lon={lon} />
      </MapContainer>
    </div>
  );
}

