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

import CitizenLayout from "@/components/citizen/CitizenLayout";

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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await axios.get(`${backendUrl}/api/wards`);
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
      <CitizenLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Loading Ward Directory...</p>
        </div>
      </CitizenLayout>
    );
  }

  if (error) {
    return (
      <CitizenLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-bold">{error}</p>
          <button
            onClick={fetchWards}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-600/20"
          >
            Try Again
          </button>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ward Directory</h1>
            <p className="text-slate-500 font-medium mt-1">
              Browse pollution data for all {wards.length} managed wards.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
          {/* Left List */}
          <div className="lg:col-span-4 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {filteredWards.length} Wards Found
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {filteredWards.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="font-bold">No wards found.</p>
                </div>
              ) : (
                filteredWards.map((ward) => (
                  <button
                    key={ward.wardId}
                    onClick={() => setSelectedWard(ward)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 group border ${selectedWard?.wardId === ward.wardId
                        ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-600/20 text-white"
                        : "bg-white/50 border-slate-100 hover:bg-white hover:border-blue-200"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-black tracking-tight ${selectedWard?.wardId === ward.wardId ? 'text-white' : 'text-slate-700'}`}>
                        {ward.wardName}
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${
                        selectedWard?.wardId === ward.wardId 
                          ? 'bg-white/20 border-white/30 text-white' 
                          : getAqiColor(ward.aqi)
                      }`}>
                        AQI {ward.aqi}
                      </span>
                    </div>
                    <div className="flex items-center text-[10px] font-bold gap-3 opacity-80">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {ward.zone}
                      </span>
                      <span className={`${selectedWard?.wardId === ward.wardId ? 'bg-white/20' : 'bg-slate-100'} px-1.5 py-0.5 rounded`}>
                        #{ward.wardId}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Details Panel */}
          <div className="lg:col-span-8">
            {selectedWard ? (
              <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl p-10 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Detail Header */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedWard.wardName}</h2>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black border shadow-sm ${getAqiColor(selectedWard.aqi)}`}>
                        {selectedWard.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-500 font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {selectedWard.zone} Zone • Ward #{selectedWard.wardId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 mb-1 font-black uppercase tracking-widest">REAL-TIME AQI</p>
                    <p className={`text-6xl font-black tracking-tighter ${getAqiColor(selectedWard.aqi).split(' ')[0]}`}>
                      {selectedWard.aqi}
                    </p>
                  </div>
                </div>

                {/* Officer Info */}
                {selectedWard.officer && (
                  <div className="mb-10 p-6 bg-white/50 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nodal Officer</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-lg font-black text-slate-900">{selectedWard.officer.name || 'Not Assigned'}</p>
                        <p className="text-xs text-slate-500 font-bold">Ward Administrator</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-blue-600">{selectedWard.officer.contact !== 'o' ? selectedWard.officer.contact : 'No Contact'}</p>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{selectedWard.officer.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map */}
                <div className="flex-1 rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 relative shadow-inner">
                  {selectedWard.lat && selectedWard.lon ? (
                    <WardMap
                      lat={selectedWard.lat}
                      lon={selectedWard.lon}
                      name={selectedWard.wardName}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <p className="font-bold">Map data unavailable</p>
                    </div>
                  )}
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg text-[10px] font-black uppercase tracking-widest z-[1000] border border-white/20">
                    Live Sensor Data
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/30 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                  <MapPin className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-600 mb-2 tracking-tight">No Ward Selected</h3>
                <p className="max-w-xs font-medium text-slate-400">Select a ward from the list to view real-time pollution data and officer details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
