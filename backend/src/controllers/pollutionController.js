const PollutionAnalysisService = require('../services/pollutionAnalysisService');
const WardDataPipeline = require('../services/wardDataPipeline');
const DataSchedulerService = require('../services/dataSchedulerService');

class PollutionController {
    constructor() {
        this.analysisService = new PollutionAnalysisService();
        this.pipeline = new WardDataPipeline();
        this.scheduler = new DataSchedulerService();
    }

    // Get comprehensive ward analysis
    async getWardAnalysis(req, res) {
        try {
            const { wardNumber } = req.params;
            
            if (!wardNumber || isNaN(wardNumber)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid ward number is required'
                });
            }

            const analysis = await this.analysisService.analyzeWard(parseInt(wardNumber));
            
            if (!analysis) {
                return res.status(404).json({
                    success: false,
                    message: `No data found for ward ${wardNumber}`
                });
            }

            res.json({
                success: true,
                data: analysis
            });

        } catch (error) {
            console.error('Error in getWardAnalysis:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get pollution hotspots
    async getHotspots(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const hotspots = await this.analysisService.getHotspotAnalysis(limit);

            res.json({
                success: true,
                data: hotspots
            });

        } catch (error) {
            console.error('Error in getHotspots:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get zone-wise summary
    async getZoneSummary(req, res) {
        try {
            const zoneSummary = await this.pipeline.getZoneSummary();

            res.json({
                success: true,
                data: zoneSummary
            });

        } catch (error) {
            console.error('Error in getZoneSummary:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get daily pollution report
    async getDailyReport(req, res) {
        try {
            const report = await this.analysisService.generateDailyReport();

            res.json({
                success: true,
                data: report
            });

        } catch (error) {
            console.error('Error in getDailyReport:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all wards data with optional filtering
    async getAllWards(req, res) {
        try {
            const { zone, minAqi, maxAqi, pollutant } = req.query;
            let wards = await this.pipeline.getAllWardsData();

            // Apply filters
            if (zone) {
                wards = wards.filter(ward => 
                    ward.zone.toLowerCase().includes(zone.toLowerCase())
                );
            }

            if (minAqi) {
                wards = wards.filter(ward => ward.aqi >= parseInt(minAqi));
            }

            if (maxAqi) {
                wards = wards.filter(ward => ward.aqi <= parseInt(maxAqi));
            }

            if (pollutant) {
                wards = wards.filter(ward => 
                    ward.dominentpol === pollutant.toLowerCase()
                );
            }

            res.json({
                success: true,
                data: {
                    wards,
                    total: wards.length,
                    filters_applied: { zone, minAqi, maxAqi, pollutant }
                }
            });

        } catch (error) {
            console.error('Error in getAllWards:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get pollution trends for a ward
    async getWardTrends(req, res) {
        try {
            const { wardNumber } = req.params;
            const wardData = await this.pipeline.getWardData(parseInt(wardNumber));
            
            if (!wardData) {
                return res.status(404).json({
                    success: false,
                    message: `No data found for ward ${wardNumber}`
                });
            }

            const trends = this.pipeline.analyzePollutionTrends(wardData);
            const optimalTimes = this.analysisService.predictOptimalTimes(wardData);

            res.json({
                success: true,
                data: {
                    ward_number: wardNumber,
                    trends,
                    optimal_times: optimalTimes,
                    forecast: {
                        pm25: wardData.forecast_daily_pm25,
                        pm10: wardData.forecast_daily_pm10,
                        uvi: wardData.forecast_daily_uvi
                    }
                }
            });

        } catch (error) {
            console.error('Error in getWardTrends:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get health recommendations for a ward
    async getHealthRecommendations(req, res) {
        try {
            const { wardNumber } = req.params;
            const wardData = await this.pipeline.getWardData(parseInt(wardNumber));
            
            if (!wardData) {
                return res.status(404).json({
                    success: false,
                    message: `No data found for ward ${wardNumber}`
                });
            }

            const recommendations = this.analysisService.generateHealthRecommendations(wardData);
            const grapRecommendations = this.analysisService.generateGRAPRecommendations(wardData);

            res.json({
                success: true,
                data: {
                    ward_number: wardNumber,
                    current_aqi: wardData.aqi,
                    health_recommendations: recommendations,
                    grap_recommendations: grapRecommendations
                }
            });

        } catch (error) {
            console.error('Error in getHealthRecommendations:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get pollution sources analysis
    async getPollutionSources(req, res) {
        try {
            const { wardNumber } = req.params;
            const wardData = await this.pipeline.getWardData(parseInt(wardNumber));
            
            if (!wardData) {
                return res.status(404).json({
                    success: false,
                    message: `No data found for ward ${wardNumber}`
                });
            }

            const sources = this.analysisService.analyzePollutionSources(wardData);

            res.json({
                success: true,
                data: {
                    ward_number: wardNumber,
                    ward_name: wardData.ward_name,
                    current_aqi: wardData.aqi,
                    dominant_pollutant: wardData.dominentpol,
                    pollution_sources: sources,
                    pollutant_levels: {
                        pm25: wardData.iaqi_pm25,
                        pm10: wardData.iaqi_pm10,
                        no2: wardData.iaqi_no2,
                        o3: wardData.iaqi_o3,
                        so2: wardData.iaqi_so2,
                        co: wardData.iaqi_co
                    }
                }
            });

        } catch (error) {
            console.error('Error in getPollutionSources:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Trigger manual data update
    async triggerDataUpdate(req, res) {
        try {
            const result = await this.scheduler.triggerDataUpdate();

            res.json({
                success: true,
                message: 'Data update triggered successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in triggerDataUpdate:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to trigger data update',
                error: error.message
            });
        }
    }

    // Get system health status
    async getSystemHealth(req, res) {
        try {
            const health = await this.scheduler.healthCheck();

            res.json({
                success: true,
                data: health
            });

        } catch (error) {
            console.error('Error in getSystemHealth:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get comparative analysis between wards
    async getComparativeAnalysis(req, res) {
        try {
            const { wardNumbers } = req.body;
            
            if (!wardNumbers || !Array.isArray(wardNumbers) || wardNumbers.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'At least 2 ward numbers are required for comparison'
                });
            }

            const comparisons = [];
            
            for (const wardNumber of wardNumbers) {
                const analysis = await this.analysisService.analyzeWard(parseInt(wardNumber));
                if (analysis) {
                    comparisons.push(analysis);
                }
            }

            if (comparisons.length < 2) {
                return res.status(404).json({
                    success: false,
                    message: 'Insufficient data for comparison'
                });
            }

            // Generate comparison insights
            const insights = {
                best_ward: comparisons.reduce((best, current) => 
                    current.current_status.aqi < best.current_status.aqi ? current : best
                ),
                worst_ward: comparisons.reduce((worst, current) => 
                    current.current_status.aqi > worst.current_status.aqi ? current : worst
                ),
                average_aqi: Math.round(
                    comparisons.reduce((sum, ward) => sum + ward.current_status.aqi, 0) / comparisons.length
                ),
                common_pollutants: this.findCommonPollutants(comparisons)
            };

            res.json({
                success: true,
                data: {
                    comparisons,
                    insights,
                    total_wards_compared: comparisons.length
                }
            });

        } catch (error) {
            console.error('Error in getComparativeAnalysis:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Helper method to find common pollutants
    findCommonPollutants(comparisons) {
        const pollutantCounts = {};
        
        comparisons.forEach(ward => {
            if (ward.current_status.dominant_pollutant) {
                pollutantCounts[ward.current_status.dominant_pollutant] = 
                    (pollutantCounts[ward.current_status.dominant_pollutant] || 0) + 1;
            }
        });

        return Object.entries(pollutantCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([pollutant, count]) => ({
                pollutant,
                frequency: count,
                percentage: Math.round((count / comparisons.length) * 100)
            }));
    }
}

module.exports = new PollutionController();