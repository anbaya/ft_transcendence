import logging
from rest_framework.throttling import SimpleRateThrottle

logger = logging.getLogger(__name__)


class AIRateThrottle(SimpleRateThrottle):
    """
    Limits the rate of AI prompt queries to protect against LLM quota abuse and spam.
    Configured by default to 15 requests per minute per authenticated user,
    or 5 requests per minute for anonymous users / IP addresses.
    """
    scope = 'ai_user'

    def get_cache_key(self, request, view):
        if request.user and getattr(request.user, 'is_authenticated', False):
            ident = getattr(request.user, 'pk', getattr(request.user, 'id', None))
            scope = 'ai_user'
        else:
            ident = self.get_ident(request)
            scope = 'ai_anon'

        if not ident:
            return None

        return self.cache_format % {
            'scope': scope,
            'ident': ident
        }
