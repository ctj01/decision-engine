from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import joblib
from features import extract_features, compute_dti, compute_avg_delay
from jose import jwt, JWTError
import requests
import os

# ————— Prometheus metrics —————
REQUEST_COUNT = Counter(
    "http_requests_total", "Total HTTP requests",
    ["method", "endpoint", "http_status"]
)
REQUEST_LATENCY = Histogram(
    "http_request_latency_seconds", "Latency of HTTP requests",
    ["method", "endpoint"]
)

# ————— App and security setup —————
app = FastAPI()
security = HTTPBearer()
model = joblib.load('model.joblib')

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

# ————— Modelos Pydantic —————
class PredictRequest(BaseModel):
    salary: float
    age: int
    credit_score: int
    total_debt: float
    payment_history: list[dict]

class PredictResponse(BaseModel):
    decision: str
    reasons: list[str]

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

# ————— Endpoint de predicción —————
@app.post('/predict', response_model=PredictResponse, dependencies=[Depends(verify_token)])
def predict(req: PredictRequest):
    raw = req.dict()
    features = extract_features(raw)
    pred = model.predict([features])[0]

    reasons: list[str] = []
    dti = compute_dti(raw['total_debt'], raw['salary'])
    avg_delay = compute_avg_delay(raw['payment_history'])

    if pred == 'approve':
        if raw['credit_score'] > 600:
            reasons.append('High credit score')
        if dti < 0.4:
            reasons.append('Low debt-to-income ratio')
        if avg_delay == 0:
            reasons.append('No late payments')
    elif pred == 'pending':
        reasons.append('Moderate credit score')
        if avg_delay > 0:
            reasons.append('Some late payments')
    else:
        if raw['credit_score'] < 400:
            reasons.append('Low credit score')
        if dti > 1.0:
            reasons.append('High debt-to-income ratio')
        if avg_delay > 0:
            reasons.append('Late payments detected')

    return PredictResponse(decision=pred, reasons=reasons)
