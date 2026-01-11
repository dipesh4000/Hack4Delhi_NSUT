# AI Chatbot Integration

## Overview
The Ward-Wise Pollution Action Dashboard now includes an AI-powered chatbot using Lyzr AI agent that provides:

1. **General Chatbot**: Answers questions about pollution, AQI, and website features
2. **Health Advisories**: Provides personalized health recommendations for citizens based on current AQI
3. **Government Actions**: Suggests appropriate action strategies for authorities to control pollution

## Features

### 🤖 Floating Chatbot
- Located at bottom-right corner of all pages
- Modern UI with smooth animations
- Real-time conversation with AI agent
- Session management for context retention

### 🏥 Health Advisory (Citizens)
- Integrated into citizen dashboard
- AI-powered recommendations based on current AQI and ward
- Color-coded alerts based on pollution severity
- Fallback to default recommendations if AI fails

### 🏛️ Government Actions (Authorities)
- Integrated into authority dashboard
- AI-suggested priority actions for pollution control
- Urgency levels based on AQI thresholds
- Contextual recommendations for specific wards

## Technical Implementation

### Backend (Node.js/Express)
- **Controller**: `backend/src/controllers/aiController.js`
- **Routes**: `backend/src/routes/aiRoutes.js`
- **Endpoints**:
  - `POST /api/ai/chat` - General chatbot
  - `POST /api/ai/health-advisory` - Health recommendations
  - `POST /api/ai/govt-action` - Government actions

### Frontend (Next.js/React)
- **Chatbot Component**: `frontend/components/ai/AIChatbot.tsx`
- **Health Advisory**: `frontend/components/citizen/AIHealthAdvisory.tsx`
- **Government Actions**: `frontend/components/authority/AIGovtAction.tsx`
- **Service Hook**: `frontend/components/ai/useAIService.ts`
- **API Routes**: `frontend/app/api/ai/*/route.ts`

## Configuration

### Lyzr AI Agent Settings
```javascript
const LYZR_CONFIG = {
  API_URL: 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
  API_KEY: 'sk-default-EiUxVZWVhWT0SRuI7bHOK4oKm7oUoNzD',
  AGENT_ID: '696369a3d09b5523633492f9',
  USER_ID: 'devanshparti@gmail.com'
};
```

### Environment Variables
Add to your `.env` files:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Usage

### For Citizens
1. Visit the citizen dashboard
2. See AI health advisory in the health recommendations section
3. Use the floating chatbot for general questions

### For Authorities
1. Visit the authority dashboard
2. See AI government actions in the GRAP actions section
3. Use the floating chatbot for policy guidance

### Special Queries
- **Health Advisory**: Include "HEALTH_ADVISORY" in your message
- **Government Action**: Include "GOVT_ACTION" in your message

## Response Formats

### Health Advisory
- **Trigger**: `HEALTH_ADVISORY AQI {value} Ward {id}`
- **Response**: One-line health recommendation (max 15 words)
- **Example**: "AQI 150: Wear masks outdoors and limit physical activities."

### Government Action
- **Trigger**: `GOVT_ACTION AQI {value} Ward {id} Level {pollution_level}`
- **Response**: One-line action strategy (max 15 words)
- **Example**: "Priority action: Implement traffic restrictions and halt construction activities."

## Fallback System
If the AI service fails, the system provides default recommendations based on AQI thresholds:
- **0-50**: Good air quality advice
- **51-100**: Moderate precautions
- **101-150**: Unhealthy for sensitive groups
- **151-200**: Unhealthy conditions
- **201-300**: Very unhealthy measures
- **300+**: Hazardous emergency actions

## Styling
The components use Tailwind CSS and match the existing design system:
- Color-coded based on AQI severity
- Consistent with dashboard aesthetics
- Responsive design for all screen sizes
- Smooth animations using Framer Motion