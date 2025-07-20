import numpy as np
from datetime import datetime
from typing import Dict, List, Any
import pandas as pd

def compute_dti(total_debt: float, salary: float) -> float:
    """Calcular ratio deuda-ingreso"""
    return total_debt / salary if salary > 0 else float('inf')

def compute_avg_delay(payment_history: List[Dict]) -> float:
    """Calcular promedio de retrasos en pagos"""
    if not payment_history:
        return 0.5  # Neutral si no hay historial
    
    statuses = [1 if p['status'] == 'late' else 0 for p in payment_history]
    return sum(statuses) / len(statuses)

def analyze_payment_history(payment_history: List[Dict]) -> Dict[str, float]:
    """Análisis completo del historial de pagos"""
    if not payment_history:
        return {
            'payment_score': 0.5,
            'late_payments': 0,
            'missed_payments': 0,
            'consecutive_on_time': 0,
            'recent_payment_score': 0.5,
            'payment_history_length': 0
        }
    
    late_count = sum(1 for p in payment_history if p['status'] == 'late')
    missed_count = sum(1 for p in payment_history if p['status'] == 'missed')
    on_time_count = sum(1 for p in payment_history if p['status'] == 'on_time')
    
    # Score de pagos (0-1)
    payment_score = on_time_count / len(payment_history)
    
    # Tendencia de pagos recientes
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

def calculate_risk_score(data: Dict[str, Any]) -> float:
    """Calcular score de riesgo combinado"""
    payment_analysis = analyze_payment_history(data.get('payment_history', []))
    debt_to_income = compute_dti(data.get('total_debt', 0), data.get('salary', 1))
    
    risk_score = (
        (1 - payment_analysis['payment_score']) * 0.4 +
        min(debt_to_income, 2.0) / 2.0 * 0.3 +  # Cap DTI at 200%
        (800 - min(data.get('credit_score', 300), 800)) / 800 * 0.2 +
        float(data.get('is_reported', False)) * 0.1
    )
    
    return min(risk_score, 1.0)  # Cap at 1.0

def categorize_age(age: int) -> str:
    """Categorizar edad"""
    if age <= 25:
        return 'young'
    elif age <= 35:
        return 'young_adult'
    elif age <= 50:
        return 'middle'
    elif age <= 65:
        return 'mature'
    else:
        return 'senior'

def categorize_salary(salary: float) -> str:
    """Categorizar salario"""
    if salary <= 50000:
        return 'low'
    elif salary <= 100000:
        return 'medium'
    elif salary <= 200000:
        return 'high'
    else:
        return 'very_high'

def encode_employment_type(employment_type: str) -> int:
    """Codificar tipo de empleo"""
    mapping = {
        'employed': 1,
        'self_employed': 2,
        'unemployed': 0,
        'student': 0,
        'retired': 1
    }
    return mapping.get(employment_type.lower(), 0)

def extract_features_enhanced(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extraer todas las características para el modelo mejorado
    """
    # Características básicas
    age = raw.get('age', 30)
    salary = raw.get('salary', 50000)
    credit_score = raw.get('credit_score', 500)
    total_debt = raw.get('total_debt', 0)
    employment_type = raw.get('employment_type', 'employed')
    is_reported = raw.get('is_reported', False)
    payment_history = raw.get('payment_history', [])
    
    # Análisis de historial de pagos
    payment_analysis = analyze_payment_history(payment_history)
    
    # Características derivadas
    debt_to_income_ratio = compute_dti(total_debt, salary)
    log_salary = np.log1p(salary)
    log_debt = np.log1p(total_debt)
    risk_score = calculate_risk_score(raw)
    
    # Categorías
    age_category = categorize_age(age)
    salary_category = categorize_salary(salary)
    employment_encoded = encode_employment_type(employment_type)
    
    # Retornar todas las características
    features = {
        # Características numéricas básicas
        'age': age,
        'salary': salary,
        'credit_score': credit_score,
        'total_debt': total_debt,
        'is_reported': int(is_reported),
        
        # Características derivadas
        'debt_to_income_ratio': debt_to_income_ratio,
        'log_salary': log_salary,
        'log_debt': log_debt,
        'risk_score': risk_score,
        
        # Características de historial de pagos
        'payment_score': payment_analysis['payment_score'],
        'late_payments': payment_analysis['late_payments'],
        'missed_payments': payment_analysis['missed_payments'],
        'consecutive_on_time': payment_analysis['consecutive_on_time'],
        'recent_payment_score': payment_analysis['recent_payment_score'],
        'payment_history_length': payment_analysis['payment_history_length'],
        
        # Características categóricas
        'employment_type': employment_type,
        'age_category': age_category,
        'salary_category': salary_category
    }
    
    return features

def extract_features(raw: Dict[str, Any]) -> List[float]:
    """
    Función original mantenida para compatibilidad
    """
    payment_history = raw.get('payment_history', [])
    
    return [
        raw.get('salary', 50000),
        raw.get('age', 30),
        raw.get('credit_score', 500),
        compute_dti(raw.get('total_debt', 0), raw.get('salary', 50000)),
        compute_avg_delay(payment_history),
    ]

def prepare_features_for_prediction(raw: Dict[str, Any]) -> pd.DataFrame:
    """
    Preparar características en el formato esperado por el modelo mejorado
    """
    features = extract_features_enhanced(raw)
    
    # Crear DataFrame con una sola fila
    df = pd.DataFrame([features])
    
    # Reordenar columnas en el orden esperado por el modelo
    expected_columns = [
        'age', 'salary', 'credit_score', 'total_debt',
        'debt_to_income_ratio', 'log_salary', 'log_debt',
        'payment_score', 'late_payments', 'missed_payments',
        'consecutive_on_time', 'recent_payment_score',
        'payment_history_length', 'risk_score',
        'employment_type', 'age_category', 'salary_category',
        'is_reported'
    ]
    
    # Asegurar que todas las columnas estén presentes
    for col in expected_columns:
        if col not in df.columns:
            if col in ['employment_type', 'age_category', 'salary_category']:
                df[col] = 'unknown'
            else:
                df[col] = 0
    
    return df[expected_columns]
