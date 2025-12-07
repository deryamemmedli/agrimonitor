from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services.ndvi_service import NDVIService

router = APIRouter()

@router.get("/field/{field_id}", response_model=List[schemas.NDVIDataResponse])
def get_field_ndvi_data(
    field_id: int,
    db: Session = Depends(get_db)
):
    field = db.query(models.Field).filter(models.Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field.ndvi_data

@router.post("/field/{field_id}/fetch", response_model=schemas.NDVIDataResponse)
def fetch_ndvi_data(
    field_id: int,
    date: Optional[datetime] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    field = db.query(models.Field).filter(models.Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Use NDVI service to fetch data from Sentinel 2
    ndvi_service = NDVIService()
    ndvi_data = ndvi_service.fetch_ndvi_for_field(field, date)
    
    # Save to database
    db_ndvi = models.NDVIData(
        field_id=field.id,
        date=ndvi_data['date'],
        ndvi_value=ndvi_data['ndvi_value'],
        image_url=ndvi_data.get('image_url'),
        ndvi_metadata=ndvi_data.get('ndvi_metadata')
    )
    db.add(db_ndvi)
    db.commit()
    db.refresh(db_ndvi)
    return db_ndvi

@router.get("/map")
def get_ndvi_map_data(
    bounds: Optional[str] = None,  # Format: "min_lat,min_lon,max_lat,max_lon"
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get NDVI data for all fields in the map view
    """
    fields = db.query(models.Field).all()
    
    import json
    
    result = []
    for field in fields:
        latest_ndvi = db.query(models.NDVIData).filter(
            models.NDVIData.field_id == field.id
        ).order_by(models.NDVIData.date.desc()).first()
        
        # Parse metadata to check if real data was used
        is_real_data = False
        data_source = "unknown"
        if latest_ndvi and latest_ndvi.ndvi_metadata:
            try:
                metadata = json.loads(latest_ndvi.ndvi_metadata)
                is_real_data = metadata.get("is_real_data", False) or metadata.get("sentinel_data_available", False)
                data_source = metadata.get("source", "unknown")
            except:
                pass
        
        result.append({
            "field_id": field.id,
            "name": field.name,
            "latitude": field.latitude,
            "longitude": field.longitude,
            "area_hectares": field.area_hectares,
            "crop_type": field.crop_type,
            "polygon_coordinates": field.polygon_coordinates,
            "latest_ndvi": latest_ndvi.ndvi_value if latest_ndvi else None,
            "ndvi_date": latest_ndvi.date.isoformat() if latest_ndvi else None,
            "is_real_data": is_real_data,
            "data_source": data_source
        })
    
    return {"fields": result}

