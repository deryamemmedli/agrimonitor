from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, RequestStatus, TreatmentStatus

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: int
    phone: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Farmer schemas
class FarmerBase(BaseModel):
    farm_name: Optional[str] = None
    address: Optional[str] = None

class FarmerCreate(FarmerBase):
    pass

class FarmerResponse(FarmerBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Agronomist schemas
class AgronomistBase(BaseModel):
    company_name: Optional[str] = None
    license_number: Optional[str] = None

class AgronomistCreate(AgronomistBase):
    pass

class AgronomistResponse(AgronomistBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Field schemas
class FieldBase(BaseModel):
    name: str
    area_hectares: float
    crop_type: Optional[str] = None
    latitude: float
    longitude: float
    polygon_coordinates: Optional[str] = None

class FieldCreate(FieldBase):
    pass

class FieldResponse(FieldBase):
    id: int
    farmer_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# NDVI schemas
class NDVIDataBase(BaseModel):
    date: datetime
    ndvi_value: float
    image_url: Optional[str] = None
    ndvi_metadata: Optional[str] = None

class NDVIDataCreate(NDVIDataBase):
    field_id: int

class NDVIDataResponse(NDVIDataBase):
    id: int
    field_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Treatment Request schemas
class TreatmentRequestBase(BaseModel):
    message: str
    proposed_price: float
    before_ndvi_value: float
    health_issue_description: Optional[str] = None

class TreatmentRequestCreate(TreatmentRequestBase):
    field_id: int

class TreatmentRequestResponse(TreatmentRequestBase):
    id: int
    agronomist_id: int
    field_id: int
    status: RequestStatus
    created_at: datetime
    accepted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Treatment schemas
class TreatmentBase(BaseModel):
    scheduled_date: Optional[datetime] = None
    treatment_type: Optional[str] = None
    notes: Optional[str] = None

class TreatmentCreate(TreatmentBase):
    request_id: int

class TreatmentResponse(TreatmentBase):
    id: int
    request_id: int
    status: TreatmentStatus
    completed_date: Optional[datetime] = None
    after_ndvi_value: Optional[float] = None
    improvement_percentage: Optional[float] = None
    agronomist_confirmed: bool
    farmer_confirmed: bool
    created_at: datetime
    before_ndvi_value: Optional[float] = None  # From related request
    
    class Config:
        from_attributes = True

