const fs = require('fs').promises;
const path = require('path');

// Path to ward_data directory relative to this file
// backend/src/services -> ../../../data-pipeline/ward_data
const WARD_DATA_DIR = path.join(__dirname, '../../../data-pipeline/ward_data');

/**
 * Reads all ward data files and returns a list of basic ward info.
 */
exports.getAllWards = async () => {
    try {
        const files = await fs.readdir(WARD_DATA_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        const wards = await Promise.all(jsonFiles.map(async (file) => {
            const filePath = path.join(WARD_DATA_DIR, file);
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            // Data is an array with one object based on the sample saw
            const ward = data[0];

            return {
                wardId: ward.WardNumber,
                wardName: ward.WardName,
                zone: ward.Zone
            };
        }));

        // Sort by Ward ID
        return wards.sort((a, b) => a.wardId - b.wardId);
    } catch (error) {
        console.error("Error reading ward files:", error);
        throw new Error("Failed to fetch ward list");
    }
};

/**
 * Reads a specific ward file and returns full details plus simulated API.
 */
exports.getWardDetails = async (wardNumber) => {
    try {
        const fileName = `ward_${wardNumber}.json`;
        const filePath = path.join(WARD_DATA_DIR, fileName);

        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        const ward = data[0];

        // Simulate pollution data (random for now as per requirements)
        // In a real app, this would query the pollution database/service
        const pollution = {
            aqi: Math.floor(Math.random() * (400 - 50) + 50), // Random AQI 50-400
            pm25: Math.floor(Math.random() * (250 - 20) + 20),
            updatedAt: new Date().toISOString()
        };

        return {
            ...ward,
            pollution
        };
    } catch (error) {
        console.error(`Error reading ward ${wardNumber}:`, error);
        if (error.code === 'ENOENT') {
            return null;
        }
        throw new Error("Failed to fetch ward details");
    }
};
