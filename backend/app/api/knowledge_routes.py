from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.database import get_db
from app.models.tenant import Tenant
from app.models.knowledge import KnowledgeEntry
from app.auth import get_current_tenant
from app.services.rag_service import rag_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


class KnowledgeCreateRequest(BaseModel):
    title: str
    content: str


class KnowledgeResponse(BaseModel):
    id: str
    title: str
    content: str


@router.post("/add", response_model=KnowledgeResponse, status_code=201)
async def add_knowledge(
    payload: KnowledgeCreateRequest,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    # Generate embedding
    embedding = await rag_service.embed_text(payload.content)

    entry = KnowledgeEntry(
        tenant_id=tenant.id,
        title=payload.title,
        content=payload.content,
        embedding=embedding,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return KnowledgeResponse(id=entry.id, title=entry.title, content=entry.content)


@router.get("/list")
async def list_knowledge(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeEntry).where(KnowledgeEntry.tenant_id == tenant.id)
    )
    entries = result.scalars().all()
    return [{"id": e.id, "title": e.title, "content": e.content[:200]} for e in entries]


@router.delete("/{entry_id}")
async def delete_knowledge(
    entry_id: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeEntry).where(
            KnowledgeEntry.id == entry_id,
            KnowledgeEntry.tenant_id == tenant.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    await db.delete(entry)
    await db.commit()
    return {"message": "Deleted successfully"}
