
# CASC / Sentinel Connect 🛡️

**AI-Powered Community Safety & Surveillance Platform**

Empowering communities and law enforcement with a unified, dual-role dashboard for real-time monitoring, efficient evidence sharing, and AI-driven video analysis.

![Dashboards Preview](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)
*(Placeholder for project screenshots)*

## 🚀 Overview

**CASC (Community & Safety Command)** is a next-generation surveillance platform connecting "Homeowner" private camera networks with "Police" command centers. It facilitates privacy-focused collaboration where citizens can opt-in to share footage upon request, and authorities can leverage AI to analyze incidents rapidly.

This project features two distinct user interfaces:
1.  **CASC Command (Police View):** A geospatial map-based dashboard for tracking incidents, locating cameras, and requesting access.
2.  **Sentinel Home (Homeowner View):** A private dashboard for residents to monitor their feed, check device health, receiving alerts, and securely manage footage requests.

## ✨ Key Features

### 👮 Police Dashboard (CASC Command)
-   **Geospatial Map Integration:** Interactive Mapbox GL map visualizing camera nodes and active incidents.
-   **Incident Tracking:** Real-time logging of distress calls and reports.
-   **Request System:** Send authenticated video access requests to specific homeowners.
-   **AI Video Analysis:** Integrated Google Gemini AI to analyze footage for threats (weapons, suspects).

### 🏠 Homeowner Dashboard (Sentinel Home)
-   **Live Monitoring:** Real-time video feed with custom controls (Fullscreen, Play/Pause).
-   **AI Sentinel:** On-demand AI analysis of live feeds to detect anomalies or threats.
-   **Privacy First:** Toggle "Privacy Mode" to go offline instantly.
-   **Device Health:** Monitor signal strength, battery, and storage status.
-   **Alerts & Logs:** Receive community safety alerts and view recent activity logs.

## 🛠️ Tech Stack

-   **Frontend:** React (TypeScript), Vite
-   **Styling:** Tailwind CSS, Glassmorphism UI
-   **Maps:** Mapbox GL JS
-   **AI Integration:** Google Gemini API (`@google/genai`)
-   **Icons:** Iconify
-   **Video:** Native HTML5 Video with Custom Overlay

## ⚡ Getting Started

### Prerequisites
-   Node.js (v18+)
-   npm or yarn
-   Mapbox API Key
-   Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/sentinel-connect.git
    cd sentinel-connect
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    VITE_MAPBOX_TOKEN=your_mapbox_token_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📸 Usage

-   **Switch Roles:** Use the toggle or login simulation to switch between "Police" and "Homeowner" views.
-   **Simulate Interaction:**
    1.  (Police) Select a camera node on the map and "Request Access".
    2.  (Homeowner) See the notification, "Approve" request, and upload a video file.
    3.  (Police) Receive the footage and use "AI Analyze" to generate a report.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
