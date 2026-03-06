from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Laptop
from schemas import LaptopDetail
from typing import List

router = APIRouter()


@router.get("/")
def compare(ids: str = Query(..., description="Comma-separated laptop IDs e.g. 1,2"), db: Session = Depends(get_db)):
    id_list = [int(i.strip()) for i in ids.split(",") if i.strip().isdigit()]
    if len(id_list) < 2:
        return {"error": "Please provide at least 2 laptop IDs"}

    laptops = db.query(Laptop).filter(Laptop.id.in_(id_list)).all()
    result = []
    for laptop in laptops:
        result.append({
            "id": laptop.id,
            "name": laptop.name,
            "brand": laptop.brand,
            "image_url": laptop.image_url,
            "specs": {
                "CPU": laptop.cpu,
                "GPU": laptop.gpu,
                "RAM": f"{laptop.ram_gb} GB",
                "Storage": f"{laptop.storage_gb} GB SSD",
                "Display": f"{laptop.display_inch}\" {laptop.display_type} {laptop.refresh_rate}Hz",
                "Weight": f"{laptop.weight_kg} kg",
                "Battery": f"{laptop.battery_wh} Wh",
                "Base Price": f"₹{laptop.base_price:,}",
            },
            "store_prices": [
                {"store": sp.store_name, "price": sp.price, "url": sp.url, "is_lowest": sp.is_lowest}
                for sp in laptop.store_prices
            ],
        })
    return result
