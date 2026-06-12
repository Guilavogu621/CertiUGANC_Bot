from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Etudiant, Admin

# Utiliser la classe UserAdmin par défaut de Django pour notre CustomUser
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Rôle utilisateur', {'fields': ('role',)}),
    )

@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ('numero_etudiant', 'get_full_name', 'filiere', 'niveau')
    search_fields = ('numero_etudiant', 'user__first_name', 'user__last_name')

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'Nom complet'

@admin.register(Admin)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'get_role')
    
    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'Nom complet'

    def get_role(self, obj):
        return obj.user.get_role_display()
    get_role.short_description = 'Rôle'
