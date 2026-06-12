from rest_framework import serializers
from .models import TypeAttestation, DemandeAttestation, DocumentPDF
from authentication.serializers import EtudiantSerializer

class TypeAttestationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeAttestation
        fields = '__all__'

class DocumentPDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentPDF
        fields = ['id', 'chemin_fichier', 'date_creation', 'taille_ko']

class DemandeAttestationSerializer(serializers.ModelSerializer):
    # Affichage des informations imbriquées en lecture
    etudiant_details = EtudiantSerializer(source='etudiant', read_only=True)
    type_details = TypeAttestationSerializer(source='type_attestation', read_only=True)
    document = DocumentPDFSerializer(read_only=True)
    
    # Récupération du libellé lisible du statut ("En attente" au lieu de "EN_ATTENTE")
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = DemandeAttestation
        fields = [
            'id', 'etudiant', 'etudiant_details', 'type_attestation', 'type_details', 
            'admin', 'date_demande', 'statut', 'statut_display', 'commentaire', 'document'
        ]
        # Champs qui ne peuvent pas être modifiés directement par l'utilisateur lors de la création
        read_only_fields = ['admin', 'date_demande']
