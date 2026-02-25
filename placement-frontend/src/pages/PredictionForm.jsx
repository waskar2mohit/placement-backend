import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { AppContext } from '../AppContext.jsx'; // Make sure .jsx is here if needed
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  User,
  GraduationCap,
  Brain,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Star,
  BookOpen,
  Briefcase, // Icon is imported
  Trophy     // Icon is imported
} from 'lucide-react';
import QuizModal from '../components/QuizModal.jsx'; // Make sure .jsx is here if needed
import styles from './PredictionForm.module.css'; // We are using the CSS module now

// --- Main PredictionForm Component ---

const steps = [
  { name: 'Academics', icon: GraduationCap },
  { name: 'Experience', icon: Briefcase },
  { name: 'Skills', icon: BookOpen },
  { name: 'Aptitude Quiz', icon: Brain },
  { name: 'Predict', icon: Trophy },
];

const PredictionForm = () => {
  const { API_URL } = useContext(AppContext);
  const navigate = useNavigate();

  const { 
    isLoading, 
    setIsLoading, // Renamed to avoid conflicts
    setPredictionResult, 
    setError 
  } = useStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // This one state holds ALL form data based on index.html
  const [formData, setFormData] = useState({
    // Step 1: Academics
    CGPA: '',
    SSC_Marks: '', 
    HSC_Marks: '', 
    backlogs: '0', 
    
    // Step 2: Experience
    Internship: '0',
    Projects: '0', 
    MiniProjects: '0', 
    CertificationsCount: '0', 
    Hackathon: '0',

    // Step 3: Skills
    TechnicalSkillsScore: '5', 
    CommunicationSkillRating: '5', 
    LeadershipSkill: '5', 
    ProblemSolvingSkill: '5', 
    TeamworkSkill: '5', 
    TimeManagementSkill: '5', 

    // User-input skills for quiz
    ProgrammingLanguages: '',
    FrameworksLibraries: '',
    Databases: '',
    ToolsTechnologies: '',
    
    // Step 4: Quiz
    AptitudeTestScore: null, 
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSliderChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value).toFixed(1),
    }));
  };

  // Generates a string of skills for the AI quiz model from textareas
  const getSkillsForQuiz = () => {
    const skills = [
      formData.ProgrammingLanguages,
      formData.FrameworksLibraries,
      formData.Databases,
      formData.ToolsTechnologies
    ].map(s => s.trim()).filter(Boolean); 

    if (skills.length === 0) {
      return 'General Aptitude, Logic, Problem Solving'; 
    }
    return skills.join(', ');
  };

  // Callback function for when the quiz is finished
  const handleQuizComplete = (score, totalQuestions) => {
    const finalScore = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    
    setFormData(prev => ({ ...prev, AptitudeTestScore: finalScore.toFixed(0) }));
    setIsQuizModalOpen(false);
    toast.success(`Aptitude score recorded: ${finalScore.toFixed(0)}%`);
    
    setCurrentStep(4); 
  };

  // Final submission to the backend
  const handleSubmitPrediction = async () => {
    if (formData.AptitudeTestScore === null) {
      toast.error('Please complete the Aptitude Quiz first.');
      setCurrentStep(3); 
      return;
    }

    setIsLoading(true); // Use Zustand store loading
    const loadingToastId = toast.loading('Analyzing profile...');

    // Prepare the final data payload
    try {
      const payload = {
        CGPA: parseFloat(formData.CGPA),
        SSC_Marks: parseFloat(formData.SSC_Marks),
        HSC_Marks: parseFloat(formData.HSC_Marks),
        backlogs: parseInt(formData.backlogs),
        Internship: parseInt(formData.Internship),
        Projects: parseInt(formData.Projects),
        MiniProjects: parseInt(formData.MiniProjects),
        CertificationsCount: parseInt(formData.CertificationsCount),
        Hackathon: parseInt(formData.Hackathon),
        TechnicalSkillsScore: parseFloat(formData.TechnicalSkillsScore),
        AptitudeTestScore: parseFloat(formData.AptitudeTestScore),
        CommunicationSkillRating: parseFloat(formData.CommunicationSkillRating),
        LeadershipSkill: parseFloat(formData.LeadershipSkill),
        ProblemSolvingSkill: parseFloat(formData.ProblemSolvingSkill),
        TeamworkSkill: parseFloat(formData.TeamworkSkill),
        TimeManagementSkill: parseFloat(formData.TimeManagementSkill),
      };
      console.log("Sending payload to /api/predict:", payload); // Log payload
      const response = await axios.post(`${API_URL}/api/predict`, payload);
      console.log("Received response from /api/predict:", response.data);

      if (response.data && response.data.prediction && response.data.confidence) {
        setPredictionResult(response.data); // Update Zustand store
        console.log("Prediction result SAVED to Zustand store."); // Log success
        toast.success('Prediction complete!', { id: loadingToastId });
        console.log("Navigating to /results..."); // Log navigation
        navigate('/results');
      } else {
        // Handle cases where the backend response is missing expected fields
        console.error("Backend response is missing expected data:", response.data);
        const errorMsg = "Received invalid data structure from server.";
        setError(errorMsg);
        toast.error(errorMsg, { id: loadingToastId });
      }
    } catch (err) {
      console.error('Prediction API Error:', err);
      const errorMsg = err.response?.data?.error || 'Prediction failed.';
      setError(errorMsg); // Update Zustand store with error
      toast.error(errorMsg, { id: loadingToastId });
    } 
  };

  // --- Validation Logic ---
  const validateStep = (stepIndex) => {
    const { CGPA, SSC_Marks, HSC_Marks, backlogs } = formData;
    if (stepIndex === 0) {
      if (!CGPA || CGPA < 0 || CGPA > 10) {
        toast.error('Please enter a valid CGPA (0-10).'); return false;
      }
      if (!SSC_Marks || SSC_Marks < 0 || SSC_Marks > 100) {
        toast.error('Please enter valid 10th Grade % (0-100).'); return false;
      }
      if (!HSC_Marks || HSC_Marks < 0 || HSC_Marks > 100) {
        toast.error('Please enter valid 12th Grade % (0-100).'); return false;
      }
      if (backlogs === '' || backlogs < 0) {
        toast.error('Please enter a valid number of backlogs (0 or more).'); return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    if (currentStep === 3) {
      setIsQuizModalOpen(true);
      return;
    }
    if (currentStep === 4) {
      handleSubmitPrediction();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // --- Render functions for each step ---
  
  const renderStep1_Academics = () => (
    <div className={styles.grid}>
      <div>
        <label htmlFor="CGPA">CGPA (out of 10) *</label>
        <input type="number" name="CGPA" id="CGPA" value={formData.CGPA} onChange={handleFormChange} step="0.01" min="0" max="10" placeholder="e.g., 8.5" required />
      </div>
      <div>
        <label htmlFor="SSC_Marks">10th Grade (SSC) % *</label>
        <input type="number" name="SSC_Marks" id="SSC_Marks" value={formData.SSC_Marks} onChange={handleFormChange} step="0.01" min="0" max="100" placeholder="e.g., 85.5" required />
      </div>
      <div>
        <label htmlFor="HSC_Marks">12th Grade (HSC) % *</label>
        <input type="number" name="HSC_Marks" id="HSC_Marks" value={formData.HSC_Marks} onChange={handleFormChange} step="0.01" min="0" max="100" placeholder="e.g., 88.0" required />
      </div>
      <div>
        <label htmlFor="backlogs">Number of Backlogs *</label>
        <input type="number" name="backlogs" id="backlogs" value={formData.backlogs} onChange={handleFormChange} min="0" placeholder="0" required />
      </div>
    </div>
  );

  const renderStep2_Experience = () => (
    <div className={styles.grid}>
       <div>
        <label htmlFor="Internship">Internship Experience *</label>
        <select name="Internship" id="Internship" value={formData.Internship} onChange={handleFormChange} required>
          <option value="0">No internship</option>
          <option value="1">Completed internship</option>
        </select>
      </div>
      <div>
        <label htmlFor="Projects">Number of Projects *</label>
        <input type="number" name="Projects" id="Projects" value={formData.Projects} onChange={handleFormChange} min="0" placeholder="e.g., 3" required />
      </div>
      <div>
        <label htmlFor="MiniProjects">Mini Projects *</label>
        <input type="number" name="MiniProjects" id="MiniProjects" value={formData.MiniProjects} onChange={handleFormChange} min="0" placeholder="e.g., 5" required />
      </div>
      <div>
        <label htmlFor="CertificationsCount">Certifications *</label>
        <input type="number" name="CertificationsCount" id="CertificationsCount" value={formData.CertificationsCount} onChange={handleFormChange} min="0" placeholder="e.g., 2" required />
      </div>
      <div className={styles.gridSpan2}>
        <label htmlFor="Hackathon">Hackathon Participation *</label>
        <select name="Hackathon" id="Hackathon" value={formData.Hackathon} onChange={handleFormChange} required>
          <option value="0">Not participated</option>
          <option value="1">Participated</option>
        </select>
      </div>
    </div>
  );

  const SkillSlider = ({ name, label, min = 1, max = 10, step = 0.1 }) => (
    <div>
      <label htmlFor={name} className={styles.skillSliderLabel}>
        <span>{label}</span>
        <span>{formData[name]} / {max}</span>
      </label>
      <input type="range" name={name} id={name} value={formData[name]} onChange={handleSliderChange} min={min} max={max} step={step} />
    </div>
  );
  
  const renderStep3_Skills = () => (
    <div>
      <h3 className={styles.stepSubtitle}>Soft Skills Rating</h3>
      <div className={styles.gridSkills}>
        <SkillSlider name="CommunicationSkillRating" label="Communication Skills" />
        <SkillSlider name="LeadershipSkill" label="Leadership Skills" />
        <SkillSlider name="ProblemSolvingSkill" label="Problem Solving" />
        <SkillSlider name="TeamworkSkill" label="Teamwork" />
        <SkillSlider name="TimeManagementSkill" label="Time Management" />
        <SkillSlider name="TechnicalSkillsScore" label="Overall Technical Rating (Self-Assessed)" />
      </div>

      <hr className={styles.divider} />

      <h3 className={styles.stepSubtitle}>Technical Skills for Quiz</h3>
      <p className={styles.stepDescription}>List your technical skills to generate a personalized aptitude test.</p>
      <div className={styles.grid}>
        <div>
          <label htmlFor="ProgrammingLanguages">Programming Languages</label>
          <textarea name="ProgrammingLanguages" id="ProgrammingLanguages" value={formData.ProgrammingLanguages} onChange={handleFormChange} placeholder="e.g., Python, Java, JavaScript" rows="2"></textarea>
        </div>
        <div>
          <label htmlFor="FrameworksLibraries">Frameworks & Libraries</label>
          <textarea name="FrameworksLibraries" id="FrameworksLibraries" value={formData.FrameworksLibraries} onChange={handleFormChange} placeholder="e.g., React, Django, Spring Boot" rows="2"></textarea>
        </div>
        <div>
          <label htmlFor="Databases">Databases</label>
          <textarea name="Databases" id="Databases" value={formData.Databases} onChange={handleFormChange} placeholder="e.g., MySQL, MongoDB, PostgreSQL" rows="2"></textarea>
        </div>
        <div>
          <label htmlFor="ToolsTechnologies">Tools & Technologies</label>
          <textarea name="ToolsTechnologies" id="ToolsTechnologies" value={formData.ToolsTechnologies} onChange={handleFormChange} placeholder="e.g., Git, Docker, AWS" rows="2"></textarea>
        </div>
      </div>
    </div>
  );

  const renderStep4_Quiz = () => (
    <div className={styles.stepCenter}>
      <Brain className={styles.stepCenterIcon} />
      <h3 className={styles.stepCenterTitle}>Aptitude Assessment</h3>
      <p className={styles.stepCenterText}>
        Finally, we'll generate a custom 20-question quiz based on the skills you listed to measure your aptitude. Your score will be used in the final prediction.
      </p>
      <button
        onClick={() => setIsQuizModalOpen(true)}
        className={`${styles.button} ${styles.buttonPrimary}`}
      >
        <Sparkles />
        Generate & Start Quiz
      </button>
    </div>
  );

  const renderStep5_Submit = () => (
     <div className={styles.stepCenter}>
      <Trophy className={styles.stepCenterIconSubmit} /> 
      <h3 className={styles.stepCenterTitle}>Ready to Predict!</h3>
      <p className={styles.stepCenterText}>
        All your information has been collected. Your calculated Aptitude score is:
      </p>
      <div className={styles.stepCenterScore}>
        {formData.AptitudeTestScore} <span className={styles.stepCenterScoreSpan}>%</span> 
      </div>
      <p className={styles.stepCenterText}>Click below to get your final prediction and AI report.</p>
    </div>
  );

  const renderStepContent = () => {
    const stepsContent = [
      renderStep1_Academics(),
      renderStep2_Experience(),
      renderStep3_Skills(),
      renderStep4_Quiz(),
      renderStep5_Submit()
    ];
    return stepsContent[currentStep];
  };
  
  const isNextDisabled = () => {
    if (isLoading) return true;
    if (currentStep === 4 && formData.AptitudeTestScore === null) return true; 
    return false;
  }

  return (
    <div className={styles.formWrapper}>
      {/* This <style> tag is removed, fixing the error */}
      {isQuizModalOpen && (
        <QuizModal
          skillsToTest={getSkillsForQuiz()}
          onQuizComplete={handleQuizComplete}
          onClose={() => setIsQuizModalOpen(false)}
        />
      )}

      {/* Stepper Navigation */}
      <div className={styles.stepper}>
        <ol className={styles.stepperList}>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            let stepClass = styles.stepContent;
            if (isActive) stepClass += ` ${styles.active}`;
            if (isCompleted) stepClass += ` ${styles.completed}`;

            return (
              <li key={step.name} className={styles.step}>
                <div 
                  className={stepClass}
                  onClick={() => isCompleted && setCurrentStep(index)} // Allow going back
                >
                  <div className={styles.stepIconWrapper}>
                    <step.icon className={styles.stepIcon} />
                  </div>
                  <span className={styles.stepName}>
                    {step.name}
                  </span>
                </div>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={styles.connector}></div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Form Content */}
      <div className={styles.formContent}>
        <h2 className={styles.formTitle}>{steps[currentStep].name}</h2>
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.buttonNav}>
        <button
          onClick={prevStep}
          disabled={currentStep === 0 || isLoading}
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          <ChevronLeft />
          Previous
        </button>

        <button
          onClick={nextStep}
          disabled={isNextDisabled()}
          className={`${styles.button} ${styles.buttonPrimary} ${isLoading ? styles.loading : ''}`}
        >
          {isLoading ? (
            <><Loader2 />Analyzing...</>
          ) : currentStep === steps.length - 1 ? (
            <><Trophy />Get Prediction</>
          ) : currentStep === 3 ? (
            <><Brain />Take Quiz</>
          ) : (
            <>Next<ChevronRight style={{ marginRight: '-0.25rem', marginLeft: '0.5rem' }} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default PredictionForm;