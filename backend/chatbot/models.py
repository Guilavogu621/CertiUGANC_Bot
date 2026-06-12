from django.db import models

class ConversationSession(models.Model):
    """
    Gestion de la machine à états (state machine) pour le chatbot.
    Permet de suivre où en est l'étudiant dans sa demande.
    """
    class State(models.TextChoices):
        ACCUEIL = 'ACCUEIL', 'Accueil (Demande Numéro)'
        ATTENTE_MDP = 'ATTENTE_MDP', 'Attente Mot de Passe'
        AUTHENTIFIE = 'AUTHENTIFIE', 'Authentifié (Choix Document)'
        CHOIX_NIVEAU = 'CHOIX_NIVEAU', 'Choix du Niveau'
        DOCUMENT_CHOISI = 'DOCUMENT_CHOISI', 'Document Choisi'
        ERROR = 'ERROR', 'Erreur'

    # Peut être null au début avant que l'étudiant ne s'authentifie
    etudiant = models.ForeignKey('authentication.Etudiant', on_delete=models.CASCADE, null=True, blank=True, related_name='chatbot_sessions')
    
    # Identifiant unique de session (peut être lié au JWT ou à un token local)
    session_id = models.CharField(max_length=255, unique=True)
    
    current_state = models.CharField(max_length=50, choices=State.choices, default=State.ACCUEIL)
    
    # Pour stocker les choix temporaires (ex: type d'attestation choisi, ID de la demande en cours)
    context_data = models.JSONField(default=dict, blank=True) 
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Session Chatbot"
        verbose_name_plural = "Sessions Chatbot"
        ordering = ['-updated_at']

    def __str__(self) -> str:
        etu_str = self.etudiant.numero_etudiant if self.etudiant else "Anonyme"
        return f"Session [{etu_str}] - État: {self.get_current_state_display()}"
