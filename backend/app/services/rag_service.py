import logging
import math
import json
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.knowledge import KnowledgeEntry

logger = logging.getLogger(__name__)


class RAGService:
    """
    Retrieval-Augmented Generation service.
    Uses TF-IDF cosine similarity (scikit-learn) for fast, lightweight embeddings.
    No GPU / PyTorch required.
    """

    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        if len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        mag_a = math.sqrt(sum(x * x for x in a))
        mag_b = math.sqrt(sum(x * x for x in b))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    async def embed_text(self, text: str) -> List[float]:
        """
        Generate a TF-IDF vector for text using scikit-learn.
        Falls back to character n-gram frequency if sklearn unavailable.
        """
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            import asyncio

            def _vectorize():
                vec = TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(2, 4),
                    max_features=512,
                    sublinear_tf=True,
                )
                matrix = vec.fit_transform([text])
                return matrix.toarray()[0].tolist()

            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, _vectorize)

        except ImportError:
            logger.info("scikit-learn not available, using simple n-gram embedding")
            return self._simple_embed(text)

    def _simple_embed(self, text: str) -> List[float]:
        """Fallback: character trigram frequency vector."""
        text = text.lower()
        ngrams: Dict[str, int] = {}
        for i in range(len(text) - 2):
            ng = text[i : i + 3]
            ngrams[ng] = ngrams.get(ng, 0) + 1

        sorted_ngrams = sorted(ngrams.items(), key=lambda x: -x[1])[:512]
        vocab = {ng: idx for idx, (ng, _) in enumerate(sorted_ngrams)}
        vec = [0.0] * 512
        for ng, count in ngrams.items():
            if ng in vocab:
                vec[vocab[ng]] = float(count)

        mag = math.sqrt(sum(x * x for x in vec))
        if mag > 0:
            vec = [x / mag for x in vec]
        return vec

    async def retrieve_relevant(
        self,
        tenant_id: str,
        query: str,
        db: AsyncSession,
        top_k: int = 3,
    ) -> List[Dict[str, Any]]:
        """Retrieve the top-k most relevant knowledge entries for a query."""
        result = await db.execute(
            select(KnowledgeEntry).where(KnowledgeEntry.tenant_id == tenant_id)
        )
        entries = result.scalars().all()
        if not entries:
            return []

        query_embedding = await self.embed_text(query)

        scored = []
        for entry in entries:
            if entry.embedding:
                emb = entry.embedding if isinstance(entry.embedding, list) else []
                score = self._cosine_similarity(query_embedding, emb)
            else:
                # Keyword overlap fallback
                score = sum(
                    1 for word in query.lower().split() if word in entry.content.lower()
                ) / max(len(query.split()), 1)
            scored.append((score, entry))

        scored.sort(key=lambda x: -x[0])
        threshold = 0.05
        top = [(s, e) for s, e in scored[:top_k] if s > threshold]

        return [{"title": e.title, "content": e.content, "score": s} for s, e in top]


rag_service = RAGService()
