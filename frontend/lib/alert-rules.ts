import { WardData } from './mock-data';
import { 
  Heart, 
  Wind, 
  Activity, 
  Home, 
  ShieldAlert, 
  Baby, 
  Trees, 
  Car, 
  Factory, 
  ThermometerSun,
  Droplets,
  Stethoscope,
  DoorOpen,
  Shield,
  Bike,
  Leaf
} from 'lucide-react';

export type AlertCategory = 'Health' | 'Outdoor' | 'Vulnerable' | 'Indoor' | 'Prevention' | 'Improvement';
export type AlertSeverity = 'Info' | 'Warning' | 'Critical';

export interface AlertRule {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  condition: (data: WardData) => boolean;
  title: string;
  message: string;
  action: string;
  icon: any;
}

export interface ActiveAlert extends AlertRule {
  timestamp: string;
}

// Helper to check if a pollutant is dominant
const isDominant = (data: WardData, pollutant: string): boolean => {
  // This assumes we might have a way to check dominant pollutant, 
  // or we just check if it's high relative to others. 
  // For now, let's check if it's the named dominant source or just high value.
  // We'll use a simple threshold check for "high" if dominant source isn't specific enough.
  const p = data.pollutants.find(p => p.name === pollutant);
  return !!(p && p.value > 100); // Simplified check
};

export const ALERT_RULES: AlertRule[] = [
  // --- HEALTH ALERTS ---
  {
    id: 'health-severe-respiratory',
    category: 'Health',
    severity: 'Critical',
    condition: (data) => data.aqi > 300,
    title: 'Severe Respiratory Risk',
    message: 'Hazardous air quality may cause serious respiratory effects even in healthy people.',
    action: 'Use an N95 mask if you must go outside. Keep inhalers handy.',
    icon: Stethoscope
  },
  {
    id: 'health-heart-risk',
    category: 'Health',
    severity: 'Warning',
    condition: (data) => data.aqi > 200 && data.aqi <= 300,
    title: 'Heart Health Warning',
    message: 'Increased risk of heart palpitations and shortness of breath.',
    action: 'Avoid strenuous activities. Monitor blood pressure if hypertensive.',
    icon: Heart
  },
  {
    id: 'health-eye-irritation',
    category: 'Health',
    severity: 'Info',
    condition: (data) => data.aqi > 150,
    title: 'Eye Irritation Likely',
    message: 'Pollutants may cause burning sensation or watering eyes.',
    action: 'Wash eyes with clean water. Wear protective glasses.',
    icon: Droplets
  },
  {
    id: 'health-fatigue',
    category: 'Health',
    severity: 'Info',
    condition: (data) => data.aqi > 100 && data.aqi <= 150,
    title: 'General Fatigue',
    message: 'Poor air quality can lead to unexplained tiredness.',
    action: 'Stay hydrated and rest if you feel exhausted.',
    icon: Activity
  },

  // --- OUTDOOR ACTIVITY ALERTS ---
  {
    id: 'outdoor-no-exercise',
    category: 'Outdoor',
    severity: 'Critical',
    condition: (data) => data.aqi > 300,
    title: 'Avoid Outdoor Exercise',
    message: 'Intense exercise will increase intake of toxic pollutants.',
    action: 'Shift all workouts indoors. Do not jog or run outside.',
    icon: Activity
  },
  {
    id: 'outdoor-limit-exertion',
    category: 'Outdoor',
    severity: 'Warning',
    condition: (data) => data.aqi > 200 && data.aqi <= 300,
    title: 'Limit Outdoor Exertion',
    message: 'Reduce the intensity and duration of outdoor activities.',
    action: 'Take frequent breaks. Walk instead of running.',
    icon: Activity
  },
  {
    id: 'outdoor-morning-walk',
    category: 'Outdoor',
    severity: 'Info',
    condition: (data) => data.aqi > 150 && data.aqi <= 200,
    title: 'Reschedule Morning Walks',
    message: 'Pollution levels are often higher in the early morning.',
    action: 'Wait until the sun is up and smog clears before walking.',
    icon: ThermometerSun
  },
  {
    id: 'outdoor-good-conditions',
    category: 'Outdoor',
    severity: 'Info',
    condition: (data) => data.aqi <= 50,
    title: 'Great for Outdoors',
    message: 'Air quality is excellent. Perfect time for outdoor activities.',
    action: 'Enjoy a run, walk, or picnic outside!',
    icon: Bike
  },

  // --- VULNERABLE GROUP ALERTS ---
  {
    id: 'vuln-children-indoor',
    category: 'Vulnerable',
    severity: 'Critical',
    condition: (data) => data.aqi > 250,
    title: 'Keep Children Indoors',
    message: 'Children\'s developing lungs are highly susceptible to damage.',
    action: 'No outdoor play. Ensure schools keep windows closed.',
    icon: Baby
  },
  {
    id: 'vuln-elderly-care',
    category: 'Vulnerable',
    severity: 'Warning',
    condition: (data) => data.aqi > 180,
    title: 'Elderly Care Advisory',
    message: 'Seniors with existing conditions are at higher risk.',
    action: 'Check on elderly family members. Ensure they stay indoors.',
    icon: Heart
  },
  {
    id: 'vuln-pregnancy',
    category: 'Vulnerable',
    severity: 'Warning',
    condition: (data) => data.aqi > 200,
    title: 'Pregnancy Advisory',
    message: 'High pollution can affect fetal development.',
    action: 'Pregnant women should minimize exposure to outdoor air.',
    icon: Baby
  },
  {
    id: 'vuln-asthma',
    category: 'Vulnerable',
    severity: 'Critical',
    condition: (data) => data.aqi > 150, // Lower threshold for asthma
    title: 'Asthma Trigger Warning',
    message: 'Current levels can trigger severe asthma attacks.',
    action: 'Keep rescue inhalers immediately accessible.',
    icon: Wind
  },

  // --- INDOOR SAFETY ALERTS ---
  {
    id: 'indoor-purifier-max',
    category: 'Indoor',
    severity: 'Critical',
    condition: (data) => data.aqi > 350,
    title: 'Run Air Purifiers on Max',
    message: 'Indoor air quality will degrade without filtration.',
    action: 'Set HEPA purifiers to highest speed. Seal door gaps.',
    icon: Home
  },
  {
    id: 'indoor-ventilation-stop',
    category: 'Indoor',
    severity: 'Warning',
    condition: (data) => data.aqi > 200,
    title: 'Stop Natural Ventilation',
    message: 'Opening windows will let in more pollution than fresh air.',
    action: 'Keep all windows and doors tightly closed.',
    icon: DoorOpen
  },
  {
    id: 'indoor-ventilation-ok',
    category: 'Indoor',
    severity: 'Info',
    condition: (data) => data.aqi < 100,
    title: 'Safe to Ventilate',
    message: 'Outdoor air is relatively clean.',
    action: 'Open windows to circulate fresh air for 30 mins.',
    icon: Wind
  },
  {
    id: 'indoor-plants',
    category: 'Indoor',
    severity: 'Info',
    condition: (data) => data.aqi > 150 && data.aqi <= 250,
    title: 'Indoor Plants Help',
    message: 'Plants like Snake Plant and Areca Palm can help slightly.',
    action: 'Keep indoor plants dust-free for better efficiency.',
    icon: Leaf
  },

  // --- POLLUTION PREVENTION ALERTS ---
  {
    id: 'prev-carpool',
    category: 'Prevention',
    severity: 'Info',
    condition: (data) => data.aqi > 150,
    title: 'Carpool or Use Metro',
    message: 'Vehicular emissions are a major contributor today.',
    action: 'Avoid using personal cars. Take the metro or bus.',
    icon: Car
  },
  {
    id: 'prev-no-burn',
    category: 'Prevention',
    severity: 'Warning',
    condition: (data) => data.aqi > 200,
    title: 'Strict No-Burn Policy',
    message: 'Burning waste adds toxic smoke to already poor air.',
    action: 'Report any open waste burning to authorities immediately.',
    icon: ShieldAlert
  },
  {
    id: 'prev-dust-control',
    category: 'Prevention',
    severity: 'Info',
    condition: (data) => isDominant(data, 'PM10'),
    title: 'Control Dust',
    message: 'PM10 (dust) levels are high.',
    action: 'Sprinkle water on dry soil areas. Cover construction material.',
    icon: Factory
  },
  {
    id: 'prev-idling',
    category: 'Prevention',
    severity: 'Info',
    condition: (data) => data.aqi > 100,
    title: 'Stop Idling',
    message: 'Idling engines release unnecessary fumes.',
    action: 'Turn off your engine at red lights (Red Light On, Gaadi Off).',
    icon: Car
  },

  // --- IMPROVEMENT / RELIEF ALERTS ---
  {
    id: 'imp-better-tomorrow',
    category: 'Improvement',
    severity: 'Info',
    condition: (data) => false, // Placeholder: requires forecast data logic
    title: 'Relief Expected Tomorrow',
    message: 'Wind patterns suggest improved air quality tomorrow.',
    action: 'Plan your outdoor errands for tomorrow.',
    icon: ThermometerSun
  },
  {
    id: 'imp-rain-relief',
    category: 'Improvement',
    severity: 'Info',
    condition: (data) => false, // Placeholder: requires weather data
    title: 'Rain May Bring Relief',
    message: 'Expected rainfall will wash down particulate matter.',
    action: 'Enjoy the cleaner air after the rain stops.',
    icon: Droplets
  },
  {
    id: 'imp-wind-clearing',
    category: 'Improvement',
    severity: 'Info',
    condition: (data) => data.aqi < 100 && data.aqi > 50,
    title: 'Wind Clearing Smog',
    message: 'Breezy conditions are helping disperse pollutants.',
    action: 'Good time to ventilate your home briefly.',
    icon: Wind
  },
  
  // --- SPECIFIC POLLUTANT ALERTS ---
  {
    id: 'pol-ozone-high',
    category: 'Health',
    severity: 'Warning',
    condition: (data) => {
      const o3 = data.pollutants.find(p => p.name === 'O3');
      return !!(o3 && o3.value > 100);
    },
    title: 'High Ozone Levels',
    message: 'Ground-level ozone can trigger asthma and lung inflammation.',
    action: 'Limit outdoor activity in the afternoon when ozone is highest.',
    icon: ThermometerSun
  },
  {
    id: 'pol-no2-traffic',
    category: 'Health',
    severity: 'Warning',
    condition: (data) => {
      const no2 = data.pollutants.find(p => p.name === 'NO2');
      return !!(no2 && no2.value > 80);
    },
    title: 'High Traffic Fumes (NO₂)',
    message: 'Nitrogen Dioxide levels are elevated, likely from traffic.',
    action: 'Avoid walking or cycling near busy roads.',
    icon: Car
  }
];

export function getActiveAlerts(data: WardData): ActiveAlert[] {
  const alerts = ALERT_RULES.filter(rule => rule.condition(data));
  
  // Sort by severity: Critical > Warning > Info
  const severityWeight = { 'Critical': 3, 'Warning': 2, 'Info': 1 };
  
  return alerts.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity])
    .map(alert => ({
      ...alert,
      timestamp: new Date().toISOString()
    }));
}
