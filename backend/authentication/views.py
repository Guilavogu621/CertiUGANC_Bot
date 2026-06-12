from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, EtudiantSerializer
from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Etudiant, User
from django.db import transaction
import csv
import io
import datetime

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vue pour la connexion API (génère un Access Token et un Refresh Token).
    Utilise le serializer personnalisé pour inclure le rôle et les infos utilisateur.
    """
    serializer_class = CustomTokenObtainPairSerializer

class EtudiantViewSet(viewsets.ModelViewSet):
    """
    API pour lister, créer, récupérer, mettre à jour ou supprimer des étudiants.
    Accès réservé aux administrateurs.
    """
    queryset = Etudiant.objects.all().order_by('-id')
    serializer_class = EtudiantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # On pourrait restreindre ici par département si besoin
        return super().get_queryset()

class ImportEtudiantsCSV(views.APIView):
    """
    Permet d'importer une liste d'étudiants via un fichier CSV.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "Aucun fichier fourni."}, status=status.HTTP_400_BAD_REQUEST)
            
        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({"error": "Le fichier doit être au format CSV."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string, delimiter=',')
            
            created_count = 0
            updated_count = 0
            
            with transaction.atomic():
                for row in reader:
                    numero_etudiant = row.get('numero_etudiant', '').strip()
                    nom = row.get('nom', '').strip()
                    prenom = row.get('prenom', '').strip()
                    genre = row.get('genre', 'M').strip()
                    annee_inscription = row.get('annee_inscription', '2023-2024').strip()
                    
                    if not numero_etudiant:
                        continue
                        
                    # Gestion de l'utilisateur
                    user, user_created = User.objects.get_or_create(
                        username=numero_etudiant,
                        defaults={
                            'first_name': prenom,
                            'last_name': nom,
                            'role': User.Roles.ETUDIANT
                        }
                    )
                    
                    if user_created:
                        # Le mot de passe par défaut est le numéro étudiant
                        user.set_password(numero_etudiant)
                        user.save()
                    else:
                        # Mettre à jour les infos si existantes
                        user.first_name = prenom
                        user.last_name = nom
                        user.save()
                    
                    # Parse dates
                    date_naissance_str = row.get('date_naissance', '').strip()
                    date_naissance = None
                    if date_naissance_str:
                        try:
                            # Format supposé: YYYY-MM-DD
                            date_naissance = datetime.datetime.strptime(date_naissance_str, "%Y-%m-%d").date()
                        except ValueError:
                            pass
                    
                    # Gestion de l'étudiant
                    defaults_etu = {
                        'genre': genre,
                        'date_naissance': date_naissance,
                        'lieu_naissance': row.get('lieu_naissance', '').strip(),
                        'prenom_pere': row.get('prenom_pere', '').strip(),
                        'prenom_nom_mere': row.get('prenom_nom_mere', '').strip(),
                        'faculte': row.get('faculte', 'CENTRE INFORMATIQUE').strip() or 'CENTRE INFORMATIQUE',
                        'departement': row.get('departement', 'DLSI').strip() or 'DLSI',
                        'programme': row.get('programme', 'DEVELOPPEMENT LOGICIEL').strip() or 'DEVELOPPEMENT LOGICIEL',
                        'filiere': row.get('filiere', '').strip(),
                        'niveau': row.get('niveau', '').strip(),
                        'annee_inscription': annee_inscription,
                        'ine': row.get('ine', '').strip() or None,
                    }
                    
                    etu, etu_created = Etudiant.objects.update_or_create(
                        user=user,
                        numero_etudiant=numero_etudiant,
                        defaults=defaults_etu
                    )
                    
                    if etu_created:
                        created_count += 1
                    else:
                        updated_count += 1
                        
            return Response({
                "message": "Importation réussie", 
                "created": created_count, 
                "updated": updated_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": f"Erreur lors du traitement du fichier : {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
