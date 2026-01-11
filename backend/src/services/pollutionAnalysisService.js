const WardDataPipeline = require('./wardDataPipeline');

class PollutionAnalysisService {
    constructor() {
        this.pipeline = new WardDataPipeline();
        
        // AQI Categories and thresholds
        this.AQI_CATEGORIES = {
            GOOD: { min: 0, max: 50, color: '#00E400', level: 'Good' },
            MODERATE: { min: 51, max: 100, color: '#FFFF00', level: 'Moderate' },
            UNHEALTHY_SENSITIVE: { min: 101, max: 150, color: '#FF7E00', level: 'Unhealthy for Sensitive Groups' },
            UNHEALTHY: { min: 151, max: 200, color: '#FF0000', level: 'Unhealthy' },
            VERY_UNHEALTHY: { min: 201, max: 300, color: '#8F3F97', level: 'Very Unhealthy' },
            HAZARDOUS: { min: 301, max: 500, color: '#7E0023', level: 'Hazardous' }
        };

        // Pollutant source weights (based on Delhi's pollution patterns)
        this.POLLUTION_SOURCES = {
            vehicular: { weight: 0.4, indicators: ['no2', 'co'] },
            industrial: { weight: 0.25, indicators: ['so2', 'pm10'] },
            construction: { weight: 0.15, indicators: ['pm10', 'pm25'] },
            biomass_burning: { weight: 0.1, indicators: ['pm25', 'co'] },
            road_dust: { weight: 0.1, indicators: ['pm10'] }
        };
    }

    // Get AQI category for a given AQI value
    getAQICategory(aqi) {
        if (!aqi) return null;
        
        for (const [key, category] of Object.entries(this.AQI_CATEGORIES)) {
            if (aqi >= category.min && aqi <= category.max) {
                return { ...category, category: key };
            }
        }
        return { ...this.AQI_CATEGORIES.HAZARDOUS, category: 'HAZARDOUS' };
    }

    // Analyze pollution sources based on pollutant levels
    analyzePollutionSources(wardData) {
        if (!wardData) return null;

        const sources = {};
        const pollutantLevels = {
            pm25: wardData.iaqi_pm25 || 0,
            pm10: wardData.iaqi_pm10 || 0,
            no2: wardData.iaqi_no2 || 0,
            o3: wardData.iaqi_o3 || 0,
            so2: wardData.iaqi_so2 || 0,
            co: wardData.iaqi_co || 0
        };

        // Calculate source contributions
        Object.entries(this.POLLUTION_SOURCES).forEach(([source, config]) => {
            let sourceScore = 0;
            let indicatorCount = 0;

            config.indicators.forEach(indicator => {
                if (pollutantLevels[indicator] > 0) {
                    sourceScore += pollutantLevels[indicator];
                    indicatorCount++;
                }
            });

            if (indicatorCount > 0) {
                sources[source] = {
                    contribution_percentage: Math.round((sourceScore / indicatorCount) * config.weight),
                    confidence: indicatorCount / config.indicators.length,
                    primary_pollutants: config.indicators.filter(ind => pollutantLevels[ind] > 50)
                };
            }
        });

        // Normalize percentages
        const totalContribution = Object.values(sources).reduce((sum, s) => sum + s.contribution_percentage, 0);
        if (totalContribution > 0) {
            Object.keys(sources).forEach(source => {
                sources[source].contribution_percentage = Math.round(
                    (sources[source].contribution_percentage / totalContribution) * 100
                );
            });
        }

        return sources;
    }

    // Generate health recommendations based on AQI and pollutants
    generateHealthRecommendations(wardData) {
        const aqi = wardData.aqi;
        const category = this.getAQICategory(aqi);
        const dominantPollutant = wardData.dominentpol;

        const recommendations = {
            general: [],
            sensitive_groups: [],
            outdoor_activities: 'allowed',
            mask_recommendation: 'not_required'
        };

        if (!category) return recommendations;

        switch (category.category) {
            case 'GOOD':
                recommendations.general.push('Air quality is satisfactory. Enjoy outdoor activities.');
                recommendations.outdoor_activities = 'recommended';
                break;

            case 'MODERATE':
                recommendations.general.push('Air quality is acceptable for most people.');
                recommendations.sensitive_groups.push('Unusually sensitive people should consider reducing prolonged outdoor exertion.');
                recommendations.outdoor_activities = 'allowed';
                break;

            case 'UNHEALTHY_SENSITIVE':
                recommendations.general.push('Reduce prolonged outdoor exertion.');
                recommendations.sensitive_groups.push('People with heart or lung disease, older adults, and children should avoid prolonged outdoor exertion.');
                recommendations.outdoor_activities = 'limited';
                recommendations.mask_recommendation = 'recommended_for_sensitive';
                break;

            case 'UNHEALTHY':
                recommendations.general.push('Avoid prolonged outdoor exertion. Consider wearing a mask outdoors.');
                recommendations.sensitive_groups.push('People with heart or lung disease, older adults, and children should avoid outdoor activities.');
                recommendations.outdoor_activities = 'avoid';
                recommendations.mask_recommendation = 'recommended';
                break;

            case 'VERY_UNHEALTHY':
                recommendations.general.push('Avoid outdoor activities. Wear N95 masks when going outside.');
                recommendations.sensitive_groups.push('Everyone should avoid outdoor activities.');
                recommendations.outdoor_activities = 'avoid';
                recommendations.mask_recommendation = 'required';
                break;

            case 'HAZARDOUS':
                recommendations.general.push('Stay indoors. Avoid all outdoor activities. Use air purifiers indoors.');
                recommendations.sensitive_groups.push('Everyone should remain indoors and keep activity levels low.');
                recommendations.outdoor_activities = 'prohibited';
                recommendations.mask_recommendation = 'required';
                break;
        }

        // Add pollutant-specific recommendations
        if (dominantPollutant === 'pm25') {
            recommendations.general.push('High PM2.5 levels detected. Use air purifiers and keep windows closed.');
        } else if (dominantPollutant === 'pm10') {
            recommendations.general.push('High PM10 levels detected. Avoid dusty areas and construction sites.');
        } else if (dominantPollutant === 'no2') {
            recommendations.general.push('High NO2 levels detected. Avoid busy roads and traffic areas.');
        }

        return recommendations;
    }

    // Predict optimal times for outdoor activities
    predictOptimalTimes(wardData) {
        if (!wardData.forecast_daily_pm25) return null;

        const forecast = wardData.forecast_daily_pm25;
        const optimalTimes = [];

        forecast.forEach(day => {
            const category = this.getAQICategory(day.avg);
            if (category && ['GOOD', 'MODERATE'].includes(category.category)) {
                optimalTimes.push({
                    date: day.day,
                    aqi_forecast: day.avg,
                    category: category.level,
                    recommendation: 'Good time for outdoor activities'
                });
            }
        });

        return {
            optimal_days: optimalTimes,
            best_day: optimalTimes.length > 0 ? optimalTimes[0] : null,
            total_good_days: optimalTimes.length
        };
    }

    // Generate GRAP (Graded Response Action Plan) recommendations
    generateGRAPRecommendations(wardData) {
        const aqi = wardData.aqi;
        let stage = 'Normal';
        const actions = [];

        if (aqi >= 201 && aqi <= 300) {
            stage = 'Stage I - Poor';
            actions.push('Mechanized sweeping and water sprinkling on roads');
            actions.push('Strict enforcement of dust control measures at construction sites');
            actions.push('Intensified parking fee in designated areas');
        } else if (aqi >= 301 && aqi <= 400) {
            stage = 'Stage II - Very Poor';
            actions.push('Stop use of coal and firewood in hotels, open eateries');
            actions.push('Enhance CNG/electric bus services');
            actions.push('Increase parking fees to discourage private vehicle use');
            actions.push('Close primary schools or shift to online classes');
        } else if (aqi >= 401 && aqi <= 450) {
            stage = 'Stage III - Severe';
            actions.push('Ban on non-essential construction activities');
            actions.push('Implement odd-even vehicle scheme');
            actions.push('Close all schools or shift to online mode');
            actions.push('Work from home for 50% of staff in government offices');
        } else if (aqi > 450) {
            stage = 'Stage IV - Severe Plus';
            actions.push('Ban on entry of trucks into Delhi (except essential goods)');
            actions.push('Ban on construction and demolition activities');
            actions.push('Consider closure of colleges and educational institutions');
            actions.push('Work from home for government employees');
        }

        return {
            stage,
            aqi_range: this.getAQICategory(aqi),
            recommended_actions: actions,
            emergency_level: aqi > 400 ? 'high' : aqi > 300 ? 'medium' : 'low'
        };
    }

    // Comprehensive ward analysis
    async analyzeWard(wardNumber) {
        const wardData = await this.pipeline.getWardData(wardNumber);
        if (!wardData) return null;

        const analysis = {
            ward_info: {
                ward_number: wardData.ward_number,
                ward_name: wardData.ward_name,
                zone: wardData.zone,
                last_updated: wardData.timestamp_ist_iso
            },
            current_status: {
                aqi: wardData.aqi,
                category: this.getAQICategory(wardData.aqi),
                dominant_pollutant: wardData.dominentpol,
                pollutant_levels: {
                    pm25: wardData.iaqi_pm25,
                    pm10: wardData.iaqi_pm10,
                    no2: wardData.iaqi_no2,
                    o3: wardData.iaqi_o3,
                    so2: wardData.iaqi_so2,
                    co: wardData.iaqi_co
                }
            },
            pollution_sources: this.analyzePollutionSources(wardData),
            health_recommendations: this.generateHealthRecommendations(wardData),
            optimal_times: this.predictOptimalTimes(wardData),
            grap_recommendations: this.generateGRAPRecommendations(wardData),
            trends: this.pipeline.analyzePollutionTrends(wardData),
            forecast_daily_pm25: wardData.forecast_daily_pm25 || [],
            forecast_daily_pm10: wardData.forecast_daily_pm10 || []
        };

        return analysis;
    }

    // Get hotspot analysis (worst performing wards)
    async getHotspotAnalysis(limit = 10) {
        const allWards = await this.pipeline.getAllWardsData();
        
        const hotspots = allWards
            .filter(ward => ward.aqi && ward.aqi > 0)
            .sort((a, b) => b.aqi - a.aqi)
            .slice(0, limit)
            .map(ward => ({
                ward_number: ward.ward_number,
                ward_name: ward.ward_name,
                zone: ward.zone,
                aqi: ward.aqi,
                category: this.getAQICategory(ward.aqi),
                dominant_pollutant: ward.dominentpol,
                severity_score: this.calculateSeverityScore(ward)
            }));

        return {
            hotspots,
            total_wards_analyzed: allWards.length,
            average_aqi: Math.round(allWards.reduce((sum, w) => sum + (w.aqi || 0), 0) / allWards.length),
            critical_wards: hotspots.filter(h => h.aqi > 300).length
        };
    }

    // Calculate severity score based on multiple factors
    calculateSeverityScore(wardData) {
        let score = 0;
        
        // AQI contribution (40%)
        score += (wardData.aqi || 0) * 0.4;
        
        // PM2.5 contribution (30%)
        score += (wardData.iaqi_pm25 || 0) * 0.3;
        
        // PM10 contribution (20%)
        score += (wardData.iaqi_pm10 || 0) * 0.2;
        
        // Other pollutants (10%)
        const otherPollutants = (wardData.iaqi_no2 || 0) + (wardData.iaqi_so2 || 0) + (wardData.iaqi_co || 0);
        score += otherPollutants * 0.1;
        
        return Math.round(score);
    }

    // Generate daily pollution report
    async generateDailyReport() {
        const zoneSummary = await this.pipeline.getZoneSummary();
        const hotspots = await this.getHotspotAnalysis(5);
        
        const report = {
            report_date: new Date().toISOString().split('T')[0],
            generated_at: new Date().toISOString(),
            city_overview: {
                total_zones: Object.keys(zoneSummary).length,
                total_wards: Object.values(zoneSummary).reduce((sum, zone) => sum + zone.ward_count, 0),
                city_avg_aqi: Math.round(Object.values(zoneSummary).reduce((sum, zone) => sum + zone.avg_aqi, 0) / Object.keys(zoneSummary).length),
                worst_zone: Object.values(zoneSummary).reduce((worst, zone) => zone.avg_aqi > worst.avg_aqi ? zone : worst),
                best_zone: Object.values(zoneSummary).reduce((best, zone) => zone.avg_aqi < best.avg_aqi ? zone : best)
            },
            zone_summary: zoneSummary,
            hotspots: hotspots.hotspots,
            recommendations: {
                immediate_actions: [],
                policy_suggestions: [],
                citizen_advisories: []
            }
        };

        // Add recommendations based on city average
        const cityAQI = report.city_overview.city_avg_aqi;
        if (cityAQI > 300) {
            report.recommendations.immediate_actions.push('Implement emergency pollution control measures');
            report.recommendations.citizen_advisories.push('Stay indoors and avoid all outdoor activities');
        } else if (cityAQI > 200) {
            report.recommendations.immediate_actions.push('Activate Stage II GRAP measures');
            report.recommendations.citizen_advisories.push('Limit outdoor activities and wear masks');
        }

        return report;
    }
}

module.exports = PollutionAnalysisService;