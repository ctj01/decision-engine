
from datetime import datetime

def compute_dti(total_debt: float, salary: float) -> float:
    return total_debt / salary if salary else 0.0

def compute_avg_delay(payment_history: list[dict]) -> float:
    # on_time=0, late=1
    statuses = [1 if p['status']=='late' else 0 for p in payment_history]
    return sum(statuses) / len(statuses) if statuses else 0.0

def extract_features(raw: dict) -> list[float]:
    return [
        raw['salary'],                           
        raw['age'],
        raw['credit_score'],                    
        compute_dti(raw['total_debt'], raw['salary']),
        compute_avg_delay(raw['payment_history']),
    ]
