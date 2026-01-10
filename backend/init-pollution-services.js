const WardDataPipeline = require('./src/services/wardDataPipeline');
const PollutionAnalysisService = require('./src/services/pollutionAnalysisService');
const DataSchedulerService = require('./src/services/dataSchedulerService');

async function initializePollutionServices() {
    console.log('🚀 Initializing Pollution Data Services...\n');

    try {
        // Test API connectivity
        console.log('1. Testing WAQI API connectivity...');
        const pipeline = new WardDataPipeline();
        
        // Test with a single ward first
        console.log('2. Testing data fetch for a sample ward...');
        const sampleResult = await pipeline.processZone('Central Zone');
        console.log(`✅ Successfully processed ${sampleResult.length} wards from Central Zone\n`);

        // Test analysis service
        console.log('3. Testing pollution analysis service...');
        const analysisService = new PollutionAnalysisService();
        
        if (sampleResult.length > 0) {
            const sampleWardNumber = sampleResult[0].ward_number;
            const analysis = await analysisService.analyzeWard(parseInt(sampleWardNumber));
            console.log(`✅ Successfully analyzed ward ${sampleWardNumber}`);
            console.log(`   AQI: ${analysis.current_status.aqi}`);
            console.log(`   Category: ${analysis.current_status.category.level}`);
            console.log(`   Dominant Pollutant: ${analysis.current_status.dominant_pollutant}\n`);
        }

        // Test zone summary
        console.log('4. Testing zone summary generation...');
        const zoneSummary = await pipeline.getZoneSummary();
        console.log(`✅ Generated summary for ${Object.keys(zoneSummary).length} zones\n`);

        // Test scheduler (without starting it)
        console.log('5. Testing scheduler service...');
        const scheduler = new DataSchedulerService();
        const health = await scheduler.healthCheck();
        console.log(`✅ Scheduler health check completed`);
        console.log(`   API Status: ${health.apiConnectivity.status}\n`);

        console.log('🎉 All services initialized successfully!');
        console.log('\n📋 Next Steps:');
        console.log('1. Start your backend server: npm run dev');
        console.log('2. Test the API endpoints:');
        console.log('   - GET /api/pollution/zones/summary');
        console.log('   - GET /api/pollution/hotspots');
        console.log('   - GET /api/pollution/ward/123/analysis');
        console.log('3. Integrate with your frontend components');
        console.log('4. Set up automated scheduling in production\n');

    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your WAQI_TOKEN in .env file');
        console.log('2. Ensure internet connectivity');
        console.log('3. Verify CSV data files exist in data-pipeline folder');
        console.log('4. Check API rate limits\n');
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializePollutionServices();
}

module.exports = { initializePollutionServices };