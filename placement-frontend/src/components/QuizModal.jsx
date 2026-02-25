import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, X } from 'lucide-react';
import { AppContext } from '../AppContext.jsx'; // Correctly import AppContext
import styles from './QuizModal.module.css'; // Correctly import the CSS Module

function QuizModal({ skillsToTest, onQuizComplete, onClose }) {
  // Get API_URL from the context
  const { API_URL } = useContext(AppContext); 
  
  // --- Quiz State ---
  const [quizData, setQuizData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // --- API State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch quiz when component mounts
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      toast.loading(`Generating 20-question quiz on: ${skillsToTest}...`, { id: 'quiz-load' });
      try {
        // This sends the user's skills to your backend
        const response = await axios.post(`${API_URL}/api/generate_quiz`, { skills: skillsToTest });
        
        // Check for quiz data in the response
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setQuizData(response.data);
          toast.success('Quiz ready!', { id: 'quiz-load' });
        } else {
          // Handle cases where the API returns an error or empty data
          throw new Error(response.data.error || "Quiz data is missing or in an invalid format.");
        }

      } catch (err) {
        console.error('Quiz API Error:', err);
        const errorMsg = err.response?.data?.error || err.message || 'Failed to load quiz.';
        setError(errorMsg);
        toast.error(errorMsg, { id: 'quiz-load' });
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [skillsToTest, API_URL]); // Effect runs when skills or API_URL change

  const handleAnswerSelect = (option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  // Calculate score and mark quiz as finished
  const finishQuiz = () => {
    let finalScore = 0;
    for (let i = 0; i < quizData.length; i++) {
      // Check if the user's answer matches the correct answer
      if (userAnswers[i] === quizData[i].correct_answer) {
        finalScore++;
      }
    }
    setScore(finalScore);
    setIsQuizFinished(true);
    toast.success(`Quiz complete! You scored ${finalScore}/${quizData.length}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.bodyCentered}>
          <Loader2 className={styles.loader} />
          <p className={styles.loaderTextLg}>Generating your custom 20-question quiz...</p>
          <p className={styles.loaderTextSm}>This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.bodyCentered}>
          <p className={styles.errorText}>Error: {error}</p>
          <button 
            onClick={onClose} 
            className={styles.closeButton}
          >
            Close
          </button>
        </div>
      );
    }

    if (isQuizFinished) {
      return (
        <div className={styles.bodyCentered}>
          <h2 className={styles.finishTitle}>Quiz Complete!</h2>
          <p className={styles.finishScore}>
            {score} <span className={styles.finishScoreSpan}>/ {quizData.length}</span>
          </p>
          <p className={styles.finishText}>Your score will be used for the final prediction.</p>
          <button
            className={styles.finishButton}
            onClick={() => onQuizComplete(score, quizData.length)} // Send score back
          >
            Use this score & Continue
          </button>
        </div>
      );
    }

    if (quizData.length > 0) {
      const question = quizData[currentQuestion];
      return (
        <div className={styles.quizContent}>
          <p className={styles.quizQuestionInfo}>
            Question {currentQuestion + 1} of {quizData.length}
          </p>
          <h3 className={styles.quizQuestion}>{question.question}</h3>
          <div className={styles.quizOptions}>
            {question.options.map((option, index) => {
              const isSelected = userAnswers[currentQuestion] === option;
              return (
                <button
                  key={index}
                  className={`${styles.quizOptionButton} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <button
            className={styles.quizNextButton}
            onClick={handleNextQuestion}
            disabled={!userAnswers[currentQuestion]}
          >
            {currentQuestion < quizData.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      );
    }
    
    // Fallback if quizData is empty but not loading and no error
    return <div className={styles.bodyCentered}>No quiz questions available. Check your API or skill input.</div>;
  };

  return (
    // Modal background
    <div className={styles.modalBackdrop}>
      {/* The <style>{keyframes}</style> tag that caused the error has been removed */}
      
      {/* Modal content */}
      <div className={styles.modalContent}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Aptitude Quiz ({skillsToTest})</h2>
          <button onClick={onClose} className={styles.modalCloseButton}>
            <X size={20} />
          </button>
        </div>
        {/* Modal Body */}
        <div className={styles.modalBody}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default QuizModal;