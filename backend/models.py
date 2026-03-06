from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime


class Laptop(Base):
    __tablename__ = "laptops"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, index=True)
    name = Column(String, index=True)
    image_url = Column(String)
    cpu = Column(String)
    cpu_score = Column(Integer)
    gpu = Column(String)
    gpu_score = Column(Integer)
    ram_gb = Column(Integer)
    storage_gb = Column(Integer)
    display_inch = Column(Float)
    display_type = Column(String)
    refresh_rate = Column(Integer)
    weight_kg = Column(Float)
    battery_wh = Column(Integer)
    battery_score = Column(Integer)
    thermal_score = Column(Integer)
    base_price = Column(Integer)
    description = Column(Text)

    store_prices = relationship("StorePrice", back_populates="laptop", cascade="all, delete-orphan")
    price_history = relationship("PriceHistory", back_populates="laptop", cascade="all, delete-orphan")


class StorePrice(Base):
    __tablename__ = "store_prices"

    id = Column(Integer, primary_key=True, index=True)
    laptop_id = Column(Integer, ForeignKey("laptops.id"))
    store_name = Column(String)
    price = Column(Integer)
    url = Column(String)
    is_lowest = Column(Boolean, default=False)
    scraped_at = Column(DateTime, default=datetime.datetime.utcnow)

    laptop = relationship("Laptop", back_populates="store_prices")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    laptop_id = Column(Integer, ForeignKey("laptops.id"))
    store_name = Column(String)
    price = Column(Integer)
    recorded_at = Column(Date, default=datetime.date.today)

    laptop = relationship("Laptop", back_populates="price_history")
