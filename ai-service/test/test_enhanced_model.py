#!/usr/bin/env python3
"""
Script de prueba para el modelo de IA mejorado
"""

import requests
import json

def test_enhanced_ai_service():
    """
    Probar el servicio de IA mejorado con diferentes casos
    """
    base_url = "http://localhost:8000"
    
    # Casos de prueba
    test_cases = [
        {
            "name": "Cliente Premium - Debería APROBAR",
            "data": {
                "age": 35,
                "salary": 8000000,  # Salario alto en el rango de entrenamiento
                "credit_score": 750,
                "employment_type": "employed",
                "total_debt": 1000000,  # Deuda proporcional
                "is_reported": False,
                "payment_history": [
                    {"month": "2024-01", "status": "on_time"},
                    {"month": "2024-02", "status": "on_time"},
                    {"month": "2024-03", "status": "on_time"},
                    {"month": "2024-04", "status": "on_time"},
                    {"month": "2024-05", "status": "on_time"},
                    {"month": "2024-06", "status": "on_time"}
                ]
            }
        },
        {
            "name": "Cliente Riesgoso - Debería RECHAZAR",
            "data": {
                "age": 25,
                "salary": 1000000,  # Salario bajo en el rango de entrenamiento
                "credit_score": 450,
                "employment_type": "self_employed",
                "total_debt": 900000,  # Deuda alta relativa al ingreso
                "is_reported": True,
                "payment_history": [
                    {"month": "2024-01", "status": "late"},
                    {"month": "2024-02", "status": "missed"},
                    {"month": "2024-03", "status": "late"},
                    {"month": "2024-04", "status": "on_time"},
                    {"month": "2024-05", "status": "late"},
                    {"month": "2024-06", "status": "missed"}
                ]
            }
        },
        {
            "name": "Cliente Moderado - Podría ser PENDIENTE",
            "data": {
                "age": 40,
                "salary": 5000000,  # Salario medio en el rango de entrenamiento
                "credit_score": 620,
                "employment_type": "employed",
                "total_debt": 2000000,  # Deuda moderada
                "is_reported": False,
                "payment_history": [
                    {"month": "2024-01", "status": "on_time"},
                    {"month": "2024-02", "status": "late"},
                    {"month": "2024-03", "status": "on_time"},
                    {"month": "2024-04", "status": "on_time"},
                    {"month": "2024-05", "status": "late"},
                    {"month": "2024-06", "status": "on_time"}
                ]
            }
        }
    ]
    
    print("🧪 Probando el servicio de IA mejorado...")
    print("=" * 60)
    
    # Verificar salud del servicio
    try:
        health_response = requests.get(f"{base_url}/health")
        if health_response.status_code == 200:
            print("✅ Servicio de IA está funcionando")
        else:
            print("❌ Error en el servicio de IA")
            return
    except Exception as e:
        print(f"❌ No se puede conectar al servicio: {e}")
        return
    
    # Probar cada caso
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 Caso {i}: {test_case['name']}")
        print("-" * 40)
        
        try:
            # Hacer predicción
            response = requests.post(
                f"{base_url}/predict",
                json=test_case['data'],
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"📊 Decisión: {result['decision'].upper()}")
                print(f"🎯 Confianza: {result['confidence']:.1%}")
                print("💡 Razones:")
                for reason in result['reasons']:
                    print(f"   • {reason}")
            elif response.status_code == 401:
                print("🔐 Error de autenticación - probando sin token")
                # Intentar sin autenticación si está configurado así
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error al hacer la predicción: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Pruebas completadas!")

if __name__ == "__main__":
    test_enhanced_ai_service()
