"use client";

import { useEffect, useState } from 'react';
import Navbar from "@/components/layout/Navbar";
import { Search, MapPin, Wind, User, AlertCircle } from 'lucide-react';

interface WardBasic {
    wardId: number;
    wardName: string;
    zone: string;
}

interface WardDetails extends WardBasic {
    officer_name?: string;
    off_contact?: string;
    dep_add?: string;
    pollution: {
        aqi: number;
        pm25: number;
        updatedAt: string;
    };
}

export default function WardDirectory() {
    const [wards, setWards] = useState<WardBasic[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWard, setSelectedWard] = useState<WardDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchWards();
    }, []);

    const fetchWards = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/wards');
            if (!res.ok) throw new Error('Failed to fetch wards');
            const data = await res.json();
            if (data.success) {
                setWards(data.data);
            }
        } catch (err) {
            setError('Failed to load ward list');
        } finally {
            setLoading(false);
        }
    };

    const fetchWardDetails = async (wardId: number) => {
        setLoadingDetails(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:5000/api/wards/${wardId}`);
            if (!res.ok) throw new Error('Failed to fetch details');
            const data = await res.json();
            if (data.success) {
                setSelectedWard(data.data);
            }
        } catch (err) {
            setError('Failed to load ward details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const getAqiColor = (aqi: number) => {
        if (aqi <= 50) return 'text-green-600 bg-green-50 border-green-200';
        if (aqi <= 100) return 'text-lime-600 bg-lime-50 border-lime-200';
        if (aqi <= 200) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        if (aqi <= 300) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const filteredWards = wards.filter(w =>
        w.wardName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.wardId.toString().includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Ward Directory</h1>
                    <p className="text-slate-500 mt-2">Browse Delhi's wards and view real-time pollution data</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List Column */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[700px] flex flex-col">
                        <div className="p-4 border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search wards..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {loading ? (
                                <div className="p-8 text-center text-slate-400">Loading directory...</div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {filteredWards.map(ward => (
                                        <button
                                            key={ward.wardId}
                                            onClick={() => fetchWardDetails(ward.wardId)}
                                            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedWard?.wardId === ward.wardId ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                                        >
                                            <div>
                                                <div className="font-medium text-slate-900">{ward.wardName}</div>
                                                <div className="text-xs text-slate-500">Ward #{ward.wardId} • {ward.zone}</div>
                                            </div>
                                            <div className="text-slate-300">→</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="lg:col-span-2">
                        {selectedWard ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                                {loadingDetails ? (
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-8 bg-slate-100 w-1/3 rounded"></div>
                                        <div className="h-4 bg-slate-100 w-1/4 rounded"></div>
                                        <div className="h-32 bg-slate-100 rounded mt-8"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h2 className="text-3xl font-bold text-slate-900">{selectedWard.wardName}</h2>
                                                <div className="flex items-center text-slate-500 mt-2 gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={16} />
                                                        {selectedWard.zone} Zone
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold">
                                                        Ward #{selectedWard.wardId}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`px-4 py-3 rounded-xl border flex flex-col items-center ${getAqiColor(selectedWard.pollution.aqi)}`}>
                                                <span className="text-xs font-bold uppercase tracking-wider mb-1">Current AQI</span>
                                                <span className="text-4xl font-black">{selectedWard.pollution.aqi}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                    <User size={18} />
                                                    Nodal Officer
                                                </h3>
                                                {selectedWard.officer_name ? (
                                                    <div className="space-y-2 text-sm">
                                                        <p className="font-medium text-slate-800">{selectedWard.officer_name}</p>
                                                        <p className="text-slate-500">{selectedWard.off_contact || 'No contact info'}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-400 text-sm">No officer assigned</p>
                                                )}
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                    <Wind size={18} />
                                                    Pollution Data
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-sm text-slate-500">PM 2.5</span>
                                                        <span className="text-xl font-bold text-slate-900">{selectedWard.pollution.pm25} µg/m³</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                                        <div className="h-full bg-slate-800" style={{ width: `${Math.min((selectedWard.pollution.pm25 / 100) * 100, 100)}%` }}></div>
                                                    </div>
                                                    <p className="text-xs text-slate-400 pt-2">
                                                        Updated: {new Date(selectedWard.pollution.updatedAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedWard.dep_add && (
                                            <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                                <h3 className="font-semibold text-slate-900 mb-2">Office Address</h3>
                                                <p className="text-slate-600 text-sm">{selectedWard.dep_add}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                                <AlertCircle size={48} className="mb-4 opacity-50" />
                                <p className="font-medium">Select a ward to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
