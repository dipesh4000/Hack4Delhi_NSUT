const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/env');

class WardDataPipeline {
    constructor() {
        this.API_KEY = config.WAQI_TOKEN || process.env.WAQI_TOKEN || process.env.aqicn_api;
        this.BASE_URL = "https://api.waqi.info/feed/@{uid}/?token={token}";
        this.CSV_PATH = path.join(__dirname, '../../../data-pipeline/dynamic_ward_data/Ward_monitoring.csv');
        this.OUTPUT_DIR = path.join(__dirname, '../../../data-pipeline/dynamic_ward_data');
        
        if (!this.API_KEY) {
            throw new Error("WAQI API key not found in environment variables");
        }
    }

    // Convert WAQI time block to IST-aware datetime
    normalizeToIST(timeBlock) {
        if (!timeBlock) return null;

        // Prefer ISO timestamp (already tz-aware)
        if (timeBlock.iso) {
            const dt = new Date(timeBlock.iso);
            return {
                iso: dt.toISOString(),
                epoch: Math.floor(dt.getTime() / 1000),
                date: dt.toISOString().split('T')[0],
                time: dt.toTimeString().split(' ')[0]
            };
        }

        // Fallback: Unix timestamp
        if (timeBlock.v) {
            const dt = new Date(timeBlock.v * 1000);
            return {
                iso: dt.toISOString(),
                epoch: timeBlock.v,
                date: dt.toISOString().split('T')[0],
                time: dt.toTimeString().split(' ')[0]
            };
        }

        return null;
    }

    // Load CSV data
    async loadCSVData() {
        try {
            const csvContent = await fs.readFile(this.CSV_PATH, 'utf-8');
            const lines = csvContent.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                if (values.length >= headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index];
                    });
                    data.push(row);
                }
            }
            return data;
        } catch (error) {
            console.error('Error loading CSV data:', error);
            throw error;
        }
    }

    // Fetch and process data for a specific zone
    async processZone(zoneName) {
        console.log(`Processing zone: ${zoneName}`);
        
        const csvData = await this.loadCSVData();
        const zoneData = csvData.filter(row => 
            row.Zone && row.Zone.toLowerCase() === zoneName.toLowerCase()
        );

        if (zoneData.length === 0) {
            throw new Error(`No wards found for zone: ${zoneName}`);
        }

        const results = [];
        
        for (const row of zoneData) {
            const uid = parseInt(row.UID);
            const wardName = row.WardName;
            const wardNum = row.WardNum;

            if (!uid || !wardName || !wardNum) continue;

            const url = this.BASE_URL.replace('{uid}', uid).replace('{token}', this.API_KEY);

            try {
                console.log(`Fetching data for ward ${wardNum}...`);
                const response = await axios.get(url, { timeout: 15000 });
                const data = response.data;

                if (data.status !== 'ok') {
                    console.log(`API returned non-ok for ward ${wardNum}`);
                    continue;
                }

                const d = data.data;
                const timeBlock = d.time || {};
                const istTime = this.normalizeToIST(timeBlock);

                const wardOutput = {
                    zone: zoneName,
                    ward_number: wardNum,
                    ward_name: wardName,
                    station_uid: uid,
                    generated_at_ist: new Date().toISOString(),

                    // Core AQI
                    aqi: d.aqi,
                    idx: d.idx,
                    dominentpol: d.dominentpol,

                    // City
                    city_name: d.city?.name,
                    city_geo: d.city?.geo,
                    city_url: d.city?.url,

                    // IAQI (Individual Air Quality Index)
                    iaqi_pm25: d.iaqi?.pm25?.v,
                    iaqi_pm10: d.iaqi?.pm10?.v,
                    iaqi_no2: d.iaqi?.no2?.v,
                    iaqi_o3: d.iaqi?.o3?.v,
                    iaqi_so2: d.iaqi?.so2?.v,
                    iaqi_co: d.iaqi?.co?.v,

                    // Normalized IST timestamps
                    timestamp_ist_iso: istTime?.iso,
                    timestamp_ist_epoch: istTime?.epoch,
                    reading_date_ist: istTime?.date,
                    reading_time_ist: istTime?.time,

                    // Raw time (for audit/debug)
                    time_raw: timeBlock,

                    // Forecasts
                    forecast_daily_pm25: d.forecast?.daily?.pm25,
                    forecast_daily_pm10: d.forecast?.daily?.pm10,
                    forecast_daily_uvi: d.forecast?.daily?.uvi
                };

                // Save individual ward file
                const outputPath = path.join(this.OUTPUT_DIR, `ward_${wardNum}.json`);
                await fs.writeFile(outputPath, JSON.stringify(wardOutput, null, 4));
                
                results.push(wardOutput);
                console.log(`Saved ward ${wardNum}`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`Error for ward ${wardNum}:`, error.message);
            }
        }

        console.log(`Zone completed: ${zoneName} (${results.length} wards processed)`);
        return results;
    }

    // Process all zones
    async processAllZones() {
        const zones = [
            "Central Zone",
            "City S.P.Zone", 
            "Civil Line",
            "Karolbagh",
            "Keshavpuram",
            "Najafgarh Zone",
            "Narela"
        ];

        const allResults = [];
        
        for (const zone of zones) {
            try {
                const zoneResults = await this.processZone(zone);
                allResults.push(...zoneResults);
            } catch (error) {
                console.error(`Failed to process zone ${zone}:`, error.message);
            }
        }

        return allResults;
    }

    // Get latest data for a specific ward
    async getWardData(wardNumber) {
        try {
            const filePath = path.join(this.OUTPUT_DIR, `ward_${wardNumber}.json`);
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Error reading ward ${wardNumber} data:`, error);
            return null;
        }
    }

    // Get all wards data
    async getAllWardsData() {
        try {
            const files = await fs.readdir(this.OUTPUT_DIR);
            const wardFiles = files.filter(file => file.startsWith('ward_') && file.endsWith('.json'));
            
            const allWards = [];
            for (const file of wardFiles) {
                try {
                    const content = await fs.readFile(path.join(this.OUTPUT_DIR, file), 'utf-8');
                    const wardData = JSON.parse(content);
                    allWards.push(wardData);
                } catch (error) {
                    console.error(`Error reading ${file}:`, error);
                }
            }

            return allWards.sort((a, b) => parseInt(a.ward_number) - parseInt(b.ward_number));
        } catch (error) {
            console.error('Error getting all wards data:', error);
            return [];
        }
    }

    // Analyze pollution trends
    analyzePollutionTrends(wardData) {
        if (!wardData || !wardData.forecast_daily_pm25) return null;

        const pm25Forecast = wardData.forecast_daily_pm25;
        const trend = {
            current_aqi: wardData.aqi,
            dominant_pollutant: wardData.dominentpol,
            trend_direction: 'stable',
            avg_forecast: 0,
            peak_day: null,
            improvement_expected: false
        };

        if (pm25Forecast.length > 0) {
            const avgForecast = pm25Forecast.reduce((sum, day) => sum + day.avg, 0) / pm25Forecast.length;
            trend.avg_forecast = Math.round(avgForecast);

            // Find peak day
            const peakDay = pm25Forecast.reduce((max, day) => day.avg > max.avg ? day : max);
            trend.peak_day = peakDay;

            // Determine trend direction
            if (avgForecast > wardData.aqi * 1.1) {
                trend.trend_direction = 'worsening';
            } else if (avgForecast < wardData.aqi * 0.9) {
                trend.trend_direction = 'improving';
                trend.improvement_expected = true;
            }
        }

        return trend;
    }

    // Get zone-wise summary
    async getZoneSummary() {
        const allWards = await this.getAllWardsData();
        const zoneSummary = {};

        allWards.forEach(ward => {
            if (!zoneSummary[ward.zone]) {
                zoneSummary[ward.zone] = {
                    zone_name: ward.zone,
                    ward_count: 0,
                    avg_aqi: 0,
                    max_aqi: 0,
                    min_aqi: Infinity,
                    dominant_pollutants: {},
                    wards: []
                };
            }

            const zone = zoneSummary[ward.zone];
            zone.ward_count++;
            zone.wards.push({
                ward_number: ward.ward_number,
                ward_name: ward.ward_name,
                aqi: ward.aqi,
                dominant_pollutant: ward.dominentpol
            });

            if (ward.aqi) {
                zone.max_aqi = Math.max(zone.max_aqi, ward.aqi);
                zone.min_aqi = Math.min(zone.min_aqi, ward.aqi);
                
                // Track dominant pollutants
                if (ward.dominentpol) {
                    zone.dominant_pollutants[ward.dominentpol] = 
                        (zone.dominant_pollutants[ward.dominentpol] || 0) + 1;
                }
            }
        });

        // Calculate averages
        Object.values(zoneSummary).forEach(zone => {
            const validAQIs = zone.wards.filter(w => w.aqi).map(w => w.aqi);
            zone.avg_aqi = validAQIs.length > 0 ? 
                Math.round(validAQIs.reduce((sum, aqi) => sum + aqi, 0) / validAQIs.length) : 0;
            
            if (zone.min_aqi === Infinity) zone.min_aqi = 0;
        });

        return zoneSummary;
    }
}

module.exports = WardDataPipeline;