from django.contrib import admin
from .models import ConversationSession

@admin.register(ConversationSession)
class ConversationSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'etudiant', 'current_state', 'updated_at')
    list_filter = ('current_state',)
    search_fields = ('session_id', 'etudiant__numero_etudiant')
    readonly_fields = ('created_at', 'updated_at')
