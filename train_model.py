import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import joblib
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def train_and_save_model(data_path='main_expanded.csv', model_path='best_model.pkl', scaler_path='scaler.pkl', features_path='model_features.joblib'):
    """
    Performs a full workflow: encoding, training, and saving the model, scaler, AND feature list.
    """
    try:
        logging.info(f"Loading data from {data_path}...")
        df = pd.read_csv(data_path)
        df.columns = df.columns.str.strip()
        logging.info("Column names cleaned.")

        logging.info("Encoding categorical data...")
        df['Internship'] = df['Internship'].map({'Yes': 1, 'No': 0})
        df['Hackathon'] = df['Hackathon'].map({'Yes': 1, 'No': 0})
        df['PlacementStatus'] = df['PlacementStatus'].map({'Placed': 1, 'NotPlaced': 0})
        logging.info("Encoding complete.")
        
        features_to_drop = ['StudentId', 'PlacementStatus']
        X = df.drop(columns=features_to_drop)
        y = df['PlacementStatus']

        feature_columns = X.columns.tolist()
        logging.info(f"Model will be trained with features: {feature_columns}")

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        logging.info("Training the XGBoost model...")
        model = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
        model.fit(X_train_scaled, y_train)
        
        accuracy = accuracy_score(y_test, model.predict(X_test_scaled))
        logging.info(f"New model accuracy: {accuracy * 100:.2f}%")

        # Save the model, scaler, AND the list of feature columns
        joblib.dump(model, model_path)
        logging.info(f"Model saved to {model_path}")
        joblib.dump(scaler, scaler_path)
        logging.info(f"Scaler saved to {scaler_path}")
        joblib.dump(feature_columns, features_path) # <-- NEW STEP
        logging.info(f"Feature list saved to {features_path}")

    except Exception as e:
        logging.error(f"An unexpected error occurred during training: {e}", exc_info=True)

if __name__ == '__main__':
    train_and_save_model()

