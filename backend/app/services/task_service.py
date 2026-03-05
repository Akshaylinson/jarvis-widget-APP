"""
Task Engine – Phase 2 placeholder.
Defines task detection logic that the mobile app interprets and executes.
"""
import re
from typing import Dict, Any, Optional


class TaskService:
    TASK_PATTERNS = {
        "open_app": [
            r"open\s+(?:the\s+)?(\w+)",
            r"launch\s+(?:the\s+)?(\w+)",
        ],
        "set_reminder": [
            r"set\s+(?:a\s+)?reminder\s+(?:for\s+|at\s+)?(.+)",
            r"remind\s+me\s+(?:to\s+)?(.+)",
        ],
        "internet_search": [
            r"search\s+(?:for\s+)?(.+)",
            r"look\s+up\s+(.+)",
            r"google\s+(.+)",
        ],
    }

    def detect_task(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Detect if the query is a task command.
        Returns task dict or None if it's a general question.
        """
        query_lower = query.lower().strip()

        for task_type, patterns in self.TASK_PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, query_lower)
                if match:
                    return {
                        "task_type": task_type,
                        "parameter": match.group(1).strip(),
                        "original_query": query,
                    }
        return None

    def build_task_response(self, task: Dict[str, Any]) -> str:
        """Build a natural language confirmation for the task."""
        t = task["task_type"]
        p = task["parameter"]

        if t == "open_app":
            return f"Opening {p} for you."
        elif t == "set_reminder":
            return f"Reminder set: {p}"
        elif t == "internet_search":
            return f"Searching the internet for: {p}"
        return "Task acknowledged."


task_service = TaskService()
