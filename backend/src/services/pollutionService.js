const axios = require('axios');
const PollutionSnapshot = require('../models/PollutionSnapshot');

// Mock Wards for Delhi (Normally this would come from a DB or GeoJSON)
const DELHI_WARDS = [
    { id: 'DEL001', name: 'Connaught Place', lat: 28.6304, lon: 77.2177 },
    { id: 'DEL002', name: 'Dwarka Sector 10', lat: 28.5823, lon: 77.0500 },
    { id: 'DEL003', name: 'Rohini Sector 16', lat: 28.7382, lon: 77.1167 },
    { id: 'DEL004', name: 'Okhla Phase III', lat: 28.5447, lon: 77.2662 },
    { id: 'DEL005', name: 'Punjabi Bagh', lat: 28.6692, lon: 77.1278 },
    { id: 'DEL006', name: 'Anand Vihar', lat: 28.6508, lon: 77.3152 },
    { id: 'DEL007', name: 'Mandir Marg', lat: 28.6326, lon: 77.2023 }
];

// Helper: Haversine Distance
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Helper: Calculate AQI (Simplified)
function calculateAQI(pm25) {
    if (!pm25) return 0;
    if (pm25 <= 12) return 50;
    if (pm25 <= 35.4) return 100;
    if (pm25 <= 55.4) return 150;
    if (pm25 <= 150.4) return 200;
    if (pm25 <= 250.4) return 300;
    return 400;
}

function getStatus(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    return 'Severe';
}

exports.updatePollutionData = async () => {
    console.log('Fetching OpenAQ data...');
    try {
        // OpenAQ v3
        const response = await axios.get('https://api.openaq.org/v3/locations', {
            params: {
                bbox: '76.84,28.40,77.34,28.88', // Delhi Bounding Box
                limit: 100
            }
        });

        const stations = response.data.results;

        // Process each ward
        const snapshots = DELHI_WARDS.map(ward => {
            // Find nearest station
            let nearest = null;
            let minDis = Infinity;

            stations.forEach(station => {
                if (!station.coordinates) return;
                const dist = getDistance(ward.lat, ward.lon, station.coordinates.latitude, station.coordinates.longitude);
                if (dist < minDis) {
                    minDis = dist;
                    nearest = station;
                }
            });

            // Default values if no station near (fallback)
            const pm25 = nearest?.sensors?.find(s => s.parameter.name === 'pm25')?.value || Math.floor(Math.random() * 300); // Fallback for demo if API limits
            const aqi = calculateAQI(pm25);

            return {
                wardId: ward.id,
                wardName: ward.name,
                lat: ward.lat,
                lon: ward.lon,
                aqi: aqi,
                pollutants: { pm25, pm10: 0, no2: 0 },
                status: getStatus(aqi),
                sourceStation: nearest?.name || 'Simulation',
                isReliable: minDis < 10, // Reliable only if station is within 10km
                timestamp: new Date()
            };
        });

        // Save to DB
        await PollutionSnapshot.insertMany(snapshots);
        console.log(`Updated pollution data for ${snapshots.length} wards.`);
        return snapshots;

    } catch (error) {
        console.error('Failed to update pollution data:', error.message);
        return [];
    }
};

exports.getLatestPollution = async () => {
    // Get latest snapshot for each ward
    const latest = await PollutionSnapshot.aggregate([
        { $sort: { timestamp: -1 } },
        {
            $group: {
                _id: "$wardId",
                doc: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$doc" } }
    ]);

    if (latest.length === 0) {
        // If DB empty, trigger an update immediately
        return await exports.updatePollutionData();
    }
    return latest;
};
