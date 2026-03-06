from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Laptop, StorePrice, PriceHistory
from schemas import LaptopListItem, LaptopDetail, PriceHistorySchema
from recommendation import compute_performance_ratings

router = APIRouter()


@router.get("/", response_model=List[LaptopListItem])
def get_laptops(
    brand: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    usage: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Laptop)
    if brand:
        query = query.filter(Laptop.brand.ilike(f"%{brand}%"))
    if min_price:
        query = query.filter(Laptop.base_price >= min_price)
    if max_price:
        query = query.filter(Laptop.base_price <= max_price)
    laptops = query.all()
    return laptops


@router.get("/{laptop_id}", response_model=LaptopDetail)
def get_laptop(laptop_id: int, db: Session = Depends(get_db)):
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
    return laptop


@router.get("/{laptop_id}/price-history")
def get_price_history(laptop_id: int, db: Session = Depends(get_db)):
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
    history = (
        db.query(PriceHistory)
        .filter(PriceHistory.laptop_id == laptop_id)
        .order_by(PriceHistory.recorded_at)
        .all()
    )
    return [
        {"date": str(h.recorded_at), "price": h.price, "store": h.store_name}
        for h in history
    ]


@router.get("/{laptop_id}/ratings")
def get_ratings(laptop_id: int, db: Session = Depends(get_db)):
    laptop = db.query(Laptop).filter(Laptop.id == laptop_id).first()
    if not laptop:
        raise HTTPException(status_code=404, detail="Laptop not found")
    return compute_performance_ratings(laptop)
