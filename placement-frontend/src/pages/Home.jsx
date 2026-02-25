import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Target, 
  Brain,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import styles from './Home.module.css'; // Import CSS Module

// Features for the homepage
const features = [
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    description: "Our advanced ML model predicts your placement with high accuracy.",
    style: styles.iconPrimary
  },
  {
    icon: Target,
    title: "Personalized Recommendations",
    description: "Get specific, actionable AI-driven advice to improve your profile.",
    style: styles.iconGreen
  },
  {
    icon: Sparkles,
    title: "Dynamic Aptitude Quiz",
    description: "Take a quiz based on your skills to get an accurate aptitude score.",
    style: styles.iconYellow
  },
];

// Benefits list
const benefits = [
  "Understand your strengths and weaknesses.",
  "Receive a clear probability of placement.",
  "Get a personalized roadmap for improvement.",
  "Build confidence for your interviews."
];

const Home = () => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Unlock Your <span>Placement Potential</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Our AI-powered platform analyzes your profile, predicts your placement chances, and provides a personalized roadmap to help you succeed.
        </p>
        <Link
          to="/predict"
          className={styles.heroLink}
        >
          Get Started Now
          <ArrowRight />
        </Link>
      </section>

      {/* Features Section */}
      <section>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={`${styles.featureIconWrapper} ${feature.style}`}>
                <feature.icon className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div>
          <h2 className={styles.benefitsTitle}>Why Use Placement Predictor?</h2>
          <ul className={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <li key={index} className={styles.benefitItem}>
                <CheckCircle />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.benefitsCard}>
          <div className={styles.benefitsCardInner}>
            <GraduationCap />
            <h3 className={styles.benefitsCardTitle}>Comprehensive Analysis</h3>
            <p className={styles.benefitsCardText}>Get detailed insights into every aspect of your placement readiness, from technical skills to soft skills.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;