from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)

class IsAdminRole(BasePermission):
    """
    Allows access only to admin users.
    """

    def has_permission(self, request, view):
        logger.info(f"User: {request.user}")
        logger.info(f"Is Authenticated: {request.user.is_authenticated}")

        if not request.user or not request.user.is_authenticated:
            logger.warning("Permission denied: User is not authenticated.")
            return False

        has_profile = hasattr(request.user, 'profile')
        logger.info(f"Has Profile: {has_profile}")

        if not has_profile:
            logger.warning(f"Permission denied: User {request.user} does not have a profile.")
            return False

        user_role = request.user.profile.role
        logger.info(f"Profile Role: {user_role}")

        is_admin = user_role == 'admin'
        if not is_admin:
            logger.warning(f"Permission denied: User {request.user} has role '{user_role}', not 'admin'.")

        return is_admin
