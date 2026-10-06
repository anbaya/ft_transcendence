from django.urls import path
from .views import OrganizationListView, OrganizationDetailView, OrganizationMemberListView, OrganizationMemberDetailView

urlpatterns = [
    path('', OrganizationListView.as_view(), name='organization-list'),
    path('<int:pk>/', OrganizationDetailView.as_view(), name='organization-detail'),
    path('<int:organization_id>/members/', OrganizationMemberListView.as_view(), name='organization-member-list'),
    path('<int:organization_id>/members/<int:pk>/', OrganizationMemberDetailView.as_view(), name='organization-member-detail'),
]