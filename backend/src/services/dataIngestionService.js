const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const wardCoordinates = require('../data/wardCoordinates');
const { createReadStream } = require('fs');

const WARD_DATA_DIR = path.join(__dirname, '../../../data-pipeline/ward_data');
const CSV_DATA_PATH = path.join(__dirname, '../../../data-pipeline/raw_data/zone_data.csv');

// In-memory cache
let wardsCache = null;

// Helper to read CSV
const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

exports.loadWardData = async () => {
    if (wardsCache) return wardsCache;

    console.log("Loading ward data...");
    try {
        // 1. Load all JSON files
        const files = await fs.readdir(WARD_DATA_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        const jsonWards = await Promise.all(jsonFiles.map(async (file) => {
            const content = await fs.readFile(path.join(WARD_DATA_DIR, file), 'utf8');
            const data = JSON.parse(content);
            return data[0]; // Each file is an array with 1 object
        }));

        // 2. Load CSV data (for enrichment/fallback)
        const csvWards = await readCSV(CSV_DATA_PATH);
        const csvMap = new Map(csvWards.map(w => [parseInt(w.WardNumber), w]));

        // 3. Merge and Normalize
        const mergedWards = jsonWards.map(ward => {
            const wardNum = parseInt(ward.WardNumber);
            const csvData = csvMap.get(wardNum) || {};
            const coords = wardCoordinates[wardNum] || { lat: 0, lon: 0 }; // Fallback to 0,0

            return {
                wardId: wardNum,
                wardName: ward.WardName || csvData.WardName || `Ward ${wardNum}`,
                zone: ward.Zone || csvData.Zone || 'Unknown',

                // Officer Details (Prefer JSON, fallback to CSV)
                officer: {
                    name: ward.officer_name || csvData.officer_name || 'N/A',
                    contact: ward.off_contact || csvData.Contact || 'N/A',
                    email: ward.off_email || csvData.Email || 'N/A', // Assuming Email col exist or is mapped
                    designation: ward.deg_name || csvData.deg_name || 'N/A',
                    address: ward.dep_add || csvData.dep_add || 'N/A'
                },

                // Location
                lat: coords.lat,
                lon: coords.lon
            };
        });

        // Sort by ID
        wardsCache = mergedWards.sort((a, b) => a.wardId - b.wardId);
        console.log(`Successfully loaded ${wardsCache.length} wards.`);
        return wardsCache;

    } catch (error) {
        console.error("Failed to load ward data:", error);
        throw error;
    }
};

exports.getWardById = async (id) => {
    const wards = await exports.loadWardData();
    return wards.find(w => w.wardId === parseInt(id));
};
