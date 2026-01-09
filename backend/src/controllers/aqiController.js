const { fetchWAQIData } = require('../services/waqiService');
const { processPollutionData } = require('../services/pollutionModel');

// Helper to determine severity status
function getSeverity(value, type) {
    // Simple thresholds for demo
    if (type === 'pm25') {
        if (value <= 30) return "Good";
        if (value <= 60) return "Moderate";
        if (value <= 90) return "Poor";
        return "Severe";
    }
    // Default fallback
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 200) return "Poor";
    return "Severe";
}

exports.getAQI = async (req, res) => {
    try {
        const { lat, lon, keyword } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }

        // 1. Fetch Raw Data
        const waqiData = await fetchWAQIData(lat, lon, keyword);

        if (!waqiData) {
            return res.status(502).json({ error: "Failed to fetch data from sensor network" });
        }

        const iaqi = waqiData.iaqi;

        // 2. Process via Scientific Pipeline
        const rawData = {
            pm25: iaqi.pm25?.v,
            pm10: iaqi.pm10?.v,
            no2: iaqi.no2?.v,
            so2: iaqi.so2?.v,
            co: iaqi.co?.v,
            o3: iaqi.o3?.v,
            timestamp: Date.now()
        };

        const processed = processPollutionData(rawData);

        // 3. Format Response
        const pollutants = [
            {
                name: "PM2.5",
                value: processed.cleaned.pm25,
                unit: "µg/m³",
                status: getSeverity(processed.cleaned.pm25, 'pm25'),
                description: "Fine particles that can penetrate deep into lungs.",
            },
            {
                name: "PM10",
                value: processed.cleaned.pm10,
                unit: "µg/m³",
                status: getSeverity(processed.cleaned.pm10, 'pm10'),
                description: "Coarse particles from dust and construction.",
            },
            {
                name: "NO₂",
                value: processed.cleaned.no2,
                unit: "µg/m³",
                status: getSeverity(processed.cleaned.no2, 'no2'),
                description: "Gas from burning fuel, mainly from cars.",
            },
            {
                name: "SO₂",
                value: processed.cleaned.so2,
                unit: "µg/m³",
                status: getSeverity(processed.cleaned.so2, 'so2'),
                description: "Gas from industrial burning of coal/oil.",
            },
        ];

        // Generate Forecast (Mock/Heuristic for now)
        const sourceForecast = Array.from({ length: 4 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            
            const base = processed.contribution;
            return {
                date: dateStr,
                Transport: Math.max(10, base.find(x => x.source === "Transport").percentage + (Math.random() * 10 - 5)),
                "Dust / Construction": Math.max(10, base.find(x => x.source === "Dust / Construction").percentage + (Math.random() * 10 - 5)),
                Industry: Math.max(5, base.find(x => x.source === "Industry").percentage + (Math.random() * 5 - 2)),
                "Waste / Biomass": Math.max(5, base.find(x => x.source === "Waste / Biomass").percentage + (Math.random() * 5 - 2)),
                Others: Math.max(5, base.find(x => x.source === "Others").percentage),
            };
        });

        // Generate Hourly Trend (Mock/Heuristic)
        const hourlyTrend = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = i === 6 ? "Today" : d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
            const variance = Math.floor(Math.random() * 50) + 20;
            const historicAQI = i === 6 ? processed.aqi.aqi : Math.max(50, processed.aqi.aqi - variance - (Math.random() * 30 * (6 - i)));
            return { time: dateStr, aqi: Math.round(historicAQI) };
        });

        const response = {
            id: `waqi-${waqiData.idx}`,
            name: waqiData.city.name,
            aqi: processed.aqi.aqi,
            lastUpdated: "Live from Sensor",
            dominantSource: processed.inference.dominantSource,
            sourceConfidence: processed.inference.confidence,
            sourceReasoning: processed.inference.reasoning,
            pollutants: pollutants,
            sourceContribution: processed.contribution,
            sourceForecast: sourceForecast,
            alerts: [],
            hourlyTrend: hourlyTrend,
            pollutantComposition: pollutants.map(p => ({
                name: p.name,
                value: p.value,
                color: p.status === "Severe" ? "#EF4444" : p.status === "Poor" ? "#F97316" : "#EAB308"
            })),
            dailyActions: {
                dos: [{ text: "Wear a mask", impact: "High Impact" }],
                avoids: [{ text: "Outdoor exercise", impact: "High Impact" }]
            },
            contextualAdvice: processed.aqi.aqi > 300 ? "Air is hazardous. Stay indoors." : "Air quality is acceptable.",
            coordinates: {
                lat: waqiData.city.geo[0],
                lon: waqiData.city.geo[1]
            }
        };

        res.json(response);

    } catch (error) {
        console.error("AQI Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
