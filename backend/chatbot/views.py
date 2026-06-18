from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import ConversationSession
from authentication.models import Etudiant
from attestations.models import TypeAttestation, DemandeAttestation
import uuid

class ChatbotMessageView(APIView):
    """
    Endpoint principal du chatbot. Reçoit le message de l'utilisateur, met à jour 
    la machine à états, et renvoie la réponse du bot avec les actions possibles.
    """
    def post(self, request):
        session_id = request.data.get('session_id')
        message = request.data.get('message', '').strip()
        
        # 1. Initialisation ou récupération de la session
        if not session_id:
            session_id = str(uuid.uuid4())
            session = ConversationSession.objects.create(session_id=session_id, current_state=ConversationSession.State.ACCUEIL)
            return self._build_response(
                text="Bonjour ! Je suis l'assistant virtuel du Centre Informatique. Pour commencer votre demande d'attestation, veuillez entrer votre numéro de Matricule ou votre INE.",
                options=[],
                state=session.current_state,
                session_id=session_id
            )
            
        try:
            session = ConversationSession.objects.get(session_id=session_id)
        except ConversationSession.DoesNotExist:
            return Response({"error": "Session invalide"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Machine à états
        if session.current_state == ConversationSession.State.ACCUEIL:
            # Vérification stricte du matricule ou de l'INE dans la base de données
            from django.db.models import Q
            if Etudiant.objects.filter(Q(numero_etudiant=message) | Q(ine=message)).exists():
                session.context_data['matricule'] = message
                session.current_state = ConversationSession.State.ATTENTE_MDP
                session.save()
                return self._build_response(
                    text="Matricule/INE trouvé ✅. Veuillez maintenant saisir votre mot de passe pour vous authentifier.\n\n💡 Si c'est votre première connexion, votre mot de passe par défaut est votre numéro de matricule.",
                    options=[],
                    state=session.current_state,
                    session_id=session_id
                )
            else:
                return self._build_response(
                    text="❌ Ce numéro de matricule ou INE n'existe pas dans la base de données de l'UGANC. Veuillez vérifier votre saisie (sans espaces) et réessayer, ou contactez le secrétariat de votre scolarité.",
                    options=[],
                    state=session.current_state,
                    session_id=session_id
                )
            
        elif session.current_state == ConversationSession.State.ATTENTE_MDP:
            # Vérification du mot de passe
            matricule = session.context_data.get('matricule')
            user = authenticate(request, username=matricule, password=message)
            
            if user is not None and user.is_student():
                session.etudiant = user.etudiant_profile
                session.current_state = ConversationSession.State.AUTHENTIFIE
                session.save()
                return self._build_response(
                    text=f"Authentification réussie ! Bonjour {user.first_name}. Quel document souhaitez-vous demander ?",
                    options=[
                        {"label": "Attestation d'Inscription", "value": "INSCRIPTION"},
                        {"label": "Attestation de Niveau", "value": "NIVEAU"},
                        {"label": "📄 Télécharger mes attestations", "value": "SUIVI"}
                    ],
                    state=session.current_state,
                    session_id=session_id
                )
            else:
                return self._build_response(
                    text="Identifiants incorrects. Veuillez réessayer votre mot de passe.",
                    options=[],
                    state=session.current_state,
                    session_id=session_id
                )
                
        elif session.current_state == ConversationSession.State.AUTHENTIFIE:
            # L'utilisateur choisit le type de document
            if message not in ["INSCRIPTION", "NIVEAU", "SUIVI"]:
                return self._build_response(
                    text="Veuillez utiliser les boutons pour choisir un document.",
                    options=[
                        {"label": "Attestation d'Inscription", "value": "INSCRIPTION"},
                        {"label": "Attestation de Niveau", "value": "NIVEAU"},
                        {"label": "📄 Télécharger mes attestations", "value": "SUIVI"}
                    ],
                    state=session.current_state,
                    session_id=session_id
                )
            
            if message == "INSCRIPTION":
                type_att, created = TypeAttestation.objects.get_or_create(
                    libelle__icontains="Inscription",
                    defaults={'libelle': "Attestation d'Inscription", 'template_html': "inscription.html"}
                )
                session.context_data['type_id'] = type_att.id
                session.current_state = ConversationSession.State.DOCUMENT_CHOISI
                session.save()
                
                # L'attestation d'inscription passe en statut EN_ATTENTE pour validation admin
                DemandeAttestation.objects.create(
                    etudiant=session.etudiant,
                    type_attestation=type_att,
                    statut=DemandeAttestation.Statut.EN_ATTENTE
                )
                return self._build_response(
                    text="Votre demande d'Attestation d'Inscription a été envoyée ! Dès qu'elle sera validée par l'administration, vous pourrez la récupérer.",
                    options=[{"label": "Faire une autre demande", "value": "RESTART"}],
                    state=session.current_state,
                    session_id=session_id
                )
            elif message == "NIVEAU":
                session.current_state = ConversationSession.State.CHOIX_NIVEAU
                session.save()
                return self._build_response(
                    text="Pour quel niveau souhaitez-vous demander une attestation ?",
                    options=[
                        {"label": "Niveau L1", "value": "L1"},
                        {"label": "Niveau L2", "value": "L2"},
                        {"label": "Niveau L3", "value": "L3"}
                    ],
                    state=session.current_state,
                    session_id=session_id
                )
            elif message == "SUIVI":
                demandes_validees = DemandeAttestation.objects.filter(
                    etudiant=session.etudiant,
                    statut=DemandeAttestation.Statut.VALIDEE,
                    document__isnull=False
                ).select_related('type_attestation', 'document')
                
                if not demandes_validees.exists():
                    texte = "Vous n'avez actuellement aucune attestation validée prête à être téléchargée."
                else:
                    texte = "Voici vos documents validés et prêts au téléchargement :\n\n"
                    for d in demandes_validees:
                        url = f"http://localhost:8000{d.document.chemin_fichier.url}"
                        texte += f"✅ {d.type_attestation.libelle} :\n{url}\n\n"
                
                session.current_state = ConversationSession.State.DOCUMENT_CHOISI
                session.save()
                return self._build_response(
                    text=texte.strip(),
                    options=[{"label": "Faire une autre demande", "value": "RESTART"}],
                    state=session.current_state,
                    session_id=session_id
                )
                
        elif session.current_state == ConversationSession.State.CHOIX_NIVEAU:
            if message not in ["L1", "L2", "L3"]:
                return self._build_response(
                    text="Veuillez utiliser les boutons pour choisir un niveau valide.",
                    options=[
                        {"label": "Niveau L1", "value": "L1"},
                        {"label": "Niveau L2", "value": "L2"},
                        {"label": "Niveau L3", "value": "L3"}
                    ],
                    state=session.current_state,
                    session_id=session_id
                )
                
            # Vérification des conditions
            etu = session.etudiant
            is_valid = False
            error_msg = ""
            
            if message == "L1":
                is_valid = etu.a_valide_l1
                error_msg = "Vous devez valider toutes les matières de la L1 pour obtenir cette attestation."
            elif message == "L2":
                is_valid = etu.a_valide_l1 and etu.a_valide_l2
                error_msg = "Vous devez valider toutes les matières de la L1 et L2 pour obtenir cette attestation."
            elif message == "L3":
                is_valid = etu.a_valide_l1 and etu.a_valide_l2 and etu.a_valide_l3
                error_msg = "Vous devez valider toutes les matières de la L1, L2 et L3 pour obtenir cette attestation."
                
            if not is_valid:
                session.current_state = ConversationSession.State.DOCUMENT_CHOISI
                session.save()
                return self._build_response(
                    text=f"❌ Demande refusée : {error_msg}",
                    options=[{"label": "Faire une autre demande", "value": "RESTART"}],
                    state=session.current_state,
                    session_id=session_id
                )
                
            # Création de la demande
            type_att, created = TypeAttestation.objects.get_or_create(
                libelle__icontains=f"Niveau {message}",
                defaults={'libelle': f"Attestation de Niveau {message}", 'template_html': "niveau.html"}
            )
            session.context_data['type_id'] = type_att.id
            session.current_state = ConversationSession.State.DOCUMENT_CHOISI
            session.save()
            
            DemandeAttestation.objects.create(
                etudiant=session.etudiant,
                type_attestation=type_att,
                statut=DemandeAttestation.Statut.EN_ATTENTE
            )
            
            return self._build_response(
                text=f"Votre demande d'Attestation de Niveau {message} a été envoyée. Une fois validée par l'administration et imprimée, veuillez vous rendre dans le bureau du Directeur (Dr Ibrahima Kalil TOURE) pour obtenir la signature et le cachet.",
                options=[{"label": "Faire une autre demande", "value": "RESTART"}],
                state=session.current_state,
                session_id=session_id
            )
                
        elif session.current_state == ConversationSession.State.DOCUMENT_CHOISI:
            if message == "RESTART":
                session.current_state = ConversationSession.State.AUTHENTIFIE
                session.save()
                return self._build_response(
                    text="Quel autre document souhaitez-vous demander ?",
                    options=[
                        {"label": "Attestation d'Inscription", "value": "INSCRIPTION"},
                        {"label": "Attestation de Niveau", "value": "NIVEAU"},
                        {"label": "📄 Télécharger mes attestations", "value": "SUIVI"}
                    ],
                    state=session.current_state,
                    session_id=session_id
                )
            return self._build_response(
                text="Je n'ai pas compris. Veuillez utiliser les boutons.",
                options=[{"label": "Faire une autre demande", "value": "RESTART"}],
                state=session.current_state,
                session_id=session_id
            )

        return Response({"error": "État inconnu"}, status=status.HTTP_400_BAD_REQUEST)

    def _build_response(self, text, options, state, session_id):
        return Response({
            "session_id": session_id,
            "text": text,
            "options": options,
            "next_state": state
        })
