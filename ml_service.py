import pandas as pd
import joblib
import numpy as np
import logging

logger = logging.getLogger(__name__)

class MLService:
    """
    Handles loading the ML model, scaler, and feature list for making predictions.
    """
    def __init__(self, model_path='best_model.pkl', scaler_path='scaler.pkl', features_path='model_features.joblib'):
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.feature_columns = joblib.load(features_path) # <-- DYNAMICALLY LOADED
            
            logger.info("ML model, scaler, and feature list loaded successfully.")
            logger.info(f"Expecting features: {self.feature_columns}")

        except FileNotFoundError as e:
            logger.error(f"Error loading model files: {e}. Please run train_model.py first.")
            raise e
        except Exception as e:
            logger.error(f"An unexpected error occurred during MLService initialization: {e}")
            raise e

    def predict_placement(self, student_data_df):
        """
        Predicts placement for a student after scaling and ordering the data correctly.
        """
        try:
            # Ensure the dataframe has columns in the exact trained order
            student_data_df = student_data_df[self.feature_columns]
            
            scaled_data = self.scaler.transform(student_data_df)
            
            prediction = self.model.predict(scaled_data)
            probabilities = self.model.predict_proba(scaled_data)[0]
            confidence_score = np.max(probabilities)
            
            result = {
                'prediction': int(prediction[0]),
                'confidence_score': float(confidence_score)
            }
            logger.info(f"Prediction successful: {result}")
            return result

        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            return {'prediction': 0, 'confidence_score': 0.0}

    

