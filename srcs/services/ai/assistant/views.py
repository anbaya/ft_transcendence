import threading
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import PermissionDenied, NotFound

from .models import AIInteraction
from .serializers import AIInteractionSerializer
from .rag import (
    answer_project_question,
    answer_general_question,
    index_single_document_by_id,
    delete_single_document_data,
)
from .project_service import get_project
from .permissions import IsInternalService

class AskAssistantView(APIView):
    def post(self, request, project_id=None):
        question = request.data.get("question", "").strip()
        if not question:
            return Response(
                {"error": "Question is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_project_id = project_id or request.data.get("project_id")
        if target_project_id in ("", "0", 0, None):
            target_project_id = None

        authorization = request.headers.get("Authorization", "")

        if target_project_id:
            try:
                project_data = get_project(target_project_id, authorization)
            except requests.HTTPError as e:
                if e.response is not None and e.response.status_code in (401, 403):
                    return Response(
                        {"error": "Access to project denied."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                if e.response is not None and e.response.status_code == 404:
                    return Response(
                        {"error": "Project not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )
                return Response(
                    {"error": "Unable to contact project service."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except Exception:
                return Response(
                    {"error": "Access to project denied or project not found."},
                    status=status.HTTP_403_FORBIDDEN
                )

            recent_interactions = list(
                AIInteraction.objects.filter(
                    user_id=request.user.id,
                    project_id=target_project_id,
                ).order_by('-created_at', '-id')[:3]
            )
            recent_interactions.reverse()
            history_text = "\n".join(
                f"User: {item.question}\nAssistant: {item.answer}"
                for item in recent_interactions
            )

            answer = answer_project_question(
                project_id=target_project_id,
                question=question,
                authorization_header=authorization,
                project_data=project_data,
                conversation_history=history_text,
            )

            AIInteraction.objects.create(
                user_id=request.user.id,
                project_id=target_project_id,
                question=question,
                answer=answer,
            )

            return Response({
                "answer": answer,
                "mode": "project",
                "project_id": target_project_id,
            })

        recent_interactions = list(
            AIInteraction.objects.filter(
                user_id=request.user.id,
                project_id__isnull=True,
            ).order_by('-created_at', '-id')[:3]
        )
        recent_interactions.reverse()
        history_text = "\n".join(
            f"User: {item.question}\nAssistant: {item.answer}"
            for item in recent_interactions
        )

        answer = answer_general_question(
            question=question,
            conversation_history=history_text,
        )

        AIInteraction.objects.create(
            user_id=request.user.id,
            project_id=None,
            question=question,
            answer=answer,
        )

        return Response({
            "answer": answer,
            "mode": "general",
        })

class AIInteractionHistoryView(ListAPIView):
    serializer_class = AIInteractionSerializer

    def get_queryset(self):
        user_id = self.request.user.id
        project_id = self.kwargs.get("project_id") or self.request.query_params.get("project_id")

        if project_id in ("general", "null", "none"):
            return AIInteraction.objects.filter(user_id=user_id, project_id__isnull=True)

        if project_id:
            authorization = self.request.headers.get("Authorization", "")
            try:
                get_project(project_id, authorization)
            except Exception:
                raise PermissionDenied("Access to project denied.")

            return AIInteraction.objects.filter(user_id=user_id, project_id=project_id)

        return AIInteraction.objects.filter(user_id=user_id)

    def delete(self, request, *args, **kwargs):
        user_id = request.user.id
        project_id = kwargs.get("project_id") or request.query_params.get("project_id")

        if project_id in ("general", "null", "none"):
            AIInteraction.objects.filter(user_id=user_id, project_id__isnull=True).delete()
        elif project_id:
            authorization = request.headers.get("Authorization", "")
            try:
                get_project(project_id, authorization)
            except Exception:
                raise PermissionDenied("Access to project denied.")
            AIInteraction.objects.filter(user_id=user_id, project_id=project_id).delete()
        else:
            AIInteraction.objects.filter(user_id=user_id).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class InternalDocumentIndexWebhookView(APIView):
    authentication_classes = []
    permission_classes = [IsInternalService]

    def post(self, request):
        document_id = request.data.get("document_id")
        project_id = request.data.get("project_id")
        filename = request.data.get("filename")

        if not document_id or not project_id:
            return Response(
                {"error": "document_id and project_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        threading.Thread(
            target=index_single_document_by_id,
            args=(project_id, document_id, filename),
            daemon=True,
        ).start()

        return Response(
            {
                "status": "indexing_scheduled",
                "document_id": document_id,
                "project_id": project_id,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class InternalDocumentDeleteWebhookView(APIView):
    authentication_classes = []
    permission_classes = [IsInternalService]

    def delete(self, request, document_id):
        threading.Thread(
            target=delete_single_document_data,
            args=(document_id,),
            daemon=True,
        ).start()

        return Response(
            {
                "status": "deletion_scheduled",
                "document_id": document_id,
            },
            status=status.HTTP_200_OK,
        )


class ProjectDocumentsSyncView(APIView):
    def post(self, request, project_id):
        authorization = request.headers.get("Authorization", "")
        try:
            get_project(project_id, authorization)
        except Exception:
            raise PermissionDenied("Access to project denied.")

        from .rag import index_project_documents
        threading.Thread(
            target=index_project_documents,
            args=(project_id, authorization),
            daemon=True,
        ).start()

        return Response(
            {"status": "sync_scheduled", "project_id": project_id},
            status=status.HTTP_202_ACCEPTED,
        )

