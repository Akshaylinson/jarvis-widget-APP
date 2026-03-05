import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Assistant(Base):
    __tablename__ = "assistants"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    tenant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    assistant_name: Mapped[str] = mapped_column(String(100), default="JARVIS")
    avatar_url: Mapped[str] = mapped_column(Text, nullable=True)
    wake_word: Mapped[str] = mapped_column(String(100), default="Hey Jarvis")
    voice_gender: Mapped[str] = mapped_column(String(20), default="male")
    language: Mapped[str] = mapped_column(String(20), default="en-US")
    personality_prompt: Mapped[str] = mapped_column(
        Text,
        default=(
            "You are JARVIS, a helpful, intelligent AI assistant. "
            "Respond concisely, clearly, and in a professional yet friendly manner. "
            "Keep answers short and voice-friendly unless asked for detail."
        ),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
