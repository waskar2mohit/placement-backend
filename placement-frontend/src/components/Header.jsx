import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  Home,
  Info,
} from "lucide-react";
import styles from './Header.module.css'; // Import CSS Module

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/predict', label: 'Predictor', icon: Sparkles },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo and Title */}
        <div className={styles.logoContainer}>
          <div className={styles.logoIconWrapper}>
            <GraduationCap className={styles.logoIcon} />
          </div>
          <div>
            <h1 className={styles.title}>
              PlacementPredict
            </h1>
            <p className={styles.subtitle}>
              AI-Powered Career Guidance
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            const linkClass = `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={linkClass}
              >
                <IconComponent style={{ height: '1rem', width: '1rem' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation Button */}
        <div className={styles.mobileMenuButtonContainer}>
          <button className={styles.mobileMenuButton}>
            <svg
              className={styles.mobileMenuIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;