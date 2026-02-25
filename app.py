from flask import Flask, request, render_template, jsonify
import pandas as pd
from dotenv import load_dotenv
import logging
from flask_cors import CORS # Import CORS

# Load environment variables from .env file FIRST
load_dotenv()

# We only need these two main service files
from ml_service import MLService
from ai_recommendation_service import AIRecommendationService

# --- Flask Setup ---
app = Flask(__name__) 
CORS(app) # Enable CORS for all routes

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Instantiate Services ---
try:
    ml_service = MLService()
    ai_service = AIRecommendationService()
    logger.info("Services initialized successfully.")
except Exception as e:
    logger.error(f"FATAL: Could not initialize services: {e}", exc_info=True)
    ml_service = None
    ai_service = None

# --- Utility Function ---
def safe_cast_to_dataframe(data_dict):
    """
    Converts the JSON dictionary from the form into a DataFrame.
    It will correctly handle all the new columns.
    """
    df = pd.DataFrame([data_dict])
    for col in df.columns:
        # This converts all form fields to numbers, which the model expects
        df[col] = pd.to_numeric(df[col], errors='coerce')
    return df

# --- API Routes ---

@app.route('/api/predict', methods=['POST'])
def api_predict():
    """
    This is the main prediction endpoint. It receives data from the
    React form, gets a prediction and recommendations, and returns
    it all as a JSON object.
    """
    if not ml_service or not ai_service:
        return jsonify({'error': 'ML or AI Service not available.'}), 503
    
    try:
        data_dict = request.get_json()
        if not data_dict:
            return jsonify({'error': 'No JSON data received.'}), 400
        
        logger.info(f"Received prediction request with data: {data_dict}")
        # This function now correctly handles all your form fields
        student_df = safe_cast_to_dataframe(data_dict.copy())
        
        # 1. Get ML Prediction
        prediction_data = ml_service.predict_placement(student_df)
        
        # 2. Get AI Recommendations (sends all form fields to the AI)
        recommendations = ai_service.get_recommendations(student_df, prediction_data)
        
        # 3. Format the response
        prediction_text = 'Placed' if prediction_data['prediction'] == 1 else 'Not Placed'
        confidence_score = f"{prediction_data['confidence_score']*100:.0f}"

        # Create the JSON response object that Results.jsx expects
        response_data = {
            'prediction': prediction_text,
            'confidence': confidence_score,
            'recommendations': recommendations  # This is the dictionary from ai_service
        }
        
        # *** THIS IS THE FIX ***
        # Return the JSON object instead of rendering a template
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"API Prediction endpoint failed: {e}", exc_info=True)
        return jsonify({'error': f"Prediction Failed: {e}"}), 500

@app.route('/api/generate_quiz', methods=['POST'])
def api_generate_quiz():
    """
    This endpoint generates the quiz based on user-input skills.
    """
    if not ai_service:
        return jsonify({'error': 'AI Service not available.'}), 503
    try:
        data = request.get_json()
        skills = data.get('skills', '')
        if not skills:
            return jsonify({'error': 'No skills provided.'}), 400
        
        logger.info(f"Generating quiz for skills: {skills}")
        quiz_data = ai_service.generate_quiz(skills) # This calls the AI
        
        # The AI service should return a list of question objects
        return jsonify(quiz_data)
    
    except Exception as e:
        logger.error(f"Quiz generation failed: {e}", exc_info=True)
        return jsonify({'error': 'Failed to generate quiz.'}), 500

# --- Main Execution ---
if __name__ == '__main__':
    # Runs the Flask server
    app.run(debug=True, port=5000)