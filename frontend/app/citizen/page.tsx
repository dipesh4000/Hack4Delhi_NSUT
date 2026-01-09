import Navbar from "@/components/layout/Navbar";

export default function CitizenDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Citizen Dashboard</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-600">
            Welcome to the Citizen Dashboard. Here you will see real-time air quality data for your ward.
            <br />
            <span className="text-sm text-slate-400 mt-2 block">(Map and data integration coming soon)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
