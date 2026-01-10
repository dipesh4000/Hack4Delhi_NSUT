import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
        map.flyTo(center as L.LatLngExpression, 13, {
            duration: 1.5
        });
    }, [center, map]);
    return null;
}

export default function PollutionMap({ wards, selectedWard, onSelectWard }: PollutionMapProps) {
    const defaultCenter: LatLngExpression = [28.6139, 77.2090]; // Delhi Center

    const getStatusColor = (aqi: number) => {
        if (aqi <= 50) return { bg: '#22c55e', text: '#fff', border: '#15803d' };     // Good (Green)
        if (aqi <= 100) return { bg: '#84cc16', text: '#fff', border: '#4d7c0f' };    // Moderate (Lime)
        if (aqi <= 200) return { bg: '#eab308', text: '#fff', border: '#a16207' };    // Poor (Yellow)
        if (aqi <= 300) return { bg: '#f97316', text: '#fff', border: '#c2410c' };    // Very Poor (Orange)
        return { bg: '#ef4444', text: '#fff', border: '#b91c1c' };                    // Severe (Red)
    };

    const createCustomIcon = (aqi: number) => {
        const colors = getStatusColor(aqi);

        return L.divIcon({
            className: 'custom-aqi-marker',
            html: `<div style="
                background-color: ${colors.bg};
                color: ${colors.text};
                border: 2px solid ${colors.border};
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            ">${aqi}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -20]

        });
    };

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 z-0">
            <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {selectedWard && <MapController center={[selectedWard.lat, selectedWard.lon]} />}

                {wards.filter(w => w.lat && w.lon).map((ward: Ward) => (
                    <Marker
                        key={ward.wardId}
                        position={[ward.lat, ward.lon]}
                        icon={createCustomIcon(ward.aqi)}
                        eventHandlers={{
                            click: () => onSelectWard(ward),
                            mouseover: (e) => e.target.openPopup(),
                            mouseout: (e) => e.target.closePopup(),
                        }}
                    >
                        <Popup closeButton={false} autoPan={false}>
                            <div className="text-center min-w-[120px]">
                                <h3 className="font-bold text-slate-800 text-sm mb-1">{ward.wardName}</h3>
                                <div className="text-xs text-slate-500 mb-2">{ward.sourceStation}</div>
                                <div className="flex justify-between items-center text-xs border-t pt-2">
                                    <span className="font-semibold">AQI: {ward.aqi}</span>
                                    <span className="text-slate-500">{ward.status}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
