from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class ServiceJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")
        role = validated_token.get("role")

        if user_id is None:
            raise InvalidToken("Token does not contain user_id.")

        if role not in ("ADMIN", "USER"):
            raise InvalidToken("Token contains an invalid role.")

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            pass

        class AuthenticatedUser:
            def __init__(self, user_id, role):
                self.id = user_id
                self.role = role
                self.is_authenticated = True

        return AuthenticatedUser(user_id, role)