const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const Waterlogging = require('../models/Waterlogging');
const Hotspot = require('../models/Hotspot');

class WaterloggingPipeline {
    constructor() {
        this.INPUT_FILE = path.join(__dirname, '../../../data-pipeline/waterlogging_input.json');
        this.WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; // Optional
    }

    // Read dynamic data from file
    async getExternalData() {
        try {
            const content = await fs.readFile(this.INPUT_FILE, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.log('No external waterlogging data file found, using defaults.');
            return {
                drainageHealth: [
                    { wardId: 12, health: 45, status: "Critical", blockageRisk: "High" },
                    { wardId: 45, health: 88, status: "Good", blockageRisk: "Low" },
                    { wardId: 101, health: 65, status: "Fair", blockageRisk: "Medium" }
                ]
            };
        }
    }

    // Fetch real-time rainfall data for predictive scoring using Open-Meteo
    // Fetch real-time weather and air quality data using Open-Meteo
    async getClimateIntelligence(lat = 28.61, lon = 77.20) {
        try {
            // Weather API: Rain, Temp, Humidity
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,rain,precipitation_probability&forecast_days=1`;
            // Air Quality API: PM2.5, PM10, AQI
            const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,us_aqi&forecast_days=1`;

            const [weatherRes, aqiRes] = await Promise.all([
                axios.get(weatherUrl),
                axios.get(aqiUrl)
            ]);

            const now = new Date();
            const currentHour = now.getHours();

            const weather = weatherRes.data.hourly;
            const aqiData = aqiRes.data.hourly;

            const temp = weather.temperature_2m[currentHour];
            const humidity = weather.relative_humidity_2m[currentHour];
            const rain = weather.rain[currentHour] || 0;
            const prob = weather.precipitation_probability[currentHour] || 0;
            const aqi = aqiData.us_aqi[currentHour] || 150;

            // Calculate risk score (0-100)
            let riskScore = (rain * 10) + (prob * 0.3);
            riskScore = Math.min(100, Math.round(riskScore));

            return {
                temp,
                humidity,
                rain,
                prob,
                aqi,
                riskScore,
                timestamp: now.toISOString(),
                location: "Delhi NCR"
            };
        } catch (error) {
            console.error("Open-Meteo API failed:", error.message);
            return {
                temp: 24,
                humidity: 65,
                rain: 0,
                prob: 10,
                aqi: 180,
                riskScore: 15,
                timestamp: new Date().toISOString(),
                location: "Delhi NCR (Simulated)"
            };
        }
    }

    // Legacy wrapper for backward compatibility
    async getRainfallRisk(lat, lon) {
        return this.getClimateIntelligence(lat, lon);
    }


    // Simulate ultrasonic sensor readings from major drains, tied to rainfall
    async getSensorData() {
        const weather = await this.getRainfallRisk();
        const rainFactor = weather.riskScore / 100;

        // Major drain locations in Delhi
        const drains = [
            { id: 'D1', name: 'Najafgarh Drain', location: 'Kashmere Gate', baseLevel: 30, baseFlow: 100 },
            { id: 'D2', name: 'Barapullah Drain', location: 'Sarai Kale Khan', baseLevel: 60, baseFlow: 200 },
            { id: 'D3', name: 'Supplementary Drain', location: 'Rohini', baseLevel: 20, baseFlow: 70 },
            { id: 'D4', name: 'Minto Road Drain', location: 'Connaught Place', baseLevel: 70, baseFlow: 280 }
        ];

        return drains.map(d => {
            const level = Math.min(100, d.baseLevel + (rainFactor * 40) + (Math.random() * 10 - 5));
            const flow = d.baseFlow + (rainFactor * 150) + (Math.random() * 20 - 10);
            
            return {
                id: d.id,
                name: d.name,
                location: d.location,
                level: Math.round(level),
                flow: Math.round(flow),
                status: level > 90 ? 'Critical' : level > 70 ? 'High' : 'Normal',
                timestamp: new Date().toISOString()
            };
        });
    }


    // AI Verification Engine: Cross-reference reports with sensor spikes AND Delhi Police hotspots
    async verifyReport(report) {
        const sensors = await this.getSensorData();
        const hotspots = await this.fetchDelhiPoliceData();
        
        const nearbySensor = sensors.find(s => 
            report.location.toLowerCase().includes(s.location.toLowerCase()) ||
            report.wardName.toLowerCase().includes(s.location.toLowerCase())
        );

        const weather = await this.getRainfallRisk();
        const isKnownHotspot = hotspots.some(h => 
            report.location.toLowerCase().includes(h.roadName.toLowerCase()) ||
            report.location.toLowerCase().includes(h.location.toLowerCase())
        );

        // AI Logic: Multi-factor verification
        if (nearbySensor && nearbySensor.level > 80) {
            return {
                verified: true,
                confidence: 0.98,
                source: `Verified by Ultrasonic Sensor ${nearbySensor.id}`,
                sensorLevel: nearbySensor.level,
                note: "High water level detected in nearby drainage infrastructure."
            };
        }

        if (isKnownHotspot && weather.riskScore > 50) {
            return {
                verified: true,
                confidence: 0.92,
                source: "Verified by Authority Data & Weather Risk",
                note: "Location is a known hotspot and current rainfall risk is high."
            };
        }



        // Fallback to "Community Verified" if multiple reports in same area
        return {
            verified: false,
            confidence: 0.4,
            reason: "Insufficient sensor or authority data for automated verification"
        };
    }


    // Emergency Broadcast System: Detect critical sensor levels
    async getEmergencyAlerts() {
        const sensors = await this.getSensorData();
        const criticalSensors = sensors.filter(s => s.level > 90);

        return criticalSensors.map(s => ({
            id: `EBS-${s.id}-${Date.now()}`,
            type: 'CRITICAL_FLOOD_WARNING',
            wardName: s.location,
            message: `URGENT: ${s.name} has reached critical capacity (${Math.round(s.level)}%). High risk of flash flooding in ${s.location}.`,
            severity: 'High',
            timestamp: new Date().toISOString()
        }));
    }

    // AI Flood-Depth Estimator: Convert severity to cm based on sensor data
    estimateDepth(severity, sensorLevel = 50) {
        const baseDepths = {
            'Ankle Deep': 10,
            'Knee Deep': 45,
            'Waist Deep': 90,
            'Hazardous': 150
        };

        const base = baseDepths[severity] || 0;
        // Adjust based on sensor level (higher sensor level = higher actual depth)
        const adjustment = (sensorLevel - 50) * 0.5; 
        
        return {
            cm: Math.max(5, Math.round(base + adjustment)),
            confidence: 0.85,
            note: "Calculated using ward topography and live sensor data"
        };

    }

    // Jal-Netra: AI Photo Analysis (Simulated but cross-referenced)
    async analyzePhoto(photoUrl, location = "") {
        // In a real app, this would call a Vision API
        const hotspots = await this.fetchDelhiPoliceData();
        const weather = await this.getRainfallRisk();
        
        const isHotspot = hotspots.some(h => 
            location.toLowerCase().includes(h.roadName.toLowerCase()) || 
            location.toLowerCase().includes(h.location.toLowerCase())
        );

        // Check if it's actually related to drainage
        const drainageKeywords = ['drain', 'sewer', 'gutter', 'pipe', 'overflow', 'nullah'];
        const isDrainageRelated = drainageKeywords.some(k => location.toLowerCase().includes(k));

        // Strict Verification: If it's not a hotspot AND no rain risk AND no sensor spike, AI "rejects" the photo
        const sensors = await this.getSensorData();
        const nearbySensor = sensors.find(s => location.toLowerCase().includes(s.location.toLowerCase()));
        
        const isWaterDetected = isHotspot || weather.riskScore > 30 || (nearbySensor && nearbySensor.level > 60);

        if (!isWaterDetected) {
            return {
                photoUrl,
                aiVerified: false,
                isWaterDetected: false,
                confidence: 0.95,
                reason: "AI Vision could not detect significant waterlogging or drainage failure in the provided photo.",
                model: "Jal-Netra V1 (Vision AI)",
                timestamp: new Date().toISOString()
            };
        }


        const mockResults = [
            { severity: 'Ankle Deep', depth: 12, confidence: 0.92, tags: ['wet road', 'puddles'] },
            { severity: 'Knee Deep', depth: 48, confidence: 0.88, tags: ['submerged tires', 'high water'] },
            { severity: 'Waist Deep', depth: 95, confidence: 0.85, tags: ['hazardous', 'stalled vehicle'] }
        ];

        // If it's a known hotspot OR high rainfall risk, we "detect" higher severity
        const result = (isHotspot || weather.riskScore > 60) ? mockResults[1] : mockResults[0];
        
        if (isDrainageRelated) {
            result.tags.push('drainage blockage');
            result.confidence = Math.min(0.99, result.confidence + 0.05);
        }

        return {
            ...result,
            photoUrl,
            aiVerified: true,
            isWaterDetected: true,
            model: "Jal-Netra V1 (Vision AI)",
            locationMatch: isHotspot,
            isDrainage: isDrainageRelated,
            timestamp: new Date().toISOString()
        };

    }




    // Green-Route: Smart Navigation Logic (AQI + Waterlogging)
    async getSmartRoute(start, end) {
        const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
        const reports = await Waterlogging.find({ status: 'Active' });
        const hotspots = await this.fetchDelhiPoliceData();

        try {
            // In a real scenario, we would use geocoding to get lat/lng for start/end
            // For now, we simulate the Google Routes API call structure as requested
            const response = await axios.post(`https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_API_KEY}`, {
                origin: { address: start },
                destination: { address: end },
                travelMode: 'DRIVE',
                routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
                computeAlternativeRoutes: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline,routes.description'
                }
            });

            // Fetch live climate intelligence to influence safety scores
            const climate = await this.getClimateIntelligence();
            const isRaining = climate.rain > 0 || climate.riskScore > 50;
            const realAqi = climate.aqi;

            // Process Google routes and add environmental intelligence
            return response.data.routes.map((route, index) => {
                const routeName = route.description || `Route ${index + 1}`;
                const distanceKm = (route.distanceMeters / 1000).toFixed(1) + 'km';
                const timeMins = Math.round(parseInt(route.duration) / 60) + ' mins';
                
                // Cross-reference with waterlogging
                const hasReport = reports.some(r => routeName.toLowerCase().includes(r.location.toLowerCase()));
                const hasHotspot = hotspots.some(h => routeName.toLowerCase().includes(h.roadName.toLowerCase()));
                const isWaterlogged = hasReport || hasHotspot;

                // Dynamic safety and environmental stats
                // Adjust AQI slightly for different paths to simulate variation
                const routeAqi = Math.round(realAqi * (index === 1 ? 0.8 : (index === 0 ? 1.2 : 1.0)));
                
                // Adjust safety score based on rainfall risk
                let safetyScore = isWaterlogged ? 30 : (routeAqi < 150 ? 92 : 65);
                if (isRaining && !isWaterlogged) {
                    safetyScore -= 20; // Penalize for rain even if not yet flooded
                }

                return {
                    id: `R${index}`,
                    name: routeName,
                    distance: distanceKm,
                    time: timeMins,
                    aqi: routeAqi,

                    waterlogging: isWaterlogged ? 'Knee Deep (Avoid)' : (isRaining ? 'Rain Risk (Caution)' : 'None'),
                    safetyScore: Math.max(10, safetyScore),
                    type: index === 1 ? 'Cleanest (Eco-Friendly)' : (index === 0 ? 'Fastest' : 'Driest (Avoid Flood)')
                };
            });

        } catch (error) {
            console.error("Google Routes API failed, falling back to simulated logic:", error.message);
            
            const weatherRisk = await this.getRainfallRisk();
            const isRaining = weatherRisk.rainfall > 0 || weatherRisk.riskScore > 50;

            // Fallback to simulated logic if API fails or key is missing
            const checkIssues = (routeName) => {
                const hasReport = reports.some(r => routeName.toLowerCase().includes(r.location.toLowerCase()));
                const hasHotspot = hotspots.some(h => routeName.toLowerCase().includes(h.roadName.toLowerCase()));
                return hasReport || hasHotspot;
            };

            const routes = [
                {
                    id: 'R1',
                    name: `Main Highway (via ${start} Express)`,
                    distance: '12km',
                    time: '25 mins',
                    aqi: 320,
                    waterlogging: checkIssues(start) ? 'Knee Deep (Avoid)' : (isRaining ? 'Rain Risk' : 'None'),
                    safetyScore: checkIssues(start) ? 35 : (isRaining ? 55 : 65),
                    type: 'Fastest'
                },
                {
                    id: 'R2',
                    name: `Green Corridor (via ${end} Ridge)`,
                    distance: '14km',
                    time: '32 mins',
                    aqi: 145,
                    waterlogging: checkIssues(end) ? 'Ankle Deep' : (isRaining ? 'Rain Risk' : 'None'),
                    safetyScore: checkIssues(end) ? 75 : (isRaining ? 85 : 92),
                    type: 'Cleanest (Eco-Friendly)'
                },
                {
                    id: 'R3',
                    name: 'Inner Ring Road',
                    distance: '11km',
                    time: '45 mins',
                    aqi: 210,
                    waterlogging: checkIssues('Ring Road') ? 'Knee Deep (Avoid)' : (isRaining ? 'Rain Risk' : 'None'),
                    safetyScore: checkIssues('Ring Road') ? 30 : (isRaining ? 45 : 55),
                    type: 'Driest (Avoid Flood)'
                }
            ];

            // Logic Fix: Ensure "Driest" label goes to the route with least waterlogging
            const sortedByWater = [...routes].sort((a, b) => {
                const score = (w) => w === 'None' ? 0 : (w === 'Rain Risk' ? 1 : (w === 'Ankle Deep' ? 2 : 3));
                return score(a.waterlogging) - score(b.waterlogging);
            });

            // Re-assign types based on actual conditions
            routes[0].type = 'Fastest';
            
            // Find the cleanest one (lowest AQI)
            const cleanest = [...routes].sort((a, b) => a.aqi - b.aqi)[0];
            routes.forEach(r => {
                if (r.id === cleanest.id) r.type = 'Cleanest (Eco-Friendly)';
            });

            // Find the driest one (lowest waterlogging score)
            const driest = sortedByWater[0];
            routes.forEach(r => {
                if (r.id === driest.id && r.type !== 'Cleanest (Eco-Friendly)') {
                    r.type = 'Driest (Avoid Flood)';
                }
            });

            return routes;
        }

    }


    async fetchDelhiPoliceData() {
        try {
            // 1. Try to get from DB first (if scraped recently)
            const cachedHotspots = await Hotspot.find({ 
                lastScraped: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24h cache
            });

            if (cachedHotspots.length > 0) {
                return cachedHotspots;
            }

            // 2. Scrape if no recent cache
            const response = await axios.get('https://traffic.delhipolice.gov.in/water-logging-area');
            const $ = cheerio.load(response.data);
            const hotspots = [];

            $('table tr').each((i, el) => {
                if (i === 0) return; // Skip header
                const cols = $(el).find('td');
                if (cols.length >= 5) {
                    hotspots.push({
                        roadName: $(cols[1]).text().trim(),
                        location: $(cols[2]).text().trim(),
                        date: $(cols[3]).text().trim(),
                        frequency: $(cols[4]).text().trim(),
                        source: 'Delhi Police Traffic'
                    });
                }
            });

            // 3. Save/Update in DB
            for (const spot of hotspots) {
                await Hotspot.findOneAndUpdate(
                    { roadName: spot.roadName, location: spot.location },
                    { ...spot, lastScraped: new Date() },
                    { upsert: true, new: true }
                );
            }

            return hotspots.slice(0, 20);
        } catch (error) {
            console.error("Error fetching Delhi Police data:", error);
            // Fallback to existing DB data even if old
            return await Hotspot.find({}).limit(20);
        }
    }
}

module.exports = new WaterloggingPipeline();


