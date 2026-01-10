const cron = require('node-cron');
const WardDataPipeline = require('./wardDataPipeline');
const PollutionAnalysisService = require('./pollutionAnalysisService');

class DataSchedulerService {
    constructor() {
        this.pipeline = new WardDataPipeline();
        this.analysisService = new PollutionAnalysisService();
        this.isRunning = false;
        this.lastUpdate = null;
        this.scheduledTasks = new Map();
    }

    // Start the data pipeline scheduler
    start() {
        if (this.isRunning) {
            console.log('Data scheduler is already running');
            return;
        }

        console.log('Starting data scheduler service...');
        this.isRunning = true;

        // Schedule data updates every 30 minutes
        const dataUpdateTask = cron.schedule('*/30 * * * *', async () => {
            console.log('Running scheduled data update...');
            await this.updateAllData();
        }, {
            scheduled: false
        });

        // Schedule daily reports at 6 AM
        const dailyReportTask = cron.schedule('0 6 * * *', async () => {
            console.log('Generating daily pollution report...');
            await this.generateAndSaveDailyReport();
        }, {
            scheduled: false
        });

        // Schedule hourly zone summaries
        const hourlySummaryTask = cron.schedule('0 * * * *', async () => {
            console.log('Updating zone summaries...');
            await this.updateZoneSummaries();
        }, {
            scheduled: false
        });

        this.scheduledTasks.set('dataUpdate', dataUpdateTask);
        this.scheduledTasks.set('dailyReport', dailyReportTask);
        this.scheduledTasks.set('hourlySummary', hourlySummaryTask);

        // Start all tasks
        dataUpdateTask.start();
        dailyReportTask.start();
        hourlySummaryTask.start();

        console.log('Data scheduler started successfully');
    }

    // Stop the scheduler
    stop() {
        if (!this.isRunning) {
            console.log('Data scheduler is not running');
            return;
        }

        console.log('Stopping data scheduler service...');
        
        this.scheduledTasks.forEach((task, name) => {
            task.stop();
            console.log(`Stopped ${name} task`);
        });

        this.scheduledTasks.clear();
        this.isRunning = false;
        console.log('Data scheduler stopped');
    }

    // Update all ward data
    async updateAllData() {
        try {
            console.log('Starting data update process...');
            const startTime = Date.now();
            
            const results = await this.pipeline.processAllZones();
            
            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000);
            
            this.lastUpdate = new Date().toISOString();
            
            console.log(`Data update completed in ${duration} seconds. Updated ${results.length} wards.`);
            
            // Emit update event (if using EventEmitter)
            this.emit('dataUpdated', {
                timestamp: this.lastUpdate,
                wardsUpdated: results.length,
                duration: duration
            });

            return {
                success: true,
                wardsUpdated: results.length,
                duration: duration,
                timestamp: this.lastUpdate
            };

        } catch (error) {
            console.error('Error updating data:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Update zone summaries
    async updateZoneSummaries() {
        try {
            const zoneSummary = await this.pipeline.getZoneSummary();
            
            // Save zone summary to file for quick access
            const fs = require('fs').promises;
            const path = require('path');
            const summaryPath = path.join(__dirname, '../../../data-pipeline/zone_summary.json');
            
            await fs.writeFile(summaryPath, JSON.stringify({
                generated_at: new Date().toISOString(),
                zones: zoneSummary
            }, null, 2));

            console.log('Zone summaries updated successfully');
            return zoneSummary;

        } catch (error) {
            console.error('Error updating zone summaries:', error);
            throw error;
        }
    }

    // Generate and save daily report
    async generateAndSaveDailyReport() {
        try {
            const report = await this.analysisService.generateDailyReport();
            
            const fs = require('fs').promises;
            const path = require('path');
            const reportsDir = path.join(__dirname, '../../../data-pipeline/reports');
            
            // Ensure reports directory exists
            try {
                await fs.access(reportsDir);
            } catch {
                await fs.mkdir(reportsDir, { recursive: true });
            }

            const reportPath = path.join(reportsDir, `daily_report_${report.report_date}.json`);
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

            console.log(`Daily report saved: ${reportPath}`);
            return report;

        } catch (error) {
            console.error('Error generating daily report:', error);
            throw error;
        }
    }

    // Get scheduler status
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastUpdate: this.lastUpdate,
            activeTasks: Array.from(this.scheduledTasks.keys()),
            nextRuns: this.isRunning ? {
                dataUpdate: 'Every 30 minutes',
                dailyReport: 'Daily at 6:00 AM',
                hourlySummary: 'Every hour'
            } : null
        };
    }

    // Manual trigger for data update
    async triggerDataUpdate() {
        if (!this.isRunning) {
            throw new Error('Scheduler is not running. Start the scheduler first.');
        }

        console.log('Manual data update triggered...');
        return await this.updateAllData();
    }

    // Manual trigger for daily report
    async triggerDailyReport() {
        console.log('Manual daily report generation triggered...');
        return await this.generateAndSaveDailyReport();
    }

    // Get recent data update history
    async getUpdateHistory(limit = 10) {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const historyPath = path.join(__dirname, '../../../data-pipeline/update_history.json');
            
            try {
                const content = await fs.readFile(historyPath, 'utf-8');
                const history = JSON.parse(content);
                return history.slice(-limit);
            } catch {
                return [];
            }
        } catch (error) {
            console.error('Error getting update history:', error);
            return [];
        }
    }

    // Log update to history
    async logUpdate(updateResult) {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const historyPath = path.join(__dirname, '../../../data-pipeline/update_history.json');
            
            let history = [];
            try {
                const content = await fs.readFile(historyPath, 'utf-8');
                history = JSON.parse(content);
            } catch {
                // File doesn't exist, start with empty array
            }

            history.push(updateResult);
            
            // Keep only last 100 entries
            if (history.length > 100) {
                history = history.slice(-100);
            }

            await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
        } catch (error) {
            console.error('Error logging update:', error);
        }
    }

    // Health check for the scheduler
    async healthCheck() {
        const status = this.getStatus();
        const recentUpdates = await this.getUpdateHistory(5);
        
        return {
            scheduler: {
                status: status.isRunning ? 'running' : 'stopped',
                lastUpdate: status.lastUpdate,
                activeTasks: status.activeTasks.length
            },
            dataFreshness: {
                lastUpdate: status.lastUpdate,
                isStale: status.lastUpdate ? 
                    (Date.now() - new Date(status.lastUpdate).getTime()) > 2 * 60 * 60 * 1000 : true // 2 hours
            },
            recentActivity: recentUpdates.length,
            apiConnectivity: await this.testAPIConnectivity()
        };
    }

    // Test API connectivity
    async testAPIConnectivity() {
        try {
            const axios = require('axios');
            const testUrl = `https://api.waqi.info/feed/geo:28.6139;77.2090/?token=${process.env.WAQI_TOKEN || process.env.aqicn_api}`;
            
            const response = await axios.get(testUrl, { timeout: 10000 });
            return {
                status: response.data.status === 'ok' ? 'connected' : 'error',
                responseTime: response.headers['x-response-time'] || 'unknown'
            };
        } catch (error) {
            return {
                status: 'disconnected',
                error: error.message
            };
        }
    }
}

// Make it an EventEmitter for real-time updates
const EventEmitter = require('events');
class DataSchedulerServiceWithEvents extends EventEmitter {
    constructor() {
        super();
        Object.assign(this, new DataSchedulerService());
    }
}

module.exports = DataSchedulerServiceWithEvents;