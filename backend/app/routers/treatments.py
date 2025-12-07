from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_agronomist, get_current_farmer, get_current_user
from app.models import TreatmentStatus, RequestStatus

router = APIRouter()

@router.get("/", response_model=List[schemas.TreatmentResponse])
def get_treatments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    
    if current_user.role == models.UserRole.FARMER:
        farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        # Get treatments for farmer's fields
        treatments = db.query(models.Treatment).join(models.TreatmentRequest).join(models.Field).filter(
            models.Field.farmer_id == farmer.id
        ).options(joinedload(models.Treatment.request)).all()
    else:
        agronomist = db.query(models.Agronomist).filter(models.Agronomist.user_id == current_user.id).first()
        if not agronomist:
            raise HTTPException(status_code=404, detail="Agronomist profile not found")
        # Get treatments for agronomist's requests
        treatments = db.query(models.Treatment).join(models.TreatmentRequest).filter(
            models.TreatmentRequest.agronomist_id == agronomist.id
        ).options(joinedload(models.Treatment.request)).all()
    
    # Convert to response format with before_ndvi_value
    result = []
    for treatment in treatments:
        treatment_dict = {
            "id": treatment.id,
            "request_id": treatment.request_id,
            "status": treatment.status,
            "scheduled_date": treatment.scheduled_date,
            "completed_date": treatment.completed_date,
            "after_ndvi_value": treatment.after_ndvi_value,
            "improvement_percentage": treatment.improvement_percentage,
            "treatment_type": treatment.treatment_type,
            "notes": treatment.notes,
            "agronomist_confirmed": treatment.agronomist_confirmed,
            "farmer_confirmed": treatment.farmer_confirmed,
            "created_at": treatment.created_at,
            "before_ndvi_value": treatment.request.before_ndvi_value if treatment.request else None
        }
        result.append(schemas.TreatmentResponse(**treatment_dict))
    return result

@router.get("/{treatment_id}", response_model=schemas.TreatmentResponse)
def get_treatment(treatment_id: int, db: Session = Depends(get_db)):
    treatment = db.query(models.Treatment).filter(models.Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return treatment

@router.put("/{treatment_id}/start", response_model=schemas.TreatmentResponse)
def start_treatment(
    treatment_id: int,
    agronomist: models.Agronomist = Depends(get_current_agronomist),
    db: Session = Depends(get_db)
):
    treatment = db.query(models.Treatment).join(models.TreatmentRequest).filter(
        models.Treatment.id == treatment_id,
        models.TreatmentRequest.agronomist_id == agronomist.id
    ).first()
    
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    
    treatment.status = TreatmentStatus.IN_PROGRESS
    db.commit()
    db.refresh(treatment)
    return treatment

@router.put("/{treatment_id}/complete", response_model=schemas.TreatmentResponse)
def complete_treatment(
    treatment_id: int,
    treatment_data: schemas.TreatmentBase,
    agronomist: models.Agronomist = Depends(get_current_agronomist),
    db: Session = Depends(get_db)
):
    treatment = db.query(models.Treatment).join(models.TreatmentRequest).filter(
        models.Treatment.id == treatment_id,
        models.TreatmentRequest.agronomist_id == agronomist.id
    ).first()
    
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    
    treatment.status = TreatmentStatus.COMPLETED
    treatment.completed_date = datetime.utcnow()
    if treatment_data.treatment_type:
        treatment.treatment_type = treatment_data.treatment_type
    if treatment_data.notes:
        treatment.notes = treatment_data.notes
    
    db.commit()
    db.refresh(treatment)
    return treatment

@router.put("/{treatment_id}/verify", response_model=schemas.TreatmentResponse)
def verify_treatment(
    treatment_id: int,
    after_ndvi_value: float,
    agronomist: models.Agronomist = Depends(get_current_agronomist),
    db: Session = Depends(get_db)
):
    treatment = db.query(models.Treatment).join(models.TreatmentRequest).filter(
        models.Treatment.id == treatment_id,
        models.TreatmentRequest.agronomist_id == agronomist.id
    ).first()
    
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    
    # Calculate improvement percentage
    before_ndvi = treatment.request.before_ndvi_value
    improvement = ((after_ndvi_value - before_ndvi) / before_ndvi) * 100
    
    treatment.after_ndvi_value = after_ndvi_value
    treatment.improvement_percentage = improvement
    treatment.agronomist_confirmed = True
    treatment.status = TreatmentStatus.VERIFIED
    
    # Update request status
    treatment.request.status = RequestStatus.COMPLETED
    
    db.commit()
    db.refresh(treatment)
    return treatment

@router.put("/{treatment_id}/farmer-confirm", response_model=schemas.TreatmentResponse)
def farmer_confirm_treatment(
    treatment_id: int,
    farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    treatment = db.query(models.Treatment).join(models.TreatmentRequest).join(models.Field).filter(
        models.Treatment.id == treatment_id,
        models.Field.farmer_id == farmer.id
    ).first()
    
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    
    treatment.farmer_confirmed = True
    db.commit()
    db.refresh(treatment)
    return treatment

