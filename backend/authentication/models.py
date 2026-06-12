from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Modèle utilisateur de base unifié pour gérer l'authentification.
    Les détails spécifiques aux étudiants et aux agents sont gérés dans des modèles séparés (OneToOne).
    """
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', _('Administrateur')
        ETUDIANT = 'ETUDIANT', _('Étudiant')

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.ETUDIANT,
        help_text="Le rôle de l'utilisateur définit ses permissions de base dans l'application."
    )
    
    # Pour s'assurer que l'email est unique et obligatoire pour les administrateurs
    email = models.EmailField(_('email address'), unique=True, null=True, blank=True)

    def is_student(self) -> bool:
        return self.role == self.Roles.ETUDIANT
        
    def is_admin(self) -> bool:
        return self.role == self.Roles.ADMIN

class Etudiant(models.Model):
    """
    Profil spécifique contenant les informations liées à la scolarité de l'étudiant.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='etudiant_profile')
    numero_etudiant = models.CharField(max_length=50, unique=True, help_text="Numéro matricule unique de l'étudiant")
    ine = models.CharField(max_length=50, unique=True, null=True, blank=True, help_text="Identifiant National Étudiant (INE)")
    
    genre = models.CharField(max_length=1, choices=[('M', 'Masculin'), ('F', 'Féminin')], default='M')
    date_naissance = models.DateField(null=True, blank=True)
    lieu_naissance = models.CharField(max_length=150, null=True, blank=True)
    prenom_pere = models.CharField(max_length=150, null=True, blank=True)
    prenom_nom_mere = models.CharField(max_length=150, null=True, blank=True)
    
    faculte = models.CharField(max_length=150, default="CENTRE INFORMATIQUE")
    departement = models.CharField(max_length=50, choices=[('DLSI', 'DLSI'), ('NTIC', 'NTIC')], default='DLSI')
    programme = models.CharField(max_length=150, default="DEVELOPPEMENT LOGICIEL")
    
    filiere = models.CharField(max_length=150)
    niveau = models.CharField(max_length=50)
    annee_inscription = models.CharField(max_length=9, help_text="Exemple: 2023-2024")
    
    # Validation des niveaux pour l'Attestation de Niveau
    a_valide_l1 = models.BooleanField(default=False, help_text="L'étudiant a validé toutes les matières de la L1")
    a_valide_l2 = models.BooleanField(default=False, help_text="L'étudiant a validé toutes les matières de la L2")
    a_valide_l3 = models.BooleanField(default=False, help_text="L'étudiant a validé toutes les matières de la L3")

    class Meta:
        verbose_name = "Étudiant"
        verbose_name_plural = "Étudiants"

    def __str__(self) -> str:
        return f"{self.numero_etudiant} - {self.user.first_name} {self.user.last_name}"

class Admin(models.Model):
    """
    Profil spécifique pour les agents administratifs et administrateurs système.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')

    class Meta:
        verbose_name = "Administrateur"
        verbose_name_plural = "Administrateurs"

    def __str__(self) -> str:
        return f"[{self.user.get_role_display()}] {self.user.first_name} {self.user.last_name}"
