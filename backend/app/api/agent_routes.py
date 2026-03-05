import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.tenant import Tenant
from app.models.assistant import Assistant
from app.models.conversation import Conversation
from app.auth import get_current_tenant
from app.services.gemini_service import gemini_service
from app.services.openrouter_service import openrouter_service
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/agent", tags=["AI Agent"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str
    use_knowledge: bool = True


class QueryResponse(BaseModel):
    response: str
    provider: str
    query: str


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/query", response_model=QueryResponse)
async def process_query(
    payload: QueryRequest,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Get assistant config
    result = await db.execute(
        select(Assistant).where(Assistant.tenant_id == tenant.id)
    )
    assistant = result.scalar_one_or_none()
    personality = assistant.personality_prompt if assistant else None

    # RAG Knowledge Retrieval
    context = ""
    if payload.use_knowledge:
        retrieved = await rag_service.retrieve_relevant(
            tenant_id=tenant.id, query=payload.query, db=db, top_k=3
        )
        if retrieved:
            context = "\n\n".join(
                [f"[Knowledge: {e['title']}]\n{e['content']}" for e in retrieved]
            )

    # Build full prompt
    system_prompt = personality or "You are JARVIS, a helpful AI assistant."
    if context:
        system_prompt += f"\n\nRelevant knowledge:\n{context}"

    # Try Gemini first, fallback to OpenRouter
    response_text = None
    provider_used = "gemini"

    try:
        response_text = await gemini_service.chat(
            system_prompt=system_prompt,
            user_message=payload.query,
        )
    except Exception as e:
        logger.warning(f"Gemini failed: {e}. Falling back to OpenRouter...")
        try:
            response_text = await openrouter_service.chat(
                system_prompt=system_prompt,
                user_message=payload.query,
            )
            provider_used = "openrouter"
        except Exception as e2:
            logger.error(f"OpenRouter also failed: {e2}")
            raise HTTPException(
                status_code=503,
                detail="AI service temporarily unavailable. Please try again.",
            )

    # Save conversation
    conv = Conversation(
        tenant_id=tenant.id,
        query=payload.query,
        response=response_text,
        provider_used=provider_used,
    )
    db.add(conv)
    await db.commit()

    return QueryResponse(
        response=response_text,
        provider=provider_used,
        query=payload.query,
    )


@router.get("/history")
async def get_history(
    limit: int = 20,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.tenant_id == tenant.id)
        .order_by(Conversation.timestamp.desc())
        .limit(limit)
    )
    conversations = result.scalars().all()
    return [
        {
            "id": c.id,
            "query": c.query,
            "response": c.response,
            "provider": c.provider_used,
            "timestamp": c.timestamp.isoformat(),
        }
        for c in conversations
    ]
