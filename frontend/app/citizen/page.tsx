import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { MapPin, Wind, AlertCircle, ArrowRight } from "lucide-react";

export default function CitizenDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Citizen Dashboard</h1>
          <p className="text-lg text-slate-600">
            Access real-time air quality data for Delhi's wards and stay informed about pollution levels in your area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Ward Directory Card */}
          <Link
            href="/citizen/wards"
            className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <MapPin className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ward Directory</h3>
            <p className="text-slate-600 text-sm">
              Browse all Delhi wards, view real-time AQI data, and find nodal officer contact information.
            </p>
          </Link>

          {/* Air Quality Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-sm border border-blue-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4">
              <Wind className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Air Quality Index</h3>
            <p className="text-slate-600 text-sm mb-4">
              Understanding AQI levels and their health implications.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-slate-700">0-50: Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-slate-700">51-100: Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-slate-700">101-200: Unhealthy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-slate-700">201+: Very Unhealthy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Real-time Data</h4>
            <p className="text-sm text-blue-700">
              All pollution data is sourced from OpenAQ and updated regularly. Ward information includes nodal officer details for direct communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

