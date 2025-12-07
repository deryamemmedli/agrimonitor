from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_farmer, get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.FieldResponse)
def create_field(
    field_data: schemas.FieldCreate,
    farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    db_field = models.Field(**field_data.dict(), farmer_id=farmer.id)
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field

@router.get("/", response_model=List[schemas.FieldResponse])
def get_all_fields(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has farmer profile
    farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
    # Check if user has agronomist profile
    agronomist = db.query(models.Agronomist).filter(models.Agronomist.user_id == current_user.id).first()
    
    # If user has farmer profile (and no agronomist profile), show only their fields
    if farmer and not agronomist:
        return farmer.fields
    # If user has agronomist profile (or both), show all fields
    elif agronomist:
        fields = db.query(models.Field).offset(skip).limit(limit).all()
        return fields
    # If user has neither profile, show all fields (for compatibility)
    else:
        fields = db.query(models.Field).offset(skip).limit(limit).all()
        return fields

@router.get("/{field_id}", response_model=schemas.FieldResponse)
def get_field(field_id: int, db: Session = Depends(get_db)):
    field = db.query(models.Field).filter(models.Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field

@router.put("/{field_id}", response_model=schemas.FieldResponse)
def update_field(
    field_id: int,
    field_data: schemas.FieldCreate,
    farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    field = db.query(models.Field).filter(models.Field.id == field_id, models.Field.farmer_id == farmer.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    for key, value in field_data.dict().items():
        setattr(field, key, value)
    
    db.commit()
    db.refresh(field)
    return field

@router.delete("/{field_id}")
def delete_field(
    field_id: int,
    farmer: models.Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    field = db.query(models.Field).filter(models.Field.id == field_id, models.Field.farmer_id == farmer.id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    db.delete(field)
    db.commit()
    return {"message": "Field deleted successfully"}

