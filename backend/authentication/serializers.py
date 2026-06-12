from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Etudiant, Admin

class EtudiantSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='user.last_name', read_only=True)
    prenom = serializers.CharField(source='user.first_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Etudiant
        fields = [
            'id', 'numero_etudiant', 'ine', 'filiere', 'niveau', 'annee_inscription', 
            'nom', 'prenom', 'email', 'genre', 'date_naissance', 'lieu_naissance', 
            'prenom_pere', 'prenom_nom_mere', 'faculte', 'departement', 'programme',
            'a_valide_l1', 'a_valide_l2', 'a_valide_l3'
        ]

class AdminSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='user.last_name', read_only=True)
    prenom = serializers.CharField(source='user.first_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = Admin
        fields = ['id', 'nom', 'prenom', 'email', 'role']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Personnalisation du token JWT pour y inclure le rôle de l'utilisateur
    afin que le frontend (React) sache facilement vers quel tableau de bord rediriger.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Ajout de champs personnalisés dans le payload du token
        token['role'] = user.role
        token['username'] = user.username
        token['nom'] = user.last_name
        token['prenom'] = user.first_name
        
        # Identifiants spécifiques
        if user.is_student() and hasattr(user, 'etudiant_profile'):
            token['matricule'] = user.etudiant_profile.numero_etudiant
            
        return token
