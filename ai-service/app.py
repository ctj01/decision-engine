from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import joblib
import pandas as pd
from enhanced_features import prepare_features_for_prediction, extract_features_enhanced
from jose import jwt, JWTError
import requests
import os
import logging
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
import numpy as np

# ————— Logging setup —————
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ————— Enhanced Prometheus metrics —————
REQUEST_COUNT = Counter(
    "http_requests_total", "Total HTTP requests",
    ["method", "endpoint", "http_status"]
)
REQUEST_LATENCY = Histogram(
    "http_request_latency_seconds", "Latency of HTTP requests",
    ["method", "endpoint"]
)
AI_DECISIONS = Counter(
    "ai_decisions_total", "Total AI decisions made",
    ["decision_type", "confidence_level"]
)
MODEL_PREDICTION_TIME = Histogram(
    "model_prediction_seconds", "Time taken for model prediction"
)

# ————— App and security setup —————
app = FastAPI(
    title="AI Decision Service",
    description="Intelligent loan decision making service with enhanced ML models",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Load enhanced model
try:
    enhanced_model_info = joblib.load('enhanced_model.joblib')
    model = enhanced_model_info['model']
    model_name = enhanced_model_info['model_name']
    logger.info(f"✅ Enhanced model loaded: {model_name}")
    logger.info(f"   Training date: {enhanced_model_info['training_date']}")
    logger.info(f"   Test score: {enhanced_model_info['test_score']:.3f}")
except Exception as e:
    logger.warning(f"⚠️ Enhanced model not found, loading fallback model: {e}")
    model = joblib.load('model.joblib')
    model_name = "fallback"

# ————— OIDC setup —————
IDENTITY_SERVER_URL = os.getenv('IDENTITY_SERVER_URL', 'http://identity-server.local')
ALGORITHMS = ['RS256']
oidc_config = requests.get(f"{IDENTITY_SERVER_URL}/.well-known/openid-configuration").json()
jwks_uri = oidc_config['jwks_uri']
jwks = requests.get(jwks_uri).json()

# ————— Middleware para métricas —————
@app.middleware("http")
async def metrics_middleware(request, call_next):
    method = request.method
    endpoint = request.url.path
    with REQUEST_LATENCY.labels(method=method, endpoint=endpoint).time():
        response = await call_next(request)
    REQUEST_COUNT.labels(
        method=method, endpoint=endpoint, http_status=response.status_code
    ).inc()
    return response

# ————— Endpoint de métricas —————
@app.get("/metrics")
async def metrics():
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)

# ————— Endpoint de salud —————
@app.get("/health")
async def health():
    """
    Endpoint de verificación de salud del servicio
    """
    return {
        "status": "healthy",
        "service": "AI Decision Service",
        "version": "2.0.0",
        "model": model_name,
        "timestamp": datetime.now().isoformat()
    }

# ————— Modelos Pydantic —————
class PredictRequest(BaseModel):
    salary: float
    age: int
    credit_score: int
    total_debt: float
    payment_history: list[dict]
    employment_type: str = "employed"  # Valores válidos: 'employed', 'self_employed'
    is_reported: bool = False

class PredictResponse(BaseModel):
    decision: str
    reasons: list[str]
    confidence: float

# ————— Verificación de token —————
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token header')

    rsa_key = {}
    for key in jwks['keys']:
        if key['kid'] == unverified_header.get('kid'):
            rsa_key = {
                'kty': key['kty'],
                'kid': key['kid'],
                'use': key['use'],
                'n': key['n'],
                'e': key['e']
            }
    if not rsa_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Appropriate key not found')

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=None,
            options={'verify_aud': False}
        )
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

    return payload

# ————— Endpoint de predicción mejorado —————
@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest):
    """
    Predicción usando el modelo mejorado con características avanzadas
    """
    start_time = datetime.now()
    
    try:
        raw = req.dict()
        
        # Preparar características usando el nuevo sistema
        features_df = prepare_features_for_prediction(raw)
        
        # Realizar predicción
        with MODEL_PREDICTION_TIME.time():
            prediction = model.predict(features_df)[0]
            prediction_proba = model.predict_proba(features_df)[0]
        
        # Obtener confianza
        confidence = float(np.max(prediction_proba))
        
        # Extraer características para análisis de razones
        features_dict = extract_features_enhanced(raw)
        reasons = generate_decision_reasons(prediction, features_dict, confidence)
        
        # Métricas
        confidence_level = "high" if confidence > 0.8 else "medium" if confidence > 0.6 else "low"
        AI_DECISIONS.labels(decision_type=prediction, confidence_level=confidence_level).inc()
        
        # Log de la decisión
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Prediction: {prediction} (confidence: {confidence:.3f}, time: {processing_time:.3f}s)")
        
        return PredictResponse(
            decision=prediction, 
            reasons=reasons, 
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        AI_DECISIONS.labels(decision_type="error", confidence_level="none").inc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

def generate_decision_reasons(decision: str, features: Dict[str, Any], confidence: float) -> List[str]:
    """
    Generar razones explicativas para la decisión basadas en las características
    """
    reasons = []
    
    # Características principales
    credit_score = features.get('credit_score', 500)
    debt_to_income = features.get('debt_to_income_ratio', 0.5)
    payment_score = features.get('payment_score', 0.5)
    risk_score = features.get('risk_score', 0.5)
    salary = features.get('salary', 50000)
    age = features.get('age', 30)
    
    if decision == 'approve':
        if credit_score >= 700:
            reasons.append(f'Excelente puntaje crediticio ({credit_score})')
        if debt_to_income <= 0.3:
            reasons.append(f'Ratio deuda-ingreso favorable ({debt_to_income:.1%})')
        if payment_score >= 0.8:
            reasons.append(f'Historial de pagos excelente ({payment_score:.1%} puntual)')
        if salary >= 100000:
            reasons.append(f'Ingresos altos (${salary:,.0f})')
        if risk_score <= 0.3:
            reasons.append('Perfil de bajo riesgo')
            
    elif decision == 'pending':
        if 500 <= credit_score < 700:
            reasons.append(f'Puntaje crediticio moderado ({credit_score})')
        if 0.3 < debt_to_income <= 0.6:
            reasons.append(f'Ratio deuda-ingreso moderado ({debt_to_income:.1%})')
        if 0.5 <= payment_score < 0.8:
            reasons.append('Historial de pagos mixto')
        if confidence < 0.7:
            reasons.append('Requiere evaluación manual adicional')
        if 0.3 < risk_score <= 0.6:
            reasons.append('Perfil de riesgo medio')
            
    else:  # reject
        if credit_score < 500:
            reasons.append(f'Puntaje crediticio bajo ({credit_score})')
        if debt_to_income > 0.6:
            reasons.append(f'Ratio deuda-ingreso alto ({debt_to_income:.1%})')
        if payment_score < 0.5:
            reasons.append('Historial de pagos problemático')
        if features.get('is_reported', False):
            reasons.append('Reportado en centrales de riesgo')
        if risk_score > 0.6:
            reasons.append('Perfil de alto riesgo')
        if features.get('late_payments', 0) > 2:
            reasons.append('Múltiples pagos tardíos')
    
    # Agregar información de confianza
    if confidence >= 0.9:
        reasons.append(f'Alta confianza en la decisión ({confidence:.1%})')
    elif confidence < 0.6:
        reasons.append(f'Decisión con incertidumbre ({confidence:.1%})')
    
    return reasons[:5]  # Limitar a 5 razones principales
