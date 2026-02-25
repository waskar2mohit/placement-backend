import os
import json
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

class AIRecommendationService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not set. Please update your .env file.")
        
        # Configure the SDK
        genai.configure(api_key=self.api_key)
        
        # Use the latest and fastest model
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        logger.info("Using gemini-2.5-flash model")

    def _make_api_call(self, prompt_text):
        """Make API call using the official SDK with JSON mode"""
        try:
            # Generate with JSON response
            response = self.model.generate_content(
                prompt_text,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Parse the JSON response
            result = json.loads(response.text)
            return result
            
        except json.JSONDecodeError as json_err:
            logger.error(f"Failed to parse JSON response: {json_err}")
            logger.error(f"Raw response: {response.text if 'response' in locals() else 'No response'}")
            return None
        except Exception as e:
            logger.error(f"An error occurred during the API call: {e}")
            return None

    def generate_quiz(self, skills: str):
        """Generates a quiz by calling the AI directly."""
        prompt = f"""
You are an expert quiz generator. Based on these skills: "{skills}", create a simple multiple-choice quiz.

CRITICAL REQUIREMENTS:
1. Generate exactly 20 questions
2. Return ONLY valid JSON with this exact structure:
{{
  "quiz": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A"
    }}
  ]
}}
3. Do NOT include any markdown, explanations, or text outside the JSON
4. Each question must have exactly 4 options
5. The correct_answer must exactly match one of the options
"""
        response_data = self._make_api_call(prompt)
        if response_data and 'quiz' in response_data:
            return response_data['quiz']
        else:
            logger.error(f"Quiz generation failed. Response: {response_data}")
            return {"error": "Failed to generate the quiz from the AI service."}

    def get_recommendations(self, student_data, prediction_result):
        """Generates recommendations by calling the AI directly."""
        profile_summary = ", ".join([f"{key}: {value}" for key, value in student_data.iloc[0].to_dict().items()])
        prediction_text = "Placed" if prediction_result['prediction'] == 1 else "Not Placed"
        
        prompt = f"""
You are an expert career counselor. Analyze this student profile and prediction:

Profile: {profile_summary}
Placement Prediction: {prediction_text}

Provide a detailed career guidance report in JSON format with this exact structure:
{{
  "overall_assessment": "A 2-3 sentence summary of the student's overall profile",
  "key_strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areas_for_improvement": ["Area 1", "Area 2", "Area 3"],
  "personalized_message": "A personalized 3-4 sentence message with specific actionable advice"
}}

Return ONLY the JSON, no other text.
"""
        response_data = self._make_api_call(prompt)
        if response_data:
            return response_data
        else:
            return {
                "overall_assessment": "Unable to generate AI recommendations at this time.",
                "key_strengths": ["Your academic record shows dedication"],
                "areas_for_improvement": ["Continue building your project portfolio", "Practice technical interview questions"],
                "personalized_message": "Focus on strengthening your practical skills through projects and certifications. Stay consistent with your learning journey."
            }