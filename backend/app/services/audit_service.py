from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Any, Dict
from uuid import UUID
import json

from app.models.finance import AuditLog

class AuditService:
    @staticmethod
    async def log_action(
        db: AsyncSession,
        user_id: Optional[UUID],
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Creates a new audit log entry.
        Does not commit by itself to allow being part of a larger transaction.
        """
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata_json=metadata
        )
        db.add(audit_log)
        # We generally don't await/commit here, so the caller's commit handles it.
        # But for some actions (like failed logins), we might want an immediate commit.

    @staticmethod
    async def get_logs(
        db: AsyncSession,
        user_id: Optional[UUID] = None,
        resource_type: Optional[str] = None,
        limit: int = 100
    ):
        from sqlalchemy.future import select
        query = select(AuditLog)
        if user_id:
            query = query.where(AuditLog.user_id == user_id)
        if resource_type:
            query = query.where(AuditLog.resource_type == resource_type)
        
        query = query.order_by(AuditLog.created_at.desc()).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

audit_service = AuditService()
