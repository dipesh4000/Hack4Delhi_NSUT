const ingestionService = require('../services/dataIngestionService');
const pollutionService = require('../services/pollutionService');

exports.getDashboardData = async (req, res) => {
    try {
        const wards = await ingestionService.loadWardData();
        const pollutionMap = await pollutionService.getAllPollution();

        // Enrich wards with pollution data
        const enrichedWards = wards.map(ward => {
            const pollution = pollutionMap.get(ward.wardId);
            return {
                ...ward,
                aqi: pollution?.aqi || 0,
                status: pollution?.status || 'Unknown',
                sourceStation: pollution?.source || 'N/A',
                pollutants: {
                    pm25: pollution?.pm25 || 0,
                    pm10: pollution?.pm10 || 0,
                    no2: pollution?.no2 || 0
                }
            };
        });

        // Calculate Stats
        const avgAqi = enrichedWards.reduce((acc, curr) => acc + curr.aqi, 0) / enrichedWards.length;
        const criticalWards = enrichedWards.filter(w => w.aqi > 300).length;

        // Sort for rankings (worst first)
        enrichedWards.sort((a, b) => b.aqi - a.aqi);

        res.json({
            success: true,
            data: enrichedWards,
            stats: {
                avgAqi: Math.round(avgAqi),
                criticalWards,
                totalWards: enrichedWards.length
            }
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
