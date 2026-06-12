from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView, EtudiantViewSet, ImportEtudiantsCSV

router = DefaultRouter()
router.register(r'etudiants', EtudiantViewSet, basename='etudiant')

urlpatterns = [
    # Endpoint pour se connecter (récupérer le token)
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Endpoint pour rafraîchir un token expiré
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Import CSV
    path('etudiants/import/', ImportEtudiantsCSV.as_view(), name='import_etudiants'),
    
    # CRUD API
    path('', include(router.urls)),
]
