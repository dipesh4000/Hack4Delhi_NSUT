
export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AlertAnalysisRequest {
  aqi: number;
  pm25: number;
  no2: number;
  so2: number;
  wind: number;
  temp: number;
  traffic: string;
  location: string;
  timestamp: string;
}

export interface AlertAnalysisResponse {
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  cause: string;
  healthImpact: string;
  recommendation: string;
  shortAlert: string;
}

const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateGrokResponse(messages: GrokMessage[]): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    console.error('GROK_API_KEY is missing');
    return "I'm sorry, I can't connect to my brain right now. Please check the API configuration.";
  }

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Using Groq model
        messages: messages,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API Error Response:', response.status, response.statusText, errorData);
      throw new Error(`Groq API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error: any) {
    console.error('Error calling Groq API:', error);
    return "I'm having trouble connecting to the server right now. Please try again later.";
  }
}

export async function analyzeAlertWithGrok(data: AlertAnalysisRequest): Promise<AlertAnalysisResponse> {
  const prompt = `
You are an environmental risk alert assistant.

Generate a JSON response with the following fields:
1. severity (Low/Medium/High/Critical)
2. cause (Clear explanation of why pollution is high)
3. healthImpact (Impact on citizens)
4. recommendation (Actionable advice)
5. shortAlert (Max 2 lines user-facing alert)

Data:
AQI: ${data.aqi}
PM2.5: ${data.pm25}
NO2: ${data.no2}
SO2: ${data.so2}
Wind Speed: ${data.wind} km/h
Temperature: ${data.temp}°C
Traffic Level: ${data.traffic}
Location: ${data.location}
Time: ${data.timestamp}

Return ONLY valid JSON.
`;

  const messages: GrokMessage[] = [
    { role: 'system', content: 'You are a helpful environmental AI assistant. Always output valid JSON.' },
    { role: 'user', content: prompt }
  ];

  try {
    const responseText = await generateGrokResponse(messages);
    // Clean up response if it contains markdown code blocks
    const jsonString = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonString) as AlertAnalysisResponse;
  } catch (error) {
    console.error('Failed to parse Grok alert analysis:', error);
    // Fallback response
    return {
      severity: data.aqi > 300 ? 'Critical' : data.aqi > 200 ? 'High' : data.aqi > 100 ? 'Medium' : 'Low',
      cause: 'High pollution levels detected based on sensor data.',
      healthImpact: 'Prolonged exposure may be harmful.',
      recommendation: 'Wear a mask and limit outdoor activities.',
      shortAlert: `AQI is ${data.aqi}. Please take necessary precautions.`
    };
  }
}
