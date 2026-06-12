from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
import weasyprint
from .models import TypeAttestation, DemandeAttestation, DocumentPDF
from .serializers import TypeAttestationSerializer, DemandeAttestationSerializer

class TypeAttestationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint en lecture seule pour lister les types d'attestations disponibles.
    """
    queryset = TypeAttestation.objects.all()
    serializer_class = TypeAttestationSerializer
    permission_classes = [permissions.IsAuthenticated]

class DemandeAttestationViewSet(viewsets.ModelViewSet):
    """
    Gestion des demandes d'attestations.
    Comportement différent selon le rôle de l'utilisateur (Étudiant vs Agent).
    """
    serializer_class = DemandeAttestationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_student() and hasattr(user, 'etudiant_profile'):
            # L'étudiant ne voit que SES demandes
            return DemandeAttestation.objects.filter(etudiant=user.etudiant_profile)
        # Les agents et admins voient toutes les demandes
        return DemandeAttestation.objects.all()

    def perform_create(self, serializer):
        # Lors de la création via l'API, on assigne automatiquement l'étudiant connecté
        if self.request.user.is_student() and hasattr(self.request.user, 'etudiant_profile'):
            serializer.save(etudiant=self.request.user.etudiant_profile)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """Action pour qu'un admin valide une demande"""
        if not request.user.is_admin():
            return Response({"detail": "Non autorisé. Rôle Administrateur requis."}, status=status.HTTP_403_FORBIDDEN)
            
        demande = self.get_object()
        if demande.statut != DemandeAttestation.Statut.EN_ATTENTE:
            return Response({"detail": "Cette demande n'est pas en attente."}, status=status.HTTP_400_BAD_REQUEST)
            
        demande.statut = DemandeAttestation.Statut.VALIDEE
        if hasattr(request.user, 'admin_profile'):
            demande.admin = request.user.admin_profile
        demande.save()
        
        # Génération du PDF
        if demande.type_attestation.template_html:
            html_string = render_to_string(
                f'attestations/{demande.type_attestation.template_html}',
                {'demande': demande, 'etudiant': demande.etudiant}
            )
            pdf_file = weasyprint.HTML(string=html_string).write_pdf()
            
            doc_pdf, created = DocumentPDF.objects.get_or_create(demande=demande)
            filename = f"attestation_{demande.id}_{demande.etudiant.numero_etudiant}.pdf"
            doc_pdf.chemin_fichier.save(filename, ContentFile(pdf_file))
            doc_pdf.taille_ko = len(pdf_file) // 1024
            doc_pdf.save()
        
        return Response({"status": "Demande validée et PDF généré"})

    @action(detail=True, methods=['post'])
    def rejeter(self, request, pk=None):
        """Action pour qu'un admin rejette une demande"""
        if not request.user.is_admin():
            return Response({"detail": "Non autorisé. Rôle Administrateur requis."}, status=status.HTTP_403_FORBIDDEN)
            
        commentaire = request.data.get('commentaire', '').strip()
        if not commentaire:
            return Response({"detail": "Un commentaire est obligatoire pour justifier le rejet."}, status=status.HTTP_400_BAD_REQUEST)
            
        demande = self.get_object()
        demande.statut = DemandeAttestation.Statut.REJETEE
        if hasattr(request.user, 'admin_profile'):
            demande.admin = request.user.admin_profile
        demande.commentaire = commentaire
        demande.save()
        
        return Response({"status": "Demande rejetée"})
