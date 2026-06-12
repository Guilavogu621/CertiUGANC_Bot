from django.db import models
from authentication.models import Etudiant, Admin
from django.utils.translation import gettext_lazy as _

class TypeAttestation(models.Model):
    """
    Définit les différents types d'attestations disponibles (ex: Inscription, Réussite).
    """
    libelle = models.CharField(max_length=100, unique=True, help_text="Nom du type d'attestation")
    template_html = models.CharField(max_length=200, help_text="Nom ou chemin du template HTML (ex: inscription.html)")
    description = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = "Type d'attestation"
        verbose_name_plural = "Types d'attestations"

    def __str__(self) -> str:
        return self.libelle

class DemandeAttestation(models.Model):
    """
    Représente une demande formulée par un étudiant.
    """
    class Statut(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', _('En attente')
        VALIDEE = 'VALIDEE', _('Validée')
        REJETEE = 'REJETEE', _('Rejetée')

    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name='demandes')
    type_attestation = models.ForeignKey(TypeAttestation, on_delete=models.CASCADE, related_name='demandes')
    admin = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True, blank=True, related_name='demandes_traitees', help_text="L'agent qui a traité la demande")
    
    date_demande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    commentaire = models.TextField(null=True, blank=True, help_text="Commentaire de l'agent (obligatoire si rejeté)")

    class Meta:
        verbose_name = "Demande d'attestation"
        verbose_name_plural = "Demandes d'attestations"
        ordering = ['-date_demande']

    def __str__(self) -> str:
        return f"Demande #{self.id} - {self.etudiant.numero_etudiant} - {self.get_statut_display()}"

class DocumentPDF(models.Model):
    """
    Le fichier physique PDF généré après validation.
    """
    demande = models.OneToOneField(DemandeAttestation, on_delete=models.CASCADE, related_name='document')
    chemin_fichier = models.FileField(upload_to='attestations/%Y/%m/', help_text="Le fichier PDF généré")
    date_creation = models.DateTimeField(auto_now_add=True)
    taille_ko = models.IntegerField(null=True, blank=True, help_text="Taille du fichier en Ko")

    class Meta:
        verbose_name = "Document PDF"
        verbose_name_plural = "Documents PDF"

    def __str__(self) -> str:
        return f"PDF Demande #{self.demande.id}"
