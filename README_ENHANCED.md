# Enhanced Ward-Wise Pollution Action Dashboard

A comprehensive real-time pollution monitoring and action system for Delhi's 250 wards, featuring advanced analytics, health recommendations, and policy guidance.

## 🌟 New Features Added

### Real-Time Data Integration
- **Live AQI Data**: Fetches real-time data from WAQI API every 30 minutes
- **Comprehensive Pollutant Analysis**: PM2.5, PM10, NO2, O3, SO2, CO levels
- **Forecast Integration**: 7-day pollution forecasts with trend analysis
- **Automated Scheduling**: Background data updates with health monitoring

### Advanced Analytics
- **AI-Powered Source Analysis**: Identifies pollution sources (vehicular, industrial, construction, etc.)
- **Health Risk Assessment**: Personalized recommendations for general population and sensitive groups
- **GRAP Integration**: Automated Graded Response Action Plan recommendations
- **Trend Analysis**: Pollution pattern recognition and improvement predictions

### Enhanced Dashboards

#### Citizen Dashboard
- **Personal Health Advisor**: Real-time mask recommendations and outdoor activity guidance
- **Pollution Source Insights**: Understanding what's causing pollution in your area
- **Optimal Time Predictions**: Best times for outdoor activities
- **Emergency Alerts**: Automatic notifications for hazardous conditions

#### Authority Dashboard
- **Command Center**: Real-time monitoring of all 250 wards
- **Hotspot Detection**: AI-powered identification of critical pollution areas
- **Policy Recommendations**: Automated GRAP stage determination and actions
- **Zone-wise Analytics**: Comprehensive analysis by administrative zones
- **Daily Reports**: Automated generation of pollution status reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (optional, for user management)
- WAQI API Token ([Get here](https://aqicn.org/data-platform/token/))

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd Hack4Delhi_NSUT
   node setup.js
   ```

2. **Configure Environment**
   ```bash
   # Backend configuration
   cd backend
   cp .env.example .env
   # Edit .env and add your WAQI_TOKEN
   
   # Frontend configuration  
   cd ../frontend
   cp .env.local.example .env.local
   ```

3. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

4. **Access Dashboards**
   - Citizen Dashboard: http://localhost:3000/citizen
   - Authority Dashboard: http://localhost:3000/authority
   - Ward Details: http://localhost:3000/citizen/ward/[wardId]

## 📊 API Endpoints

### Core Pollution Data
```bash
# Get comprehensive ward analysis
GET /api/pollution/ward/:wardNumber/analysis

# Get pollution trends and forecasts
GET /api/pollution/ward/:wardNumber/trends

# Get health recommendations
GET /api/pollution/ward/:wardNumber/health

# Get pollution source analysis
GET /api/pollution/ward/:wardNumber/sources
```

### City-wide Analytics
```bash
# Get zone-wise summary
GET /api/pollution/zones/summary

# Get pollution hotspots
GET /api/pollution/hotspots?limit=10

# Get daily pollution report
GET /api/pollution/report/daily

# Get all wards with filtering
GET /api/pollution/wards?zone=Central&minAqi=100
```

### System Management
```bash
# Trigger manual data update
POST /api/pollution/update

# Check system health
GET /api/pollution/health

# Compare multiple wards
POST /api/pollution/compare
```

## 🏗️ Architecture

### Backend Services
- **WardDataPipeline**: Core data fetching and processing
- **PollutionAnalysisService**: Advanced analytics and insights
- **DataSchedulerService**: Automated updates and monitoring
- **PollutionController**: RESTful API endpoints

### Frontend Components
- **EnhancedLiveDashboard**: Real-time citizen dashboard
- **EnhancedAuthorityDashboard**: Command center for authorities
- **WardDetailsPage**: Comprehensive ward analysis

### Data Flow
```
WAQI API → Data Pipeline → Analysis Engine → Dashboard
    ↓           ↓              ↓             ↓
Real-time   Processing    AI Insights   User Interface
```

## 🎯 Use Cases

### For Citizens
- **Daily Planning**: Check air quality before outdoor activities
- **Health Protection**: Get personalized mask and activity recommendations
- **Awareness**: Understand pollution sources in your area
- **Future Planning**: See forecast for upcoming days

### For Authorities
- **Emergency Response**: Identify and respond to pollution hotspots
- **Policy Implementation**: Automated GRAP stage recommendations
- **Resource Allocation**: Prioritize actions based on severity scores
- **Public Communication**: Generate reports for citizen advisories

### For Researchers
- **Data Analysis**: Access comprehensive pollution datasets
- **Trend Studies**: Historical and predictive analytics
- **Source Attribution**: Understand pollution source patterns
- **Health Impact**: Correlate pollution with health recommendations

## 📈 Data Sources

### Primary Data
- **WAQI API**: Real-time AQI and pollutant data
- **Government Stations**: Official monitoring stations
- **Forecast Models**: 7-day pollution predictions

### Enhanced Analytics
- **AI Source Analysis**: Machine learning-based source identification
- **Health Guidelines**: WHO and CPCB recommendations
- **GRAP Rules**: Delhi government action plan integration

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
WAQI_TOKEN=your_waqi_api_token
MONGODB_URI=mongodb://localhost:27017/ward-pollution
PORT=5000
NODE_ENV=development

# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Scheduling Configuration
```javascript
// Automatic updates every 30 minutes
// Daily reports generated at 6 AM
// Zone summaries updated hourly
```

## 🚨 Monitoring & Alerts

### System Health
- **API Connectivity**: Monitors WAQI API status
- **Data Freshness**: Tracks last update timestamps
- **Scheduler Status**: Monitors background processes

### Emergency Alerts
- **AQI > 300**: Hazardous air quality notifications
- **GRAP Activation**: Automatic policy recommendations
- **System Failures**: Health check alerts

## 📱 Mobile Responsiveness

All dashboards are fully responsive and optimized for:
- Desktop computers (authorities)
- Tablets (field officers)
- Mobile phones (citizens)

## 🔐 Security Features

- **API Rate Limiting**: Prevents abuse
- **Data Validation**: Input sanitization
- **Error Handling**: Graceful failure management
- **Environment Isolation**: Secure configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WAQI**: World Air Quality Index for real-time data
- **Delhi Government**: GRAP guidelines and ward information
- **CPCB**: Central Pollution Control Board standards
- **WHO**: Health recommendation guidelines

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the [documentation](backend/POLLUTION_PIPELINE_GUIDE.md)
- Review API endpoints in [endpoints.md](docs/api/endpoints.md)

---

**Built for Hack4Delhi 2024** - Empowering citizens and authorities with real-time pollution intelligence.