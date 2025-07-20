import requests
import json

# Prueba simple del modelo
data = {
    "age": 35,
    "salary": 8000000,
    "credit_score": 750,
    "employment_type": "employed",
    "total_debt": 1000000,
    "is_reported": False,
    "payment_history": [
        {"month": "2024-01", "status": "on_time"},
        {"month": "2024-02", "status": "on_time"},
        {"month": "2024-03", "status": "on_time"}
    ]
}

try:
    response = requests.post("http://localhost:8000/predict", json=data)
    if response.status_code == 200:
        result = response.json()
        print("✅ Predicción exitosa!")
        print(f"Decisión: {result['decision']}")
        print(f"Confianza: {result['confidence']:.1%}")
        print("Razones:")
        for reason in result['reasons']:
            print(f"  • {reason}")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
