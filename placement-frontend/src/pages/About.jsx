import React from 'react';
import { Database, Zap, BrainCircuit } from 'lucide-react';
import styles from './About.module.css'; // Import CSS Module

const About = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About This Project</h1>
      
      <p className={styles.subtitle}>
        This Placement Prediction system is a full-stack application designed to help students understand their career readiness. It combines a powerful machine learning backend with a modern, responsive React frontend.
      </p>

      <div className={styles.grid}>
        {/* Frontend Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <BrainCircuit />
            Frontend (Client-Side)
          </h2>
          <ul className={styles.list}>
            <li><strong>Framework:</strong> React (using Vite)</li>
            <li><strong>Styling:</strong> CSS Modules</li>
            <li><strong>Navigation:</strong> React Router v6</li>
            <li><strong>Icons:</strong> Lucide React</li>
            <li><strong>API Communication:</strong> Axios</li>
            <li><strong>Notifications:</strong> React Hot Toast</li>
          </ul>
        </div>

        {/* Backend Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Database />
            Backend (Server-Side)
          </h2>
          <ul className={styles.list}>
            <li><strong>Framework:</strong> Python (Flask)</li>
            <li><strong>ML Model:</strong> Scikit-learn (Random Forest)</li>
            <li><strong>AI Integration:</strong> Google Gemini API</li>
            <li><strong>Data Handling:</strong> Pandas</li>
            <li><strong>API Type:</strong> REST API (serving JSON)</li>
          </ul>
        </div>
      </div>

      {/* Data Flow Section */}
      <div className={styles.dataFlow}>
        <h2 className={styles.dataFlowTitle}>
          <Zap />
          Application Data Flow
        </h2>
        <ol className={styles.dataFlowList}>
          <li>User fills out the multi-step form in the React app.</li>
          <li>On the 'Aptitude' step, React calls the `/api/generate_quiz` endpoint.</li>
          <li>Flask server asks the Google Gemini API for a custom quiz based on user's skills.</li>
          <li>User completes the quiz, and the score is scaled from 1-5.</li>
          <li>User clicks "Get Prediction".</li>
          <li>React sends all form data (including the new aptitude score) to `/api/predict`.</li>
          <li>Flask uses the Scikit-learn model to get a placement prediction.</li>
          <li>Flask then sends the profile and prediction to the Gemini API for personalized recommendations.</li>
          <li>The final JSON (prediction + recommendations) is sent to React and displayed on the Results page.</li>
        </ol>
      </div>
    </div>
  );
};

export default About;