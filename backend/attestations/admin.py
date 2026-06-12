from django.contrib import admin
from .models import TypeAttestation, DemandeAttestation, DocumentPDF

@admin.register(TypeAttestation)
class TypeAttestationAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'template_html')
    search_fields = ('libelle',)

@admin.register(DemandeAttestation)
class DemandeAttestationAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_etudiant_numero', 'type_attestation', 'statut', 'date_demande')
    list_filter = ('statut', 'type_attestation', 'date_demande')
    search_fields = ('etudiant__numero_etudiant', 'etudiant__user__first_name', 'etudiant__user__last_name')
    readonly_fields = ('date_demande',)

    def get_etudiant_numero(self, obj):
        return obj.etudiant.numero_etudiant
    get_etudiant_numero.short_description = 'Matricule'

@admin.register(DocumentPDF)
class DocumentPDFAdmin(admin.ModelAdmin):
    list_display = ('id', 'demande', 'date_creation', 'taille_ko')
    readonly_fields = ('date_creation',)
