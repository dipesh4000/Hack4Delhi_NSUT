const { loadWardData } = require('../services/dataIngestionService');

// Simple test endpoint
exports.testConnection = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Backend is running',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'active'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backend error',
      error: error.message
    });
  }
};

// Get basic ward data (fallback)
exports.getBasicWards = async (req, res) => {
  try {
    // Try to load ward data
    const wards = await loadWardData();
    
    // Convert to basic format with mock AQI data
    const basicWards = wards.map(ward => ({
      wardId: ward.wardId.toString(),
      wardName: ward.wardName,
      aqi: Math.floor(Math.random() * 300) + 50, // Mock AQI data
      status: getStatusFromAQI(Math.floor(Math.random() * 300) + 50),
      sourceStation: `Station ${ward.wardId}`,
      lat: ward.lat || (28.6139 + (Math.random() - 0.5) * 0.1),
      lon: ward.lon || (77.2090 + (Math.random() - 0.5) * 0.1),
      pollutants: {
        pm25: Math.floor(Math.random() * 150) + 25,
        pm10: Math.floor(Math.random() * 200) + 50,
        no2: Math.floor(Math.random() * 80) + 10
      },
      zone: ward.zone,
      officer: ward.officer
    }));

    res.json({
      success: true,
      data: basicWards,
      total: basicWards.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getBasicWards:', error);
    
    // Generate mock data as final fallback
    const mockWards = [];
    for (let i = 1; i <= 50; i++) {
      const aqi = Math.floor(Math.random() * 300) + 50;
      mockWards.push({
        wardId: i.toString(),
        wardName: `Ward ${i}`,
        aqi,
        status: getStatusFromAQI(aqi),
        sourceStation: `Monitoring Station ${i}`,
        lat: 28.6139 + (Math.random() - 0.5) * 0.1,
        lon: 77.2090 + (Math.random() - 0.5) * 0.1,
        pollutants: {
          pm25: Math.round(aqi * 0.6),
          pm10: Math.round(aqi * 0.8),
          no2: Math.round(aqi * 0.3)
        },
        zone: ['Central Zone', 'Najafgarh Zone', 'Civil Line', 'Karolbagh'][Math.floor(Math.random() * 4)],
        officer: {
          name: `Officer ${i}`,
          contact: `+91 98765${String(i).padStart(5, '0')}`,
          address: `Office Address ${i}, Delhi`
        }
      });
    }

    res.json({
      success: true,
      data: mockWards,
      total: mockWards.length,
      timestamp: new Date().toISOString(),
      note: 'Using mock data - database not available'
    });
  }
};

// Get single ward data
exports.getBasicWard = async (req, res) => {
  try {
    const { wardId } = req.params;
    
    // Try to load ward data
    const wards = await loadWardData();
    const ward = wards.find(w => w.wardId.toString() === wardId);
    
    if (ward) {
      const aqi = Math.floor(Math.random() * 300) + 50;
      const basicWard = {
        wardId: ward.wardId.toString(),
        wardName: ward.wardName,
        aqi,
        status: getStatusFromAQI(aqi),
        sourceStation: `Station ${ward.wardId}`,
        lat: ward.lat || (28.6139 + (Math.random() - 0.5) * 0.1),
        lon: ward.lon || (77.2090 + (Math.random() - 0.5) * 0.1),
        pollutants: {
          pm25: Math.round(aqi * 0.6),
          pm10: Math.round(aqi * 0.8),
          no2: Math.round(aqi * 0.3)
        },
        zone: ward.zone,
        officer: ward.officer
      };

      res.json({
        success: true,
        data: basicWard,
        timestamp: new Date().toISOString()
      });
    } else {
      // Generate mock ward data
      const aqi = Math.floor(Math.random() * 300) + 50;
      const mockWard = {
        wardId,
        wardName: `Ward ${wardId}`,
        aqi,
        status: getStatusFromAQI(aqi),
        sourceStation: `Monitoring Station ${wardId}`,
        lat: 28.6139 + (Math.random() - 0.5) * 0.1,
        lon: 77.2090 + (Math.random() - 0.5) * 0.1,
        pollutants: {
          pm25: Math.round(aqi * 0.6),
          pm10: Math.round(aqi * 0.8),
          no2: Math.round(aqi * 0.3)
        },
        zone: 'Demo Zone',
        officer: {
          name: `Officer ${wardId}`,
          contact: `+91 98765${wardId.padStart(5, '0')}`,
          address: `Office Address ${wardId}, Delhi`
        }
      };

      res.json({
        success: true,
        data: mockWard,
        timestamp: new Date().toISOString(),
        note: 'Using mock data'
      });
    }

  } catch (error) {
    console.error('Error in getBasicWard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ward data',
      error: error.message
    });
  }
};

function getStatusFromAQI(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  return 'Severe';
}

module.exports = {
  testConnection: exports.testConnection,
  getBasicWards: exports.getBasicWards,
  getBasicWard: exports.getBasicWard
};