from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Laptop
from schemas import RecommendationRequest, RecommendationResult, LaptopListItem
from recommendation import get_recommendations
from typing import List

router = APIRouter()


@router.post("/", response_model=List[dict])
def recommend(req: RecommendationRequest, db: Session = Depends(get_db)):
    laptops = db.query(Laptop).all()
    top = get_recommendations(laptops, req, top_n=5)

    results = []
    for laptop, score, breakdown in top:
        laptop_data = LaptopListItem.model_validate(laptop)
        results.append({
            "laptop": laptop_data.model_dump(),
            "score": score,
            "score_breakdown": breakdown,
        })
    return results
