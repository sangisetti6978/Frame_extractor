# Video Frame Extractor - Frontend

This is the frontend application for the Video Frame Extractor, built to provide a seamless, interactive user experience for extracting frames from videos. It features a custom video player with auto-capture on pause, an AI-powered blur detection interface, and an image gallery to manage captured frames.

## 🚀 How the Website Works (Workflow)

The web application follows a streamlined user flow for extracting frames:

1. **Authentication:**
   - Users must first **Register** and **Login**. The frontend communicates securely with the Django backend using **JWT (JSON Web Tokens)**. Tokens are stored locally and automatically attached to API requests.

2. **Workspace Setup & Configuration:**
   - Upon logging in, users configure their extraction settings. This includes setting output folder preferences and configuring the sensitivity of the AI blur detection.

3. **Video Upload & Processing:**
   - Users upload a video file via a drag-and-drop interface.
   - The video is sent to the backend where it is stored and processed. The frontend displays upload progress and processing status.

4. **Frame Extraction (The Video Player):**
   - The core feature is the custom video player. Users can play, pause, and seek through their uploaded videos.
   - **Auto-Capture on Pause:** When the user pauses the video, the frontend automatically triggers a frame capture event at that exact timestamp.
   - The captured frame is sent to the backend, which extracts it using FFmpeg and evaluates it using OpenCV for blur detection.

5. **Image Gallery & Management:**
   - Captured frames are instantly displayed in a responsive grid gallery below the player.
   - Users can filter images (e.g., hiding blurry images), view them in full resolution, delete unwanted frames, and download the selected high-quality frames.

## 💻 Technologies Used in Detail

The frontend is built using a modern, fast, and scalable technology stack:

### Core Frameworks & Libraries
* **React 18:** The core UI library. We use React's functional components and hooks (like `useState`, `useEffect`, `useContext`) to build a reactive and modular interface.
* **Vite:** Our build tool and development server. Vite provides lightning-fast Hot Module Replacement (HMR) and optimized production builds, significantly outperforming traditional tools like Webpack.
* **React Router DOM (v6):** Handles client-side routing. It enables seamless navigation between the Login, Dashboard, Video Player, and Gallery pages without reloading the browser.

### Styling & UI
* **Tailwind CSS (v3):** A utility-first CSS framework. It allows us to build responsive, custom designs directly within our JSX without writing separate CSS files. It ensures consistent spacing, typography, and colors (like our dark mode theme).
* **Lucide React:** A beautiful and consistent icon library used for buttons, navigation, and visual indicators throughout the app.

### API & Data Fetching
* **Axios:** A promise-based HTTP client used to communicate with the Django REST API. We use Axios interceptors to globally handle JWT token injection on every request and to automatically catch `401 Unauthorized` errors to log the user out if their session expires.

### State Management
* **React Context API:** Used for global state management that needs to be accessed by multiple components. For example, the `AuthContext` holds the current user's authentication state and tokens, making it accessible throughout the component tree without prop-drilling.

## 📁 Project Structure

```text
frontend/
├── public/               # Static assets (favicon, etc.)
├── src/
│   ├── components/       # Reusable UI components (Buttons, Modals, VideoPlayer)
│   ├── context/          # React Context providers (AuthContext)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Full page views (Login, Workspace, Gallery)
│   ├── services/         # API calling modules (api.js, authApi.js, videoApi.js)
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Main application routing and wrapper
│   └── index.css         # Global CSS and Tailwind directives
├── .env                  # Environment variables (API URL)
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind theme and plugin configuration
└── vite.config.js        # Vite build and dev server configuration
```

## 🛠️ Getting Started (Development)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure you have a `.env` file in the `frontend` root matching the API URL (defaults to localhost:8000).
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.
