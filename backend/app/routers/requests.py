from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_agronomist, get_current_farmer, get_current_user
from app.models import RequestStatus

router = APIRouter()

@router.post("/", response_model=schemas.TreatmentRequestResponse)
def create_treatment_request(
    request_data: schemas.TreatmentRequestCreate,
    agronomist: models.Agronomist = Depends(get_current_agronomist),
    db: Session = Depends(get_db)
):
    # Verify field exists
    field = db.query(models.Field).filter(models.Field.id == request_data.field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    db_request = models.TreatmentRequest(
        **request_data.dict(),
        agronomist_id=agronomist.id,
        status=RequestStatus.PENDING
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/", response_model=List[schemas.TreatmentRequestResponse])
def get_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == models.UserRole.FARMER:
        farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        # Get requests for farmer's fields
        requests = db.query(models.TreatmentRequest).join(models.Field).filter(
            models.Field.farmer_id == farmer.id
        ).all()
        return requests
    else:
        agronomist = db.query(models.Agronomist).filter(models.Agronomist.user_id == current_user.id).first()
        if not agronomist:
            raise HTTPException(status_code=404, detail="Agronomist profile not found")
        return agronomist.requests

@router.get("/{request_id}", response_model=schemas.TreatmentRequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db)):
    request = db.query(models.TreatmentRequest).filter(models.TreatmentRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request

@router.post("/{request_id}/accept", response_model=schemas.TreatmentRequestResponse)
def accept_request(
    request_id: int,
    farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    request = db.query(models.TreatmentRequest).join(models.Field).filter(
        models.TreatmentRequest.id == request_id,
        models.Field.farmer_id == farmer.id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Request is not pending")
    
    request.status = RequestStatus.ACCEPTED
    request.accepted_at = datetime.utcnow()
    
    # Create treatment record
    treatment = models.Treatment(
        request_id=request.id,
        status=models.TreatmentStatus.SCHEDULED
    )
    db.add(treatment)
    db.commit()
    db.refresh(request)
    return request

@router.post("/{request_id}/reject", response_model=schemas.TreatmentRequestResponse)
def reject_request(
    request_id: int,
    farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    request = db.query(models.TreatmentRequest).join(models.Field).filter(
        models.TreatmentRequest.id == request_id,
        models.Field.farmer_id == farmer.id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Request is not pending")
    
    request.status = RequestStatus.REJECTED
    db.commit()
    db.refresh(request)
    return request

@router.delete("/{request_id}")
def delete_request(
    request_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == models.UserRole.FARMER:
        farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        request = db.query(models.TreatmentRequest).join(models.Field).filter(
            models.TreatmentRequest.id == request_id,
            models.Field.farmer_id == farmer.id
        ).first()
    else:
        agronomist = db.query(models.Agronomist).filter(models.Agronomist.user_id == current_user.id).first()
        if not agronomist:
            raise HTTPException(status_code=404, detail="Agronomist profile not found")
        request = db.query(models.TreatmentRequest).filter(
            models.TreatmentRequest.id == request_id,
            models.TreatmentRequest.agronomist_id == agronomist.id
        ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if request has associated treatment
    if request.treatment:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete request with associated treatment. Delete the treatment first."
        )
    
    db.delete(request)
    db.commit()
    return {"message": "Request deleted successfully"}

