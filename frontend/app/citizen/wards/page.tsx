"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, Wind, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamic Import for Map
const WardMap = dynamic(() => import("@/components/citizen/WardMap"), {
  ssr: false,
  loading: () => <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
});

interface Ward {
  wardId: number;
  wardName: string;
  zone: string;
  aqi: number;
  status: string;
  lat?: number;
  lon?: number;
  officer?: {
    name: string;
    contact: string;
    address: string;
  };
}

export default function WardDirectoryPage() {
  const router = useRouter();
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wards");
      if (response.data.success) {
        setWards(response.data.data);
      } else {
        setError("Failed to fetch ward data.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to Ward Service.");
    } finally {
      setLoading(false);
    }
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-600 bg-green-50 border-green-200";
    if (aqi <= 100) return "text-lime-600 bg-lime-50 border-lime-200";
    if (aqi <= 200) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (aqi <= 300) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const filteredWards = wards.filter(
    (w) =>
      w.wardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading Ward Directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={fetchWards}
          className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ward Directory</h1>
          <p className="text-slate-500 mt-1">
            Browse pollution data for all {wards.length} managed wards.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
        {/* Left List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {filteredWards.length} Wards Found
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredWards.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No wards found.</p>
              </div>
            ) : (
              filteredWards.map((ward) => (
                <button
                  key={ward.wardId}
                  onClick={() => setSelectedWard(ward)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group border ${selectedWard?.wardId === ward.wardId
                      ? "bg-blue-50 border-blue-200 shadow-inner"
                      : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold ${selectedWard?.wardId === ward.wardId ? 'text-blue-700' : 'text-slate-700'}`}>
                      {ward.wardName}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getAqiColor(ward.aqi)}`}>
                      AQI {ward.aqi}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {ward.zone}
                    </span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">
                      #{ward.wardId}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWard ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Detail Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-black text-slate-900">{selectedWard.wardName}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getAqiColor(selectedWard.aqi)}`}>
                      {selectedWard.status}
                    </span>
                  </div>
                  <p className="text-slate-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedWard.zone} Zone • Ward #{selectedWard.wardId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1 font-medium">REAL-TIME AQI</p>
                  <p className={`text-5xl font-black ${getAqiColor(selectedWard.aqi).split(' ')[0]}`}>
                    {selectedWard.aqi}
                  </p>
                </div>
              </div>

              {/* Officer Info */}
              {selectedWard.officer && (
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Nodal Officer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{selectedWard.officer.name || 'Not Assigned'}</p>
                      <p className="text-xs text-slate-500">Designation not available</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>{selectedWard.officer.contact !== 'o' ? selectedWard.officer.contact : 'No Contact'}</p>
                      <p className="text-xs text-slate-400 mt-1 break-words">{selectedWard.officer.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                {selectedWard.lat && selectedWard.lon ? (
                  <WardMap
                    lat={selectedWard.lat}
                    lon={selectedWard.lon}
                    name={selectedWard.wardName}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <p>Map data unavailable</p>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm text-xs font-bold z-[1000]">
                  Live Sensor Data
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-1">No Ward Selected</h3>
              <p className="max-w-xs">Select a ward from the list to view real-time pollution data and officer details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
