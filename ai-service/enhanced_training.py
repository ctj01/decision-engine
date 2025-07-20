import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def load_and_prepare_data(json_file='credit_data.json'):
    """
    Cargar y preparar los datos del archivo JSON
    """
    print("🔄 Cargando datos del archivo JSON...")
    
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    print(f"✅ Datos cargados: {len(df)} registros")
    
    return df

def create_target_variable(df):
    """
    Crear variable objetivo basada en reglas de negocio realistas
    """
    print("🎯 Creando variable objetivo...")
    
    def determine_decision(row):
        # Calcular ratio deuda-ingreso
        debt_to_income = row['total_debt'] / row['salary'] if row['salary'] > 0 else float('inf')
        
        # Analizar historial de pagos
        payment_history = row['payment_history']
        if payment_history:
            late_payments = sum(1 for p in payment_history if p['status'] == 'late')
            missed_payments = sum(1 for p in payment_history if p['status'] == 'missed')
            payment_score = (len(payment_history) - late_payments - missed_payments*2) / len(payment_history)
        else:
            payment_score = 0.5
        
        # Reglas de decisión mejoradas
        if (row['credit_score'] >= 700 and 
            debt_to_income <= 0.3 and 
            payment_score >= 0.8 and 
            row['salary'] >= 50000):
            return 'approve'
        elif (row['credit_score'] <= 500 or 
              debt_to_income >= 0.8 or 
              payment_score <= 0.3 or
              row['is_reported']):
            return 'reject'
        else:
            return 'pending'
    
    df['decision'] = df.apply(determine_decision, axis=1)
    
    # Mostrar distribución
    print("📊 Distribución de decisiones:")
    print(df['decision'].value_counts())
    print(f"Porcentajes: {df['decision'].value_counts(normalize=True) * 100}")
    
    return df

def engineer_features(df):
    """
    Ingeniería de características avanzada
    """
    print("🔧 Creando características avanzadas...")
    
    # Características básicas
    df['debt_to_income_ratio'] = df['total_debt'] / df['salary']
    df['log_salary'] = np.log1p(df['salary'])
    df['log_debt'] = np.log1p(df['total_debt'])
    
    # Características de historial de pagos
    def analyze_payment_history(payment_history):
        if not payment_history:
            return {
                'payment_score': 0.5,
                'late_payments': 0,
                'missed_payments': 0,
                'consecutive_on_time': 0,
                'payment_trend': 0
            }
        
        late_count = sum(1 for p in payment_history if p['status'] == 'late')
        missed_count = sum(1 for p in payment_history if p['status'] == 'missed')
        on_time_count = sum(1 for p in payment_history if p['status'] == 'on_time')
        
        # Score de pagos (0-1)
        payment_score = on_time_count / len(payment_history)
        
        # Tendencia de pagos (últimos vs primeros)
        recent_payments = payment_history[-3:] if len(payment_history) >= 3 else payment_history
        recent_on_time = sum(1 for p in recent_payments if p['status'] == 'on_time')
        recent_score = recent_on_time / len(recent_payments)
        
        # Pagos consecutivos a tiempo
        consecutive = 0
        for p in reversed(payment_history):
            if p['status'] == 'on_time':
                consecutive += 1
            else:
                break
        
        return {
            'payment_score': payment_score,
            'late_payments': late_count,
            'missed_payments': missed_count,
            'consecutive_on_time': consecutive,
            'recent_payment_score': recent_score,
            'payment_history_length': len(payment_history)
        }
    
    # Aplicar análisis de historial
    payment_features = df['payment_history'].apply(analyze_payment_history)
    payment_df = pd.DataFrame(payment_features.tolist())
    df = pd.concat([df, payment_df], axis=1)
    
    # Características categóricas
    df['employment_type_encoded'] = LabelEncoder().fit_transform(df['employment_type'])
    
    # Características de riesgo combinadas
    df['risk_score'] = (
        (1 - df['payment_score']) * 0.4 +
        df['debt_to_income_ratio'] * 0.3 +
        (800 - df['credit_score']) / 800 * 0.2 +
        df['is_reported'].astype(int) * 0.1
    )
    
    # Categorías de edad
    df['age_category'] = pd.cut(df['age'], 
                               bins=[0, 25, 35, 50, 65, 100], 
                               labels=['young', 'young_adult', 'middle', 'mature', 'senior'])
    
    # Categorías de salario
    df['salary_category'] = pd.cut(df['salary'], 
                                  bins=[0, 50000, 100000, 200000, float('inf')], 
                                  labels=['low', 'medium', 'high', 'very_high'])
    
    print("✅ Características creadas:")
    new_features = ['debt_to_income_ratio', 'payment_score', 'risk_score', 'age_category', 'salary_category']
    print(f"   {new_features}")
    
    return df

def prepare_features_for_training(df):
    """
    Preparar características para entrenamiento
    """
    print("📋 Preparando características para entrenamiento...")
    
    # Seleccionar características numéricas
    numeric_features = [
        'age', 'salary', 'credit_score', 'total_debt',
        'debt_to_income_ratio', 'log_salary', 'log_debt',
        'payment_score', 'late_payments', 'missed_payments',
        'consecutive_on_time', 'recent_payment_score',
        'payment_history_length', 'risk_score'
    ]
    
    # Características categóricas
    categorical_features = ['employment_type', 'age_category', 'salary_category']
    
    # Crear preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(drop='first'), categorical_features)
        ]
    )
    
    # Preparar X e y
    feature_columns = numeric_features + categorical_features + ['is_reported']
    X = df[feature_columns].copy()
    X['is_reported'] = X['is_reported'].astype(int)
    y = df['decision']
    
    return X, y, preprocessor, numeric_features, categorical_features

def train_multiple_models(X_train, X_test, y_train, y_test, preprocessor):
    """
    Entrenar múltiples modelos y seleccionar el mejor
    """
    print("🤖 Entrenando múltiples modelos...")
    
    models = {
        'RandomForest': Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', RandomForestClassifier(random_state=42, class_weight='balanced'))
        ]),
        'GradientBoosting': Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', GradientBoostingClassifier(random_state=42))
        ]),
        'LogisticRegression': Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', LogisticRegression(random_state=42, class_weight='balanced', max_iter=1000))
        ])
    }
    
    # Parámetros para GridSearch
    param_grids = {
        'RandomForest': {
            'classifier__n_estimators': [100, 200],
            'classifier__max_depth': [10, 20, None],
            'classifier__min_samples_split': [2, 5]
        },
        'GradientBoosting': {
            'classifier__n_estimators': [100, 200],
            'classifier__learning_rate': [0.1, 0.05],
            'classifier__max_depth': [3, 5]
        },
        'LogisticRegression': {
            'classifier__C': [0.1, 1, 10]
        }
    }
    
    best_score = 0
    best_model = None
    best_model_name = ""
    
    results = {}
    
    for name, model in models.items():
        print(f"   Entrenando {name}...")
        
        # GridSearch con validación cruzada
        grid_search = GridSearchCV(
            model, 
            param_grids[name], 
            cv=5, 
            scoring='f1_weighted',
            n_jobs=-1
        )
        
        grid_search.fit(X_train, y_train)
        
        # Evaluar en test
        y_pred = grid_search.predict(X_test)
        score = grid_search.score(X_test, y_test)
        
        results[name] = {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score': grid_search.best_score_,
            'test_score': score,
            'predictions': y_pred
        }
        
        print(f"   {name} - CV Score: {grid_search.best_score_:.3f}, Test Score: {score:.3f}")
        
        if grid_search.best_score_ > best_score:
            best_score = grid_search.best_score_
            best_model = grid_search.best_estimator_
            best_model_name = name
    
    print(f"🏆 Mejor modelo: {best_model_name} (Score: {best_score:.3f})")
    
    return best_model, best_model_name, results

def evaluate_model(model, X_test, y_test, model_name):
    """
    Evaluación detallada del modelo
    """
    print(f"📊 Evaluando modelo {model_name}...")
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)
    
    # Reporte de clasificación
    print("\n📋 Reporte de Clasificación:")
    print(classification_report(y_test, y_pred))
    
    # Matriz de confusión
    print("\n🔍 Matriz de Confusión:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    # ROC AUC para cada clase (one-vs-rest)
    try:
        auc_scores = {}
        classes = model.classes_
        for i, class_name in enumerate(classes):
            y_test_binary = (y_test == class_name).astype(int)
            y_pred_binary = y_pred_proba[:, i]
            auc = roc_auc_score(y_test_binary, y_pred_binary)
            auc_scores[class_name] = auc
        
        print("\n📈 ROC AUC Scores:")
        for class_name, auc in auc_scores.items():
            print(f"   {class_name}: {auc:.3f}")
    except Exception as e:
        print(f"No se pudo calcular ROC AUC: {e}")
    
    return y_pred, y_pred_proba

def get_feature_importance(model, feature_names):
    """
    Obtener importancia de características
    """
    try:
        if hasattr(model.named_steps['classifier'], 'feature_importances_'):
            # Para Random Forest y Gradient Boosting
            importances = model.named_steps['classifier'].feature_importances_
            
            # Obtener nombres de características después del preprocessing
            feature_names_transformed = model.named_steps['preprocessor'].get_feature_names_out()
            
            # Crear DataFrame de importancias
            importance_df = pd.DataFrame({
                'feature': feature_names_transformed,
                'importance': importances
            }).sort_values('importance', ascending=False)
            
            print("\n🔝 Top 10 Características más importantes:")
            print(importance_df.head(10))
            
            return importance_df
        else:
            print("El modelo no tiene feature_importances_")
            return None
    except Exception as e:
        print(f"Error al obtener importancia: {e}")
        return None

def main():
    """
    Función principal de entrenamiento
    """
    print("🚀 Iniciando entrenamiento avanzado del modelo de IA...")
    print("=" * 60)
    
    # 1. Cargar datos
    df = load_and_prepare_data()
    
    # 2. Crear variable objetivo
    df = create_target_variable(df)
    
    # 3. Ingeniería de características
    df = engineer_features(df)
    
    # 4. Preparar para entrenamiento
    X, y, preprocessor, numeric_features, categorical_features = prepare_features_for_training(df)
    
    # 5. Dividir datos
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"📊 Datos divididos: {len(X_train)} entrenamiento, {len(X_test)} prueba")
    
    # 6. Entrenar modelos
    best_model, best_model_name, results = train_multiple_models(
        X_train, X_test, y_train, y_test, preprocessor
    )
    
    # 7. Evaluación detallada
    y_pred, y_pred_proba = evaluate_model(best_model, X_test, y_test, best_model_name)
    
    # 8. Importancia de características
    all_features = numeric_features + categorical_features + ['is_reported']
    importance_df = get_feature_importance(best_model, all_features)
    
    # 9. Guardar modelo
    model_info = {
        'model': best_model,
        'model_name': best_model_name,
        'feature_names': all_features,
        'training_date': datetime.now().isoformat(),
        'test_score': results[best_model_name]['test_score'],
        'cv_score': results[best_model_name]['cv_score']
    }
    
    joblib.dump(model_info, 'models/enhanced_model.joblib')
    joblib.dump(best_model, 'model.joblib')  # Para compatibilidad
    
    print("\n💾 Modelo guardado como 'enhanced_model.joblib' y 'model.joblib'")
    print(f"✅ Entrenamiento completado. Precisión final: {results[best_model_name]['test_score']:.3f}")
    print("=" * 60)
    
    return best_model, model_info

if __name__ == "__main__":
    model, info = main()
