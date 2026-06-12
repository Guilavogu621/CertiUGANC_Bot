from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TypeAttestationViewSet, DemandeAttestationViewSet

# Création d'un routeur DRF pour générer automatiquement les URLs CRUD
router = DefaultRouter()
router.register(r'types', TypeAttestationViewSet, basename='typeattestation')
router.register(r'demandes', DemandeAttestationViewSet, basename='demandeattestation')

urlpatterns = [
    path('', include(router.urls)),
]
