from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

from .models import User, Etudiant


class EtudiantAuthBackend(ModelBackend):
    """
    Backend d'authentification personnalisé pour les étudiants.
    Permet la connexion avec le numéro matricule OU l'INE.
    Les agents et admins système continuent d'utiliser le username/email classique.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Tente d'authentifier l'utilisateur en cherchant parmi :
        1. Le username Django classique (pour agents/admins)
        2. Le numéro matricule de l'étudiant
        3. L'INE de l'étudiant
        """
        if username is None or password is None:
            return None

        # Recherche par username classique (agents, admins)
        user = self._get_user_by_username(username)

        # Si pas trouvé, recherche dans les profils étudiants (matricule ou INE)
        if user is None:
            user = self._get_user_by_student_identifier(username)

        # Vérification du mot de passe et des permissions
        if user is not None and user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None

    def _get_user_by_username(self, username):
        """Recherche un utilisateur par son username Django ou son email."""
        try:
            return User.objects.get(Q(username=username) | Q(email=username))
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            # En cas de doublons (peu probable si l'email est unique) on prend le premier
            return User.objects.filter(Q(username=username) | Q(email=username)).first()

    def _get_user_by_student_identifier(self, identifier):
        """Recherche un étudiant par son matricule ou son INE."""
        try:
            etudiant = Etudiant.objects.select_related('user').get(
                Q(numero_etudiant=identifier) | Q(ine=identifier)
            )
            return etudiant.user
        except Etudiant.DoesNotExist:
            return None
