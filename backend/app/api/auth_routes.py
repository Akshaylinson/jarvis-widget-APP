from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.tenant import Tenant
from app.models.assistant import Assistant
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Request / Response Schemas ─────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tenant_id: str
    email: str
    full_name: str | None


# ─── Routes ─────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(Tenant).where(Tenant.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create tenant
    tenant = Tenant(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(tenant)
    await db.flush()  # Get the generated ID

    # Create default assistant config
    assistant = Assistant(
        tenant_id=tenant.id,
        assistant_name="Assistant",
        wake_word="Hey Assistant",
        voice_gender="male",
        language="en-US",
    )
    db.add(assistant)
    await db.commit()
    await db.refresh(tenant)

    token = create_access_token({"sub": tenant.id})
    return AuthResponse(
        access_token=token,
        tenant_id=tenant.id,
        email=tenant.email,
        full_name=tenant.full_name,
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.email == payload.email))
    tenant = result.scalar_one_or_none()

    if not tenant or not verify_password(payload.password, tenant.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not tenant.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": tenant.id})
    return AuthResponse(
        access_token=token,
        tenant_id=tenant.id,
        email=tenant.email,
        full_name=tenant.full_name,
    )
