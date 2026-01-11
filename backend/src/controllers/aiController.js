const axios = require('axios');

const LYZR_CONFIG = {
  API_URL: 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
  API_KEY: 'sk-default-EiUxVZWVhWT0SRuI7bHOK4oKm7oUoNzD',
  AGENT_ID: '696369a3d09b5523633492f9',
  USER_ID: 'devanshparti@gmail.com'
};

class AIController {
  async chatWithAgent(req, res) {
    try {
      const { message, sessionId, context } = req.body;

      if (!message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Message is required' 
        });
      }

      const requestData = {
        user_id: LYZR_CONFIG.USER_ID,
        agent_id: LYZR_CONFIG.AGENT_ID,
        session_id: sessionId || `${LYZR_CONFIG.AGENT_ID}-${Date.now()}`,
        message: message
      };

      const response = await axios.post(LYZR_CONFIG.API_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LYZR_CONFIG.API_KEY
        }
      });

      res.json({
        success: true,
        data: {
          response: response.data.response || response.data.message || response.data,
          sessionId: requestData.session_id
        }
      });

    } catch (error) {
      console.error('AI Agent Error:', error.response?.data || error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get AI response',
        error: error.response?.data || error.message
      });
    }
  }

  async getHealthAdvisory(req, res) {
    try {
      const { aqi, wardId } = req.body;
      
      const message = `HEALTH_ADVISORY AQI ${aqi} Ward ${wardId}`;
      
      const requestData = {
        user_id: LYZR_CONFIG.USER_ID,
        agent_id: LYZR_CONFIG.AGENT_ID,
        session_id: `health-${Date.now()}`,
        message: message
      };

      const response = await axios.post(LYZR_CONFIG.API_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LYZR_CONFIG.API_KEY
        }
      });

      res.json({
        success: true,
        advisory: response.data.response || response.data.message || response.data
      });

    } catch (error) {
      console.error('Health Advisory Error:', error.response?.data || error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get health advisory'
      });
    }
  }

  async getGovtAction(req, res) {
    try {
      const { aqi, wardId, pollutionLevel } = req.body;
      
      const message = `GOVT_ACTION AQI ${aqi} Ward ${wardId} Level ${pollutionLevel}`;
      
      const requestData = {
        user_id: LYZR_CONFIG.USER_ID,
        agent_id: LYZR_CONFIG.AGENT_ID,
        session_id: `govt-${Date.now()}`,
        message: message
      };

      const response = await axios.post(LYZR_CONFIG.API_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LYZR_CONFIG.API_KEY
        }
      });

      res.json({
        success: true,
        action: response.data.response || response.data.message || response.data
      });

    } catch (error) {
      console.error('Govt Action Error:', error.response?.data || error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get government action'
      });
    }
  }
}

module.exports = new AIController();