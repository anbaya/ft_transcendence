from django.http import FileResponse

from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.response import Response

from .models import Document
from .serializers import DocumentSerializer
from .project_service import get_project, get_project_members
from .permissions import IsInternalService

class ProjectDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get_access_token(self):
        auth_header = self.request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            raise PermissionDenied(
                "Invalid authorization header."
            )

        return auth_header.split(" ", 1)[1]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user_id = self.request.user.id
        role = self.request.user.role

        access_token = self.get_access_token()

        project = get_project(project_id, access_token)

        if project is None:
            raise NotFound("Project not found.")

        
        if role == "ADMIN" or str(project.get("created_by")) == str(user_id):
            return Document.objects.filter(
                project_id=project_id
            ).order_by('-uploaded_at')

        members = get_project_members(project_id, access_token)

        if members is None:
            raise NotFound("Project not found.")

        is_member = any(
            str(member.get("user_id")) == str(user_id)
            for member in members
        )

        if not is_member:
            raise PermissionDenied(
                "You do not have access to this project's documents."
            )

        return Document.objects.filter(
            project_id=project_id
        ).order_by('-uploaded_at')

    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        user_id = self.request.user.id
        role = self.request.user.role

        access_token = self.get_access_token()

        project = get_project(project_id, access_token)

        if project is None:
            raise NotFound("Project not found.")

        if role != "ADMIN" and str(project.get("created_by")) != str(user_id):

            members = get_project_members(
                project_id,
                access_token
            )

            if members is None:
                raise NotFound("Project not found.")

            is_member = any(
                str(member.get("user_id")) == str(user_id)
                for member in members
            )

            if not is_member:
                raise PermissionDenied(
                    "You cannot upload documents to this project."
                )

        serializer.save(
            project_id=project_id,
            uploaded_by_id=user_id
        )

class DocumentDetailView(generics.RetrieveDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_access_token(self):
        auth_header = self.request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            raise PermissionDenied(
                "Invalid authorization header."
            )

        return auth_header.split(" ", 1)[1]

    
    def retrieve(self, request, *args, **kwargs):
        document = self.get_object()

        user_id = request.user.id
        role = request.user.role

        
        if role == "ADMIN":
            return Response(
                DocumentSerializer(document).data,
                status=status.HTTP_200_OK
            )

        access_token = self.get_access_token()

        project = get_project(
            document.project_id,
            access_token
        )

        if project is None:
            raise NotFound("Project not found.")

        
        if str(project.get("created_by")) == str(user_id):
            return Response(
                DocumentSerializer(document).data,
                status=status.HTTP_200_OK
            )

        members = get_project_members(
            document.project_id,
            access_token
        )

        if members is None:
            raise NotFound("Project not found.")

        is_member = any(
            str(member.get("user_id")) == str(user_id)
            for member in members
        )

        if not is_member:
            raise PermissionDenied(
                "You do not have access to this document."
            )

        return Response(
            DocumentSerializer(document).data,
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        document = self.get_object()

        user_id = request.user.id
        role = request.user.role

        if role != "ADMIN":
            access_token = self.get_access_token()

            project = get_project(
                document.project_id,
                access_token
            )

            if project is None:
                raise NotFound("Project not found.")

            is_project_owner = str(project.get("created_by")) == str(user_id)
            is_uploader = str(document.uploaded_by_id) == str(user_id)

            if not is_project_owner and not is_uploader:
                raise PermissionDenied(
                    "Only the uploader, project creator, or ADMIN can delete documents."
                )

        if document.file:
            document.file.delete(save=False)

        document.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

class DocumentDownloadView(generics.GenericAPIView):
    queryset = Document.objects.all()
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        document = self.get_object()

        user_id = request.user.id
        role = request.user.role

        if role != "ADMIN":
            auth_header = request.headers.get("Authorization", "")

            if not auth_header.startswith("Bearer "):
                raise PermissionDenied(
                    "Invalid authorization header."
                )

            access_token = auth_header.split(" ", 1)[1]

            project = get_project(
                document.project_id,
                access_token
            )

            if project is None:
                raise NotFound("Project not found.")

            if str(project.get("created_by")) != str(user_id):
                members = get_project_members(
                    document.project_id,
                    access_token
                )

                if members is None:
                    raise NotFound("Project not found.")

                is_member = any(
                    str(member.get("user_id")) == str(user_id)
                    for member in members
                )

                if not is_member:
                    raise PermissionDenied(
                        "You do not have access to this document."
                    )

        
        if not document.file:
            raise NotFound("File not found.")

        try:
            return FileResponse(
                document.file.open('rb'),
                as_attachment=True,
                filename=document.name
            )

        except FileNotFoundError:
            raise NotFound("File not found.")


class ProjectDocumentsDeleteView(generics.GenericAPIView):
    permission_classes = [IsInternalService]

    def delete(self, request, project_id, *args, **kwargs):
        documents = Document.objects.filter(
            project_id=project_id
        )

        for document in documents:
            if document.file:
                document.file.delete(save=False)

        documents.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class UserDocumentsListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        auth_header = self.request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise PermissionDenied("Invalid authorization header.")
        access_token = auth_header.split(" ", 1)[1]

        role = getattr(self.request.user, "role", None)
        if role == "ADMIN":
            return Document.objects.all().order_by('-uploaded_at')

        try:
            import requests
            from .project_service import PROJECT_SERVICE_URL
            url = f"{PROJECT_SERVICE_URL}/api/projects/"
            res = requests.get(url, headers={"Authorization": f"Bearer {access_token}"}, timeout=5)
            if res.ok:
                projects = res.json()
                project_ids = [p['id'] for p in projects if 'id' in p]
                return Document.objects.filter(project_id__in=project_ids).order_by('-uploaded_at')
        except Exception:
            pass

        return Document.objects.none()
