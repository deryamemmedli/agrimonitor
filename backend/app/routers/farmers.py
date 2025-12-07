from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_farmer

router = APIRouter()

@router.get("/me", response_model=schemas.FarmerResponse)
def get_farmer_profile(farmer: models.Farmer = Depends(get_current_farmer)):
    return farmer

@router.put("/me", response_model=schemas.FarmerResponse)
def update_farmer_profile(
    farmer_data: schemas.FarmerCreate,
    farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    farmer.farm_name = farmer_data.farm_name
    farmer.address = farmer_data.address
    db.commit()
    db.refresh(farmer)
    return farmer

@router.get("/fields", response_model=List[schemas.FieldResponse])
def get_my_fields(farmer: models.Farmer = Depends(get_current_farmer), db: Session = Depends(get_db)):
    return farmer.fields

