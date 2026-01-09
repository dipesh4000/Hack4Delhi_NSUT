"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, RefreshCw } from "lucide-react";

export default function UserLocation({ fallbackName }: { fallbackName: string }) {
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLocation = () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log("Got coords:", latitude, longitude);
          
          // Using OpenStreetMap Nominatim API (Free, No Key)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { 'User-Agent': 'WardAir-Hack4Delhi/1.0' } } // Good practice for OSM
          );
          
          if (!response.ok) throw new Error("OSM API failed");
          
          const data = await response.json();
          console.log("OSM Data:", data);
          
          // Extract the most relevant name
          const address = data.address;
          const wardName = address.suburb || address.neighbourhood || address.residential || address.city_district || address.city || "Unknown Location";
          
          setLocationName(wardName);
        } catch (err) {
          console.error("Location fetch error:", err);
          setError("Failed to fetch address");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(err.message || "Location access denied");
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false } // 10s timeout, low accuracy for speed
    );
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-500 animate-pulse">
        <Loader2 className="w-3 h-3 animate-spin" />
        Locating...
      </span>
    );
  }

  if (error) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-500">
        <span className="font-semibold text-slate-900">{fallbackName}</span>
        <button onClick={fetchLocation} title="Retry Location" className="text-blue-600 hover:text-blue-700">
            <RefreshCw className="w-3 h-3" />
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-semibold text-slate-900">{locationName || fallbackName}</span>
      <MapPin className="w-3 h-3 text-blue-500" />
    </span>
  );
}
