import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../lib/store'; // Zustand store
import { ArrowLeft, CheckCircle, AlertCircle, BookOpen, Award, TrendingUp, Brain, Loader2 } from 'lucide-react';
import styles from './Results.module.css'; // Your CSS module

// NEW: Speedometer Gauge Component
const Speedometer = ({ percentage }) => {
  const radius = 80;
  const strokeWidth = 18;
  const normalizedRadius = radius - strokeWidth / 2;
  const arcLength = Math.PI * normalizedRadius; // Length of a semi-circle
  const offset = arcLength - (percentage / 100) * arcLength;

  // Determine color based on percentage
  const colorClass = percentage >= 75 ? styles.textGreen : percentage >= 50 ? styles.textYellow : styles.textRed;

  // SVG path for a semi-circle
  const path = `M ${strokeWidth / 2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0 1 ${radius * 2 - strokeWidth / 2},${radius}`;

  return (
    <div className={styles.speedometer}>
      <svg className={styles.speedometerSvg} viewBox={`0 0 ${radius * 2} ${radius + strokeWidth / 2}`}>
        {/* Background Arc */}
        <path
          d={path}
          fill="none"
          strokeWidth={strokeWidth}
          className={styles.speedometerBg}
        />
        {/* Value Arc */}
        <path
          d={path}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${styles.speedometerValue} ${colorClass}`}
          style={{ strokeDasharray: arcLength, strokeDashoffset: offset }}
        />
      </svg>
      <span className={`${styles.speedometerText} ${colorClass}`}>
        {percentage}%
      </span>
    </div>
  );
};


const Results = () => {
  const { predictionResult, isLoading, error } = useStore();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (error) {
    return <div className="text-center text-red-600 p-8">Error: {error} <Link to="/predict" className="underline">Go back</Link></div>;
  }
  if (!predictionResult) {
    return <Navigate to="/predict" replace />;
  }

  const { prediction, confidence, recommendations } = predictionResult;
  const isPlaced = prediction === 'Placed';
  const confidencePercent = Math.round(parseFloat(confidence));
  const confidenceColorClass = confidencePercent >= 75 ? styles.textGreen : confidencePercent >= 50 ? styles.textYellow : styles.textRed;

  return (
    <div className={styles.container}>
      <Link to="/predict" className={styles.backLink}>
        <ArrowLeft /> Make Another Prediction
      </Link>

      <div className={styles.resultsGrid}>
        {/* Left Column: Score Card with Speedometer */}
        <div className={styles.scoreCard}>
          <h2 className={styles.scoreTitle}>Placement Score</h2>
          <Speedometer percentage={confidencePercent} />
          <p className={`${styles.predictionText} ${confidenceColorClass}`}>
            Prediction: {isPlaced ? 'Placed' : 'Needs Improvement'}
          </p>
        </div>

        {/* Right Column: Report Card (no changes needed here) */}
        <div className={styles.reportCard}>
          {/* ... all your existing report card JSX ... */}
          <h1 className={styles.reportTitle}>AI Personalized Report</h1>
          {recommendations?.overall_assessment && (
            <p className={styles.reportQuote}>"{recommendations.overall_assessment}"</p>
          )}
          {recommendations ? (
             <>
              <div className={styles.reportSection}>
                {recommendations.key_strengths && (
                  <div className={styles.strengthBox}>
                    <div className={styles.listHeader}>
                      <Award className={styles.listIconStrength} />
                      <h3 className={styles.listTitleStrength}>Key Strengths</h3>
                    </div>
                    <ul className={styles.list}>
                      {recommendations.key_strengths.map((item, i) => (
                        <li key={i} className={styles.listItem}>
                          <CheckCircle className={styles.listItemIconStrength} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recommendations.areas_for_improvement && (
                  <div className={styles.improvementBox}>
                    <div className={styles.listHeader}>
                      <TrendingUp className={styles.listIconImprovement} />
                      <h3 className={styles.listTitleImprovement}>Areas for Improvement</h3>
                    </div>
                    <ul className={styles.list}>
                      {recommendations.areas_for_improvement.map((item, i) => (
                        <li key={i} className={styles.listItem}>
                          <AlertCircle className={styles.listItemIconImprovement} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {recommendations.personalized_message && (
                <div className={styles.roadmapBox}>
                  <div className={styles.listHeader}>
                    <BookOpen className={styles.listIconRoadmap} />
                    <h3 className={styles.listTitleRoadmap}>Actionable Advice</h3>
                  </div>
                  <p className={styles.roadmapText}>{recommendations.personalized_message}</p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.stepCenter}>
              <Brain />
              <h3 className={styles.stepCenterTitle}>Analysis Complete</h3>
              <p className={styles.stepCenterText}>No detailed AI recommendations were generated for this profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
