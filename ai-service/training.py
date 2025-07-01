import os
import pandas as pd
from pymongo import MongoClient
from sklearn.model_selection import StratifiedKFold, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
from features import extract_features

MONGO_URI = os.getenv('MONGO_URI')

def load_data():
    client = MongoClient(MONGO_URI)
    df = pd.DataFrame(client.creditbureau.clients.find())
    return df

def prepare_data(df):
    df = df.dropna(subset=["salary", "age", "credit_score", "total_debt", "payment_history", "decision"])
    X = df.apply(lambda row: extract_features(row.to_dict()), axis=1).tolist()
    y = df["decision"].tolist()
    return X, y

def train_with_cv_and_grid(X, y):
    base_model = RandomForestClassifier(random_state=42, class_weight="balanced")
    
    param_grid = {
        "n_estimators": [50, 100, 200],
        "max_depth": [None, 5, 10],
    }
    
 
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
 
    grid = GridSearchCV(
        estimator=base_model,
        param_grid=param_grid,
        cv=skf,
        scoring="f1_weighted", 
        n_jobs=-1
    )
    grid.fit(X, y)
    
    print("Best params:", grid.best_params_)
    print("Best CV score:", grid.best_score_)
    
    return grid.best_estimator_

def evaluate_and_save(model, X, y):
    preds = model.predict(X)
    print(classification_report(y, preds))
    joblib.dump(model, "model.joblib")
    print("Model saved as model.joblib")

if __name__ == "__main__":
    df = load_data()
    X, y = prepare_data(df)
    best_model = train_with_cv_and_grid(X, y)
    evaluate_and_save(best_model, X, y)
