import React, { useState } from 'react';
// Remove 'Router' from this import, as it's no longer used here
import { Routes, Route, Outlet } from 'react-router-dom'; 
import { Toaster } from 'react-hot-toast';

// Import pages and components with file extensions
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import PredictionForm from './pages/PredictionForm.jsx';
import Results from './pages/Results.jsx';
import Header from './components/Header.jsx';

// Import the context from its new file with extension
import { AppContext } from './AppContext.jsx';

// Import global styles
import './index.css';

// Main layout component that includes the header
const AppLayout = () => (
  <>
    <Header />
    <main className="container">
      {/* Outlet renders the matched child route */}
      <Outlet />
    </main>
  </>
);

function App() {
  // State for prediction results
  const [predictionResult, setPredictionResult] = useState(null);

  // The backend API URL (runs on port 5000)
  const API_URL = 'http://127.0.0.1:5000';

  return (
    // Provide the context value to all child components
    <AppContext.Provider value={{ API_URL, predictionResult, setPredictionResult }}>
      
      {/* <Router> was removed from here. The router in main.jsx now controls all routes. */}
      
      {/* Toaster for notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      <Routes>
        {/* Routes that use the main layout (with header) */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="predict" element={<PredictionForm />} />
          <Route path="results" element={<Results />} />
        </Route>
        
        {/* You can add other routes *without* the header here if needed */}
      </Routes>
      
    </AppContext.Provider>
  );
}

export default App;

