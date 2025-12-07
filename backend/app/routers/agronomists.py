from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_agronomist

router = APIRouter()

@router.get("/me", response_model=schemas.AgronomistResponse)
def get_agronomist_profile(agronomist: models.Agronomist = Depends(get_current_agronomist)):
    return agronomist

@router.put("/me", response_model=schemas.AgronomistResponse)
def update_agronomist_profile(
    agronomist_data: schemas.AgronomistCreate,
    agronomist: models.Agronomist = Depends(get_current_agronomist),
    db: Session = Depends(get_db)
):
    agronomist.company_name = agronomist_data.company_name
    agronomist.license_number = agronomist_data.license_number
    db.commit()
    db.refresh(agronomist)
    return agronomist

@router.get("/requests", response_model=List[schemas.TreatmentRequestResponse])
def get_my_requests(agronomist: models.Agronomist = Depends(get_current_agronomist)):
    return agronomist.requests

