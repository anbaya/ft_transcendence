from django.urls import path
from .views import (
    ProjectListView,
    ProjectDetailView,
    ProjectMemberListView,
    ProjectMemberDetailView,
)

urlpatterns = [
    path('', ProjectListView.as_view(), name='project-list'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path(
        '<int:project_id>/members/',
        ProjectMemberListView.as_view(),
        name='project-members'
    ),
    path(
        '<int:project_id>/members/<int:pk>/',
        ProjectMemberDetailView.as_view(),
        name='project-member-detail'
    ),
]
