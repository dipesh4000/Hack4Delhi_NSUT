# Ward-Wise Urban Air Pollution Action Dashboard
## Project Explanation & System Overview

### 1. Project Overview
**Problem:** Urban air pollution is a hyper-local phenomenon. A city-wide AQI reading of 300 doesn't help a citizen living in a ward where the AQI is actually 450 due to local waste burning or traffic congestion. Current city-level monitoring systems average out these critical local spikes, leading to generalized, ineffective responses.

**Solution:** This project implements a **Ward-Wise Urban Air Pollution Action Dashboard**, a granular monitoring and action system. It breaks down the city into administrative wards, providing localized pollution data, inferring specific sources (like construction dust or traffic), and recommending targeted actions aligned with the Graded Response Action Plan (GRAP).

### 2. Objectives
*   **Hyper-Local Insights:** Shift from city-wide averages to ward-level precision.
*   **Accountability:** Enable municipal authorities to track pollution and action compliance at the ward level.
*   **Data-Driven Action:** Replace reactive scrambling with proactive, data-backed mitigation strategies.
*   **Public Health Protection:** Empower citizens with specific, localized health advisories rather than generic warnings.

### 3. Stakeholders & User Roles
*   **Citizens:** Access real-time ward AQI, receive health alerts, and understand local pollution sources.
*   **Municipal Authorities (Ward Officers/Commissioners):** Monitor hotspots, receive action recommendations, and track mitigation progress.
*   **Pollution Control Boards (CPCB/DPCC):** Oversee city-wide compliance and validate data accuracy.
*   **Emergency Response Teams:** Deploy resources to "Red Zone" wards during severe pollution episodes.

### 4. System Architecture (High-Level)
The system is built on a modern, scalable stack designed for reliability and speed.
*   **Data Layer:** Ingests data from CPCB monitors and maps it to GeoJSON ward boundaries.
*   **Intelligence Layer:**
    *   **Source Inference Engine:** Uses heuristic models to attribute pollution to sources (e.g., High NO2 + Peak Hours = Traffic).
    *   **GRAP Engine:** Maps AQI levels to statutory action mandates.
*   **Frontend (Dual Dashboard):**
    *   **Citizen View:** Mobile-responsive, simplified interface for public awareness.
    *   **Authority View:** Desktop-optimized, data-rich command center for officials.
*   **Backend:** Node.js/Express REST API serving processed data and managing user authentication.

### 5. Data Flow (End-to-End)
1.  **Collection:** Pollution data (PM2.5, PM10, NO2, SO2) is fetched from monitoring stations.
2.  **Mapping:** Station data is interpolated to administrative wards using geospatial mapping (Point-in-Polygon).
3.  **Calculation:** Ward-specific AQI is calculated based on the dominant pollutant.
4.  **Inference:** The system analyzes pollutant ratios and time-of-day patterns to infer probable sources (e.g., high PM10 during day = Construction).
5.  **Action Generation:** The GRAP Engine checks the AQI against thresholds and generates specific tasks (e.g., "Sprinkle water on Road X").
6.  **Dissemination:**
    *   Citizens see: "AQI 350 - Hazardous. Avoid outdoor walks."
    *   Authorities see: "Ward 12 Hotspot. Action: Halt construction immediately."

### 6. Ward-Level Pollution Source Identification
Since placing sensors in every street is cost-prohibitive, we use **Inference Logic**:
*   **Traffic:** Correlated with high NO2 levels during morning/evening peak hours.
*   **Construction:** Correlated with consistently high PM10 levels independent of traffic peaks.
*   **Waste Burning:** Identified by spikes in PM2.5 and organic compounds (if available) during late night/early morning.
*   **Industrial:** High SO2 levels in wards zoned for or near industrial activity.

### 7. Action-Oriented Intelligence (GRAP Alignment)
The system automates the implementation of the Graded Response Action Plan (GRAP).
*   **Stage 1 (Poor):** Enforce dust control, synchronize traffic lights.
*   **Stage 2 (Very Poor):** Ban diesel generators, increase parking fees.
*   **Stage 3 (Severe):** Close stone crushers, restrict BS-III/IV vehicles.
*   **Stage 4 (Severe+):** Stop construction, consider school closures.
*   **Workflow:** The dashboard pushes these specific actions as "Tasks" to the relevant Ward Officer's dashboard.

### 8. Dual Dashboard Design
**Citizen Dashboard:**
*   **Focus:** Simplicity, Health, Awareness.
*   **Key Features:** Color-coded Ward Map, "Am I Safe?" indicator, Health Tips, Local Source breakdown.

**Authority Dashboard:**
*   **Focus:** Management, Compliance, Impact.
*   **Key Features:** Hotspot Heatmap, Action Task List (To-Do/Done), Impact Analysis charts, Historical Trend reports.

### 9. Navigation & User Journey
**Citizen Journey:**
1.  **Landing:** Sees a city map with color-coded wards.
2.  **Selection:** Clicks their ward or uses "Locate Me".
3.  **Details:** Views current AQI, main pollutant, and specific health advice (e.g., "Wear N95 mask").

**Authority Journey:**
1.  **Login:** Secure authentication.
2.  **Overview:** Dashboard showing top 5 most polluted wards.
3.  **Action:** Drills down into a specific ward, sees a list of GRAP actions.
4.  **Update:** Marks an action as "Initiated" or "Completed".
5.  **Tracking:** Reviews impact graphs to see if AQI dropped after action.

### 10. Implementation Strategy
*   **Phase 1 (MVP):** Static GeoJSON wards, simulated sensor data, basic GRAP rules.
*   **Phase 2 (Pilot):** Integration with live CPCB APIs, real-time alerts.
*   **Phase 3 (Scale):** Mobile app for field officers to upload photo proof of actions taken.
*   **Data Strategy:** Use a hybrid of real station data and spatial interpolation to ensure every ward has a value, clearly marking "Inferred" vs "Measured" data.

### 11. Scalability & Extensibility
*   **Multi-City Support:** The modular architecture allows adding new city GeoJSONs and sensor endpoints without code changes.
*   **IoT Integration:** Ready to ingest data from low-cost IoT sensor networks for hyper-local accuracy.
*   **AI/ML:** Future modules can predict pollution spikes 24 hours in advance using weather forecasts and historical patterns.

### 12. Impact & Outcomes
*   **Governance:** Shifts accountability from a vague "City Administration" to specific Ward Officers.
*   **Response Time:** Reduces decision-making time from days to minutes during pollution emergencies.
*   **Public Trust:** Transparent data builds trust between the government and citizens.
*   **Health:** Targeted advisories directly reduce exposure for vulnerable populations (children, elderly).

### 13. Conclusion
The "Ward-Wise Urban Air Pollution Action Dashboard" is not just a monitoring tool; it is a **decision support system**. By bridging the gap between high-level policy (GRAP) and ground-level execution (Ward Officers), it offers a practical, scalable, and high-impact solution to one of India's most pressing urban challenges.
