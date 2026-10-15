from rest_framework_simplejwt.authentication import JWTAuthentication


class ServiceJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")
        role = validated_token.get("role")

        if user_id is None:
            return None

        class AuthenticatedUser:
            def __init__(self, user_id, role):
                self.id = user_id
                self.role = role
                self.is_authenticated = True

        return AuthenticatedUser(user_id, role)