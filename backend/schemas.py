from pydantic import BaseModel
from typing import Optional, List
import datetime


class StorePriceSchema(BaseModel):
    store_name: str
    price: int
    url: str
    is_lowest: bool

    class Config:
        from_attributes = True


class PriceHistorySchema(BaseModel):
    recorded_at: datetime.date
    price: int
    store_name: str

    class Config:
        from_attributes = True


class LaptopBase(BaseModel):
    id: int
    brand: str
    name: str
    image_url: str
    cpu: str
    cpu_score: int
    gpu: str
    gpu_score: int
    ram_gb: int
    storage_gb: int
    display_inch: float
    display_type: str
    refresh_rate: int
    weight_kg: float
    battery_wh: int
    battery_score: int
    thermal_score: int
    base_price: int
    description: str

    class Config:
        from_attributes = True


class LaptopListItem(LaptopBase):
    store_prices: List[StorePriceSchema] = []


class LaptopDetail(LaptopBase):
    store_prices: List[StorePriceSchema] = []
    price_history: List[PriceHistorySchema] = []


class RecommendationRequest(BaseModel):
    budget: int
    usage: str          # Gaming, AI/ML, Video Editing, Programming, Student
    cpu_pref: str       # Intel, Ryzen, Apple, No preference
    gpu_pref: str       # RTX 4050, RTX 4060, RTX 5060, No preference …
    gpu_mode: str = "minimum"  # "minimum" = at-or-above tier | "exact" = that gen only
    ram: int
    storage: int
    battery_priority: bool
    lightweight: bool


class RecommendationResult(BaseModel):
    laptop: LaptopListItem
    score: float
    score_breakdown: dict
