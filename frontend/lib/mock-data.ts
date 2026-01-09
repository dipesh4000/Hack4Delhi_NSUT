export interface Pollutant {
  name: string;
  value: number;
  unit: string;
  status: "Good" | "Moderate" | "Poor" | "Severe";
  description: string;
}

export interface Alert {
  id: string;
  type: "Severe" | "Warning" | "Info";
  title: string;
  message: string;
  timestamp: string;
  targetGroups?: string[];
}

export interface ActionItem {
  text: string;
  impact: string; // e.g., "High Impact"
}

export interface WardData {
  id: string;
  name: string;
  coordinates: { lat: number; lon: number };
  aqi: number;
  lastUpdated: string;
  dominantSource: string;
  sourceConfidence?: "Low" | "Medium" | "High";
  sourceReasoning?: string;
  pollutants: Pollutant[];
  alerts: Alert[];
  hourlyTrend: { time: string; aqi: number }[];
  pollutantComposition: { name: string; value: number; color: string }[];
  sourceContribution: { source: string; percentage: number; color: string }[];
  sourceForecast: { date: string; [key: string]: string | number }[];
  dailyActions: {
    dos: ActionItem[];
    avoids: ActionItem[];
  };
  contextualAdvice: string;
}

export const MOCK_WARD_DATA: WardData = {
  id: "ward-101",
  name: "Dwarka Sector 10",
  coordinates: { lat: 28.5733, lon: 77.0601 },
  aqi: 342,
  lastUpdated: "10 mins ago",
  dominantSource: "Vehicular Emissions",
  contextualAdvice: "Air quality is hazardous today. Even short exposure may cause breathing discomfort, chest tightness, or eye irritation.",
  pollutants: [
    {
      name: "PM2.5",
      value: 185,
      unit: "µg/m³",
      status: "Severe",
      description: "Fine particles that can penetrate deep into lungs.",
    },
    {
      name: "PM10",
      value: 260,
      unit: "µg/m³",
      status: "Poor",
      description: "Coarse particles from dust and construction.",
    },
    {
      name: "NO₂",
      value: 85,
      unit: "µg/m³",
      status: "Moderate",
      description: "Gas from burning fuel, mainly from cars.",
    },
    {
      name: "SO₂",
      value: 15,
      unit: "µg/m³",
      status: "Good",
      description: "Gas from industrial burning of coal/oil.",
    },
  ],
  alerts: [
    {
      id: "alert-1",
      type: "Severe",
      title: "Severe Air Quality Alert",
      message: "AQI has crossed 300. Avoid outdoor activities.",
      timestamp: "1 hour ago",
      targetGroups: ["Children", "Elderly", "Asthma Patients"],
    },
  ],
  hourlyTrend: [
    { time: "6 AM", aqi: 280 },
    { time: "9 AM", aqi: 310 },
    { time: "12 PM", aqi: 342 },
    { time: "3 PM", aqi: 330 },
    { time: "6 PM", aqi: 350 },
    { time: "9 PM", aqi: 320 },
  ],
  pollutantComposition: [
    { name: "PM2.5", value: 55, color: "#EF4444" }, // Red
    { name: "PM10", value: 25, color: "#F97316" }, // Orange
    { name: "NO₂", value: 15, color: "#EAB308" }, // Yellow
    { name: "SO₂", value: 5, color: "#22C55E" },  // Green
  ],
  sourceContribution: [
    { source: "Transport", percentage: 45, color: "#3B82F6" },
    { source: "Dust / Construction", percentage: 25, color: "#F59E0B" },
    { source: "Industry", percentage: 15, color: "#6366F1" },
    { source: "Biomass Burning", percentage: 10, color: "#EF4444" },
    { source: "Others", percentage: 5, color: "#94A3B8" },
  ],
  sourceForecast: [
    { date: "Jan 9", Transport: 40, Dust: 20, Industry: 15, Biomass: 15, Others: 10 },
    { date: "Jan 10", Transport: 35, Dust: 25, Industry: 15, Biomass: 15, Others: 10 },
    { date: "Jan 11", Transport: 30, Dust: 30, Industry: 20, Biomass: 10, Others: 10 },
    { date: "Jan 12", Transport: 35, Dust: 25, Industry: 20, Biomass: 10, Others: 10 },
  ],
  dailyActions: {
    dos: [
      { text: "Use metro / public transport", impact: "High Impact" },
      { text: "Carpool for short trips", impact: "Medium Impact" },
      { text: "Combine errands into one trip", impact: "Medium Impact" },
    ],
    avoids: [
      { text: "Short car trips (<2 km)", impact: "High Impact" },
      { text: "Honking unnecessarily", impact: "Low Impact" },
      { text: "Idling at traffic signals", impact: "Medium Impact" },
    ],
  },
};

export const HEALTH_ADVISORY = {
  good: {
    title: "Air is Good",
    message: "Enjoy your outdoor activities!",
    dos: ["Open windows for ventilation", "Exercise outdoors"],
    donts: ["Burn waste"],
  },
  moderate: {
    title: "Air is Moderate",
    message: "Sensitive groups should reduce outdoor exertion.",
    dos: ["Wear a mask if sensitive", "Keep windows closed during peak traffic"],
    donts: ["Strenuous outdoor exercise for sensitive groups"],
  },
  poor: {
    title: "Air is Poor",
    message: "Everyone may begin to experience health effects.",
    dos: ["Wear N95 mask outdoors", "Use air purifiers if available"],
    donts: ["Outdoor jogging", "Open windows"],
  },
  severe: {
    title: "Hazardous Air Quality",
    message: "Emergency conditions. Health warnings of emergency conditions.",
    dos: ["Stay indoors", "Keep windows sealed", "Use air purifiers"],
    donts: ["Any outdoor activity", "Smoking"],
  },
};

export function getSeverity(aqi: number): "Good" | "Moderate" | "Poor" | "Severe" {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 300) return "Poor";
  return "Severe";
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "Good": return "bg-emerald-500";
    case "Moderate": return "bg-yellow-500";
    case "Poor": return "bg-orange-500";
    case "Severe": return "bg-red-600";
    default: return "bg-slate-500";
  }
}
