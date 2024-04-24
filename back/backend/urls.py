from django.conf.urls import include
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', include("registration.urls")),
    path('', include("apiPost.urls")),
    path('coach/', include("coachPage.urls")),
    path('', include("management.urls")),
    path('', include("fight.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
