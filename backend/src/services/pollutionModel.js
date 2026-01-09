// backend/src/services/pollutionModel.js

// --- Constants (Indian CPCB Standards & WHO Guidelines) ---
const THRESHOLDS = {
    PM25: 60,
    PM10: 100,
    NO2: 80,
    SO2: 80,
    CO: 2, // mg/m³
    O3: 100 // 8-hour
};
  
const AQI_BREAKPOINTS = [
    { max: 50, category: "Good" },
    { max: 100, category: "Moderate" },
    { max: 200, category: "Poor" },
    { max: 300, category: "Very Poor" },
    { max: 400, category: "Severe" },
    { max: 500, category: "Hazardous" }
];
  
// --- Step 1: Data Cleaning & Validation ---
function cleanAndValidateData(raw) {
    const flags = [];
    let qualityScore = "High";
  
    const clean = (val, name) => {
      if (val === undefined || val === null) {
        flags.push(`Missing ${name}`);
        qualityScore = "Medium";
        return 0;
      }
      if (val < 0) {
        flags.push(`Negative ${name} capped to 0`);
        return 0;
      }
      if (name === "pm25" && val > 999) {
          flags.push(`Extreme ${name} capped`);
          qualityScore = "Low";
          return 999;
      }
      return val;
    };
  
    const cleaned = {
      pm25: clean(raw.pm25, "pm25"),
      pm10: clean(raw.pm10, "pm10"),
      no2: clean(raw.no2, "no2"),
      so2: clean(raw.so2, "so2"),
      co: clean(raw.co, "co"),
      o3: clean(raw.o3, "o3"),
      dataQualityScore: qualityScore,
      flags
    };
  
    if (cleaned.pm25 === 0 && cleaned.pm10 === 0) {
        cleaned.dataQualityScore = "Low";
        cleaned.flags.push("Critical PM data missing");
    }
  
    return cleaned;
}
  
// --- Step 2: Normalization ---
function normalizePollutants(data) {
    return {
      pm25: Math.min(data.pm25 / THRESHOLDS.PM25, 5),
      pm10: Math.min(data.pm10 / THRESHOLDS.PM10, 5),
      no2: Math.min(data.no2 / THRESHOLDS.NO2, 5),
      so2: Math.min(data.so2 / THRESHOLDS.SO2, 5)
    };
}
  
// --- Step 3: AQI Computation Engine ---
function computeAQI(data) {
    const getSubIndex = (val, standard) => (val / standard) * 100;
  
    const subIndices = [
      { name: "PM2.5", val: getSubIndex(data.pm25, THRESHOLDS.PM25) },
      { name: "PM10", val: getSubIndex(data.pm10, THRESHOLDS.PM10) },
      { name: "NO2", val: getSubIndex(data.no2, THRESHOLDS.NO2) },
      { name: "SO2", val: getSubIndex(data.so2, THRESHOLDS.SO2) }
    ];
  
    const max = subIndices.reduce((prev, curr) => prev.val > curr.val ? prev : curr);
    
    let aqi = Math.round(max.val);
    
    let category = "Hazardous";
    if (aqi <= 50) category = "Good";
    else if (aqi <= 100) category = "Moderate";
    else if (aqi <= 200) category = "Poor";
    else if (aqi <= 300) category = "Very Poor";
    else if (aqi <= 400) category = "Severe";
  
    return {
      aqi,
      category,
      dominantPollutant: max.name
    };
}
  
// --- Step 4: Source Inference Model (Rule-Based) ---
function inferDominantSource(data, normalized) {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 6;
    const isPeakTraffic = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
  
    const pmRatio = data.pm25 / (data.pm10 || 1);
  
    // Rule 1: Vehicular
    if (normalized.no2 > 1.5 || (normalized.pm25 > 1.5 && normalized.no2 > 0.8 && isPeakTraffic)) {
      return {
        dominantSource: "Vehicular Emissions",
        confidence: "High",
        reasoning: "Elevated NO₂ levels combined with PM2.5 spikes during peak traffic hours."
      };
    }
  
    // Rule 2: Dust
    if (normalized.pm10 > 1.5 && pmRatio < 0.5) {
      return {
        dominantSource: "Road Dust / Construction",
        confidence: "High",
        reasoning: "Dominance of coarse particles (PM10) suggests resuspended road dust or construction activity."
      };
    }
  
    // Rule 3: Waste / Biomass
    if (normalized.pm25 > 2.0 && pmRatio > 0.6 && isNight) {
      return {
        dominantSource: "Waste / Biomass Burning",
        confidence: "Medium",
        reasoning: "High concentration of fine particles (PM2.5) at night is characteristic of biomass or waste burning."
      };
    }
  
    // Rule 4: Industrial
    if (normalized.so2 > 1.0) {
      return {
        dominantSource: "Industrial Emissions",
        confidence: "High",
        reasoning: "Significant SO₂ levels indicate industrial fuel burning (coal/oil)."
      };
    }
  
    // Rule 5: Mixed
    if (normalized.pm25 > 1.0) {
      return {
        dominantSource: "Mixed Urban Activity",
        confidence: "Low",
        reasoning: "High PM2.5 levels without distinct chemical markers suggest mixed sources."
      };
    }
  
    return {
      dominantSource: "Background / Regional",
      confidence: "Low",
      reasoning: "Pollutant levels are within expected regional background ranges."
    };
}
  
// --- Step 5: Modeled Source Contribution ---
function estimateSourceContribution(inference) {
    let model = [
      { source: "Transport", percentage: 30, color: "#3B82F6" },
      { source: "Dust / Construction", percentage: 25, color: "#F59E0B" },
      { source: "Industry", percentage: 15, color: "#6366F1" },
      { source: "Waste / Biomass", percentage: 15, color: "#EF4444" },
      { source: "Others", percentage: 15, color: "#94A3B8" },
    ];
  
    const source = inference.dominantSource;
  
    if (source.includes("Vehicular")) {
      model[0].percentage += 25;
      model[1].percentage -= 10;
      model[3].percentage -= 10;
      model[4].percentage -= 5;
    } else if (source.includes("Dust") || source.includes("Construction")) {
      model[1].percentage += 30;
      model[0].percentage -= 10;
      model[3].percentage -= 10;
      model[4].percentage -= 10;
    } else if (source.includes("Industrial")) {
      model[2].percentage += 30;
      model[0].percentage -= 10;
      model[1].percentage -= 10;
      model[4].percentage -= 10;
    } else if (source.includes("Waste") || source.includes("Biomass")) {
      model[3].percentage += 25;
      model[0].percentage -= 10;
      model[1].percentage -= 10;
      model[4].percentage -= 5;
    }
  
    const total = model.reduce((sum, item) => sum + item.percentage, 0);
    return model.map(item => ({
      ...item,
      percentage: Math.round((item.percentage / total) * 100)
    }));
}
  
// --- Main Pipeline ---
function processPollutionData(raw) {
    const cleaned = cleanAndValidateData(raw);
    const normalized = normalizePollutants(cleaned);
    const aqi = computeAQI(cleaned);
    const inference = inferDominantSource(cleaned, normalized);
    const contribution = estimateSourceContribution(inference);
  
    return {
      cleaned,
      aqi,
      inference,
      contribution
    };
}

module.exports = {
    processPollutionData
};
