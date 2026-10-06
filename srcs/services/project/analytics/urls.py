from django.urls import path
from .views import ProjectAnalyticsView

urlpatterns = [
    path(
        'projects/<int:id>/analytics/',
        ProjectAnalyticsView.as_view(),
        name='project-analytics'
    ),
]