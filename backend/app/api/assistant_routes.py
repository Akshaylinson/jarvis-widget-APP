import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.assistant import Assistant
from app.models.tenant import Tenant
from app.auth import get_current_tenant
from app.config import settings

router = APIRouter(prefix="/assistant", tags=["Assistant Configuration"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class AssistantConfigResponse(BaseModel):
    assistant_name: str
    avatar_url: str | None
    wake_word: str
    voice_gender: str
    language: str
    personality_prompt: str


class AssistantConfigUpdate(BaseModel):
    assistant_name: str | None = None
    wake_word: str | None = None
    voice_gender: str | None = None
    language: str | None = None
    personality_prompt: str | None = None


# ─── Helpers ─────────────────────────────────────────────────────────────────

async def get_or_create_assistant(tenant: Tenant, db: AsyncSession) -> Assistant:
    result = await db.execute(
        select(Assistant).where(Assistant.tenant_id == tenant.id)
    )
    assistant = result.scalar_one_or_none()
    if not assistant:
        assistant = Assistant(tenant_id=tenant.id)
        db.add(assistant)
        await db.commit()
        await db.refresh(assistant)
    return assistant


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("/config", response_model=AssistantConfigResponse)
async def get_config(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    assistant = await get_or_create_assistant(tenant, db)
    return AssistantConfigResponse(
        assistant_name=assistant.assistant_name,
        avatar_url=assistant.avatar_url,
        wake_word=assistant.wake_word,
        voice_gender=assistant.voice_gender,
        language=assistant.language,
        personality_prompt=assistant.personality_prompt,
    )


@router.post("/config", response_model=AssistantConfigResponse)
async def update_config(
    payload: AssistantConfigUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    assistant = await get_or_create_assistant(tenant, db)

    if payload.assistant_name is not None:
        assistant.assistant_name = payload.assistant_name
    if payload.wake_word is not None:
        assistant.wake_word = payload.wake_word
    if payload.voice_gender is not None:
        if payload.voice_gender not in ("male", "female"):
            raise HTTPException(status_code=400, detail="voice_gender must be 'male' or 'female'")
        assistant.voice_gender = payload.voice_gender
    if payload.language is not None:
        assistant.language = payload.language
    if payload.personality_prompt is not None:
        assistant.personality_prompt = payload.personality_prompt

    await db.commit()
    await db.refresh(assistant)

    return AssistantConfigResponse(
        assistant_name=assistant.assistant_name,
        avatar_url=assistant.avatar_url,
        wake_word=assistant.wake_word,
        voice_gender=assistant.voice_gender,
        language=assistant.language,
        personality_prompt=assistant.personality_prompt,
    )


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Upload avatar image and store URL in assistant config."""
    # Validate file type
    allowed = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, GIF, WEBP images allowed")

    # Check size
    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File too large. Max {settings.max_upload_size_mb}MB")

    # Save file
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{tenant.id}_{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(settings.upload_dir, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    avatar_url = f"/static/avatars/{filename}"

    # Update assistant
    assistant = await get_or_create_assistant(tenant, db)
    assistant.avatar_url = avatar_url
    await db.commit()

    return {"avatar_url": avatar_url, "message": "Avatar uploaded successfully"}
