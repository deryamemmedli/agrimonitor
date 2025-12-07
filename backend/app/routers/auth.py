from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/register", response_model=schemas.UserResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        db_user = models.User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            role=user_data.role,
            phone=user_data.phone
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create profile based on role
        # Note: User can have both profiles if they register with different roles later
        if user_data.role == models.UserRole.FARMER:
            farmer = models.Farmer(user_id=db_user.id)
            db.add(farmer)
        elif user_data.role == models.UserRole.AGRONOMIST:
            agronomist = models.Agronomist(user_id=db_user.id)
            db.add(agronomist)
        
        db.commit()
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/add-role")
def add_role(
    role: str = Query(..., description="Role to add: 'farmer' or 'agronomist'"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add additional role to existing user (e.g., farmer can also become agronomist)
    """
    try:
        role = role.lower().strip()
        
        if role == "farmer":
            # Check if farmer profile already exists
            farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
            if farmer:
                return {"message": "Farmer role already exists", "role": "farmer", "success": True}
            
            # Create new farmer profile
            try:
                farmer = models.Farmer(user_id=current_user.id)
                db.add(farmer)
                db.commit()
                db.refresh(farmer)
                return {"message": "Farmer role added successfully", "role": "farmer", "success": True}
            except Exception as e:
                db.rollback()
                # Check if it was created in the meantime
                farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
                if farmer:
                    return {"message": "Farmer role already exists", "role": "farmer", "success": True}
                raise
                
        elif role == "agronomist":
            # Check if agronomist profile already exists
            agronomist = db.query(models.Agronomist).filter(models.Agronomist.user_id == current_user.id).first()
            if agronomist:
                return {"message": "Agronomist role already exists", "role": "agronomist", "success": True}
            
            # Create new agronomist profile
            try:
                agronomist = models.Agronomist(user_id=current_user.id)
                db.add(agronomist)
                db.commit()
                db.refresh(agronomist)
                return {"message": "Agronomist role added successfully", "role": "agronomist", "success": True}
            except Exception as e:
                db.rollback()
                # Check if it was created in the meantime
                agronomist = db.query(models.Agronomist).filter(models.Agronomist.user_id == current_user.id).first()
                if agronomist:
                    return {"message": "Agronomist role already exists", "role": "agronomist", "success": True}
                raise
        else:
            raise HTTPException(status_code=400, detail="Invalid role. Use 'farmer' or 'agronomist'")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error adding role: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to add role: {str(e)}")

@router.get("/available-roles")
def get_available_roles(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of roles available for current user
    """
    roles = []
    
    # Check if user has farmer profile
    farmer = db.query(models.Farmer).filter(models.Farmer.user_id == current_user.id).first()
    if farmer:
        roles.append("farmer")
    
    # Check if user has agronomist profile
    agronomist = db.query(models.Agronomist).filter(models.Agronomist.user_id == current_user.id).first()
    if agronomist:
        roles.append("agronomist")
    
    return {
        "available_roles": roles,
        "current_role": current_user.role.value
    }

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user
