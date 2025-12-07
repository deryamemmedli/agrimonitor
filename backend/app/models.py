from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    FARMER = "farmer"
    AGRONOMIST = "agronomist"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"

class TreatmentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    VERIFIED = "verified"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    farmer_profile = relationship("Farmer", back_populates="user", uselist=False)
    agronomist_profile = relationship("Agronomist", back_populates="user", uselist=False)

class Farmer(Base):
    __tablename__ = "farmers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    farm_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="farmer_profile")
    fields = relationship("Field", back_populates="farmer")

class Agronomist(Base):
    __tablename__ = "agronomists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="agronomist_profile")
    requests = relationship("TreatmentRequest", back_populates="agronomist")

class Field(Base):
    __tablename__ = "fields"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    name = Column(String, nullable=False)
    area_hectares = Column(Float, nullable=False)
    crop_type = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    polygon_coordinates = Column(Text, nullable=True)  # JSON string of coordinates
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    farmer = relationship("Farmer", back_populates="fields")
    ndvi_data = relationship("NDVIData", back_populates="field")
    requests = relationship("TreatmentRequest", back_populates="field")

class NDVIData(Base):
    __tablename__ = "ndvi_data"
    
    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    ndvi_value = Column(Float, nullable=False)  # Average NDVI for the field
    image_url = Column(String, nullable=True)  # URL to NDVI image
    ndvi_metadata = Column(Text, nullable=True)  # JSON string with additional data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    field = relationship("Field", back_populates="ndvi_data")

class TreatmentRequest(Base):
    __tablename__ = "treatment_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    agronomist_id = Column(Integer, ForeignKey("agronomists.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING)
    message = Column(Text, nullable=False)
    proposed_price = Column(Float, nullable=False)
    before_ndvi_value = Column(Float, nullable=False)
    health_issue_description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    
    agronomist = relationship("Agronomist", back_populates="requests")
    field = relationship("Field", back_populates="requests")
    treatment = relationship("Treatment", back_populates="request", uselist=False)

class Treatment(Base):
    __tablename__ = "treatments"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("treatment_requests.id"), unique=True, nullable=False)
    status = Column(SQLEnum(TreatmentStatus), default=TreatmentStatus.SCHEDULED)
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    after_ndvi_value = Column(Float, nullable=True)
    improvement_percentage = Column(Float, nullable=True)
    treatment_type = Column(String, nullable=True)  # e.g., "spraying", "fertilization"
    notes = Column(Text, nullable=True)
    agronomist_confirmed = Column(Boolean, default=False)
    farmer_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    request = relationship("TreatmentRequest", back_populates="treatment")

