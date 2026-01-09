"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';

// Define Interface
export interface Ward {
    wardId: string;
    wardName: string;
    aqi: number;
    status: string;
    sourceStation: string;
    lat: number;
    lon: number;
    pollutants: {
        pm25: number;
        pm10: number;
        no2: number;
    };
}

interface PollutionMapProps {
    wards: Ward[];
    selectedWard: Ward | null;
    onSelectWard: (ward: Ward) => void;
}

// Fix for Leaflet marker icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ center }: { center: LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center as L.LatLngExpression, 11);
    }, [center, map]);
    return null;
}

export default function PollutionMap({ wards, selectedWard, onSelectWard }: PollutionMapProps) {
    const defaultCenter: LatLngExpression = [28.6139, 77.2090]; // Delhi Center

    const getColor = (aqi: number) => {
        if (aqi <= 50) return '#22c55e'; // Green
        if (aqi <= 100) return '#84cc16'; // Lime
        if (aqi <= 200) return '#eab308'; // Yellow
        if (aqi <= 300) return '#f97316'; // Orange
        if (aqi <= 400) return '#ef4444'; // Red
        return '#a855f7'; // Purple
    };

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
            <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selectedWard && <MapController center={[selectedWard.lat, selectedWard.lon]} />}

                {wards.map((ward: Ward) => (
                    <CircleMarker
                        key={ward.wardId}
                        center={[ward.lat, ward.lon]}
                        pathOptions={{ color: getColor(ward.aqi), fillColor: getColor(ward.aqi), fillOpacity: 0.7 }}
                        radius={20}
                        eventHandlers={{
                            click: () => onSelectWard(ward),
                        }}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold">{ward.wardName}</h3>
                                <p>AQI: <span className="font-semibold" style={{ color: getColor(ward.aqi) }}>{ward.aqi}</span></p>
                                <p className="text-xs text-secondary">Status: {ward.status}</p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
}
