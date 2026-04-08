"""
Notification Service - Stub Implementation

This module provides a no-op implementation of the notification service.
Actual push/email notifications can be wired up here later (e.g. FCM, Firebase, SMTP).
All calls succeed silently so that core features (appointment approval, prescriptions)
are not blocked by a missing notification backend.
"""
import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class NotificationService:
    async def create_notification(
        self,
        db: AsyncSession,
        user_id: UUID,
        title: str,
        message: str,
        type: str = "general",
        send_push: bool = False,
    ) -> None:
        """
        Create an in-app notification for a user.
        Currently a stub — logs the notification and returns.
        Wire up a real push provider (FCM, OneSignal, etc.) here when ready.
        """
        logger.info(
            "[Notification] user_id=%s type=%s title=%r message=%r push=%s",
            user_id,
            type,
            title,
            message,
            send_push,
        )
        # TODO: persist to a `notifications` table or send via push provider


notification_service = NotificationService()
