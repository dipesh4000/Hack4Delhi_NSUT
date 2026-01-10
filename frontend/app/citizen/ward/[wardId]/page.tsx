"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import axios from "axios";
import { ArrowLeft, MapPin, Wind, Phone, AlertCircle, Activity, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic Import for Map
const WardMap = dynamic(() => import("@/components/citizen/WardMap"), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />
});

interface Ward {
    wardId: number;
    wardName: string;
    zone: string;
    aqi: number;
    status: string;
    lat?: number;
    lon?: number;
    pollutants?: {
        pm25: number;
        pm10: number;
        no2: number;
    };
    officer?: {
        name: string;
        contact: string;
        address: string;
    };
}

export default function WardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const wardId = params.wardId as string;

    const [ward, setWard] = useState<Ward | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (wardId) {
            fetchWardDetails();
        }
    }, [wardId]);

    const fetchWardDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/wards/${wardId}`);
            if (response.data.success) {
                setWard(response.data.data);
            } else {
                setError("Failed to fetch ward details.");
            }
        } catch (err) {
            console.error("Failed to fetch ward:", err);
            setError("Unable to load ward details.");
        } finally {
            setLoading(false);
        }
    };

    const getAqiColor = (aqi: number) => {
        if (aqi <= 50) return "text-green-700 bg-green-50 border-green-200";
        if (aqi <= 100) return "text-yellow-700 bg-yellow-50 border-yellow-200";
        if (aqi <= 200) return "text-orange-700 bg-orange-50 border-orange-200";
        if (aqi <= 300) return "text-red-700 bg-red-50 border-red-200";
        return "text-purple-700 bg-purple-50 border-purple-200";
    };

    const getHealthAdvice = (aqi: number) => {
        if (aqi <= 50) return { level: "Good", advice: "Air quality is satisfactory. Enjoy outdoor activities!", color: "green" };
        if (aqi <= 100) return { level: "Moderate", advice: "Sensitive individuals should consider limiting prolonged outdoor exertion.", color: "yellow" };
        if (aqi <= 200) return { level: "Unhealthy for Sensitive Groups", advice: "Children, elderly, and people with respiratory issues should limit outdoor activities.", color: "orange" };
        if (aqi <= 300) return { level: "Unhealthy", advice: "Everyone should reduce prolonged outdoor exertion. Wear masks when going outside.", color: "red" };
        return { level: "Very Unhealthy", advice: "Avoid outdoor activities. Stay indoors with air purifiers. Wear N95 masks if you must go out.", color: "purple" };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh] pt-24">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading ward details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !ward) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh] pt-24">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Ward Not Found</h2>
                        <p className="text-slate-500 mb-4">{error}</p>
                        <button
                            onClick={() => router.push("/citizen")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const healthInfo = getHealthAdvice(ward.aqi);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/citizen")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Dashboard</span>
                </button>

                {/* Ward Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{ward.wardName}</h1>
                            <div className="flex items-center gap-3 text-slate-500">
                                <span className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {ward.zone} Zone
                                </span>
                                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                                    Ward #{ward.wardId}
                                </span>
                            </div>
                        </div>
                        <div className={`px-6 py-4 rounded-xl border ${getAqiColor(ward.aqi)}`}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1">Current AQI</p>
                            <p className="text-4xl font-bold">{ward.aqi}</p>
                            <p className="text-xs mt-1 font-medium">{ward.status}</p>
                        </div>
                    </div>

                    {/* Health Advisory */}
                    <div className={`p-4 rounded-lg border ${healthInfo.color === 'green' ? 'bg-green-50 border-green-200' :
                            healthInfo.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                                healthInfo.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                                    healthInfo.color === 'red' ? 'bg-red-50 border-red-200' :
                                        'bg-purple-50 border-purple-200'
                        }`}>
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className={`flex-shrink-0 mt-0.5 ${healthInfo.color === 'green' ? 'text-green-600' :
                                    healthInfo.color === 'yellow' ? 'text-yellow-600' :
                                        healthInfo.color === 'orange' ? 'text-orange-600' :
                                            healthInfo.color === 'red' ? 'text-red-600' :
                                                'text-purple-600'
                                }`} />
                            <div>
                                <h4 className={`font-semibold mb-1 ${healthInfo.color === 'green' ? 'text-green-900' :
                                        healthInfo.color === 'yellow' ? 'text-yellow-900' :
                                            healthInfo.color === 'orange' ? 'text-orange-900' :
                                                healthInfo.color === 'red' ? 'text-red-900' :
                                                    'text-purple-900'
                                    }`}>{healthInfo.level}</h4>
                                <p className={`text-sm ${healthInfo.color === 'green' ? 'text-green-700' :
                                        healthInfo.color === 'yellow' ? 'text-yellow-700' :
                                            healthInfo.color === 'orange' ? 'text-orange-700' :
                                                healthInfo.color === 'red' ? 'text-red-700' :
                                                    'text-purple-700'
                                    }`}>{healthInfo.advice}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pollutants Grid */}
                {ward.pollutants && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Wind size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PM 2.5</p>
                                    <p className="text-sm text-slate-400">Fine Particles</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{ward.pollutants.pm25}</p>
                            <p className="text-xs text-slate-500 mt-1">µg/m³</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Wind size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PM 10</p>
                                    <p className="text-sm text-slate-400">Coarse Particles</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{ward.pollutants.pm10}</p>
                            <p className="text-xs text-slate-500 mt-1">µg/m³</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Activity size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NO₂</p>
                                    <p className="text-sm text-slate-400">Nitrogen Dioxide</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{ward.pollutants.no2}</p>
                            <p className="text-xs text-slate-500 mt-1">µg/m³</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map */}
                    {ward.lat && ward.lon && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Location</h3>
                            <div className="h-64 rounded-lg overflow-hidden">
                                <WardMap lat={ward.lat} lon={ward.lon} name={ward.wardName} />
                            </div>
                        </div>
                    )}

                    {/* Officer Contact */}
                    {ward.officer && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Phone size={20} />
                                Ward Officer Contact
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Name</p>
                                    <p className="font-medium text-slate-900">{ward.officer.name || 'Not Assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Contact Number</p>
                                    <p className="font-medium text-slate-900">
                                        {ward.officer.contact !== 'o' ? ward.officer.contact : 'No Contact Available'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Office Address</p>
                                    <p className="text-slate-700 text-sm">{ward.officer.address || 'Not Available'}</p>
                                </div>
                                {ward.officer.contact && ward.officer.contact !== 'o' && (
                                    <a
                                        href={`tel:${ward.officer.contact}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                        <Phone size={16} />
                                        Call Officer
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pollutant Information */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Understanding Pollutants</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-2">PM 2.5</h4>
                            <p className="text-blue-700 text-xs">Fine particulate matter smaller than 2.5 micrometers. Can penetrate deep into lungs and bloodstream.</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                            <h4 className="font-semibold text-orange-900 mb-2">PM 10</h4>
                            <p className="text-orange-700 text-xs">Coarse particles up to 10 micrometers. Can irritate airways and worsen respiratory conditions.</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <h4 className="font-semibold text-purple-900 mb-2">NO₂</h4>
                            <p className="text-purple-700 text-xs">Nitrogen dioxide from vehicle emissions. Can trigger asthma and reduce lung function.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
