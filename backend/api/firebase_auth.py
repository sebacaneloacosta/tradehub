import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication
from rest_framework import exceptions

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None  # No token, pasa a otros autenticadores o 403

        parts = auth_header.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            raise exceptions.AuthenticationFailed('Formato inválido de Authorization header.')

        token = parts[1]

        try:
            decoded_token = auth.verify_id_token(token)
        except Exception as e:
            raise exceptions.AuthenticationFailed('Token inválido o expirado.')

        uid = decoded_token.get('uid')
        if not uid:
            raise exceptions.AuthenticationFailed('UID no encontrado en el token.')

        # Puedes traer o crear el usuario Django aquí según el uid o email
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(username=uid)
        except User.DoesNotExist:
            # Crear usuario temporal o lanzar error
            user = User.objects.create(username=uid)

        return (user, None)
