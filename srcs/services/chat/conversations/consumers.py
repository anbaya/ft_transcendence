from urllib.parse import parse_qs
import requests
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken
from .models import Conversation, Message
from .project_service import get_project, get_project_members
from .auth_service import get_user
from notifications.services import create_notification


class ChatConsumer(AsyncJsonWebsocketConsumer):

    @sync_to_async
    def check_project_access(self, token):
        return get_project(
            self.project_id,
            f"Bearer {token}"
        )

    @sync_to_async
    def get_members(self):
        return get_project_members(
            self.project_id,
            f"Bearer {self.token}"
        )

    @sync_to_async
    def get_sender(self):
        return get_user(self.user_id)

    
    @database_sync_to_async
    def conversation_exists(self):
        return Conversation.objects.filter(
            project_id=self.project_id
        ).exists()

    

    async def connect(self):
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if not token:
            await self.close(code=4401)
            return

        try:
            validated_token = AccessToken(token)
        except TokenError:
            await self.close(code=4401)
            return

        user_id = validated_token.get("user_id")
        role = validated_token.get("role")

        if user_id is None:
            await self.close(code=4401)
            return

        self.user_id = user_id
        self.role = role
        self.token = token

        self.project_id = self.scope["url_route"]["kwargs"]["project_id"]

        try:
            project = await self.check_project_access(token)

            self.project_name = project.get(
                "name",
                f"Project {self.project_id}"
            )

        except (requests.RequestException, RuntimeError):
            await self.close(code=4403)
            return

        if not await self.conversation_exists():
            await self.close(code=4404)
            return

        self.group_name = f"project_chat_{self.project_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive_json(self, content):
        try:
            await self.check_project_access(self.token)
        except (requests.RequestException, RuntimeError):
            await self.send_json({
                "error": "You no longer have access to this project."
            })
            await self.close(code=4403)
            return
        message = content.get("content")

        if message is None:
            message = content.get("message")

        if not isinstance(message, str) or not message.strip():
            await self.send_json({
                "error": "The message cannot be empty."
            })
            return


        message = message.strip()

        saved_message = await self.save_message(message)

        sender_name = f"User {self.user_id}"
        try:
            sender = await self.get_sender()
            formatted_name = f"{sender.get('first_name', '')} {sender.get('last_name', '')}".strip()
            if formatted_name:
                sender_name = formatted_name
        except (requests.RequestException, RuntimeError):
            pass

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",
                "id": saved_message.id,
                "sender_id": saved_message.sender_id,
                "sender_name": sender_name,
                "message": saved_message.content,
                "created_at": saved_message.created_at.isoformat(),
            }
        )

        try:
            members = await self.get_members()
            await self.create_message_notifications(
                members,
                saved_message.content,
                sender_name
            )

        except (requests.RequestException, RuntimeError):
            pass

    @database_sync_to_async
    def save_message(self, content):
        conversation = Conversation.objects.get(
            project_id=self.project_id
        )

        return Message.objects.create(
            conversation=conversation,
            sender_id=self.user_id,
            content=content
        )

    @database_sync_to_async
    def create_message_notifications(
        self,
        members,
        message,
        sender_name
    ):
        for member in members:
            user_id = member.get("user_id")

            if user_id is not None and str(user_id) != str(self.user_id):
                create_notification(
                    user_id=user_id,
                    title="New message",
                    message=(
                        f"{sender_name} sent a message "
                        f"in project {self.project_name}:\n"
                        f"{message}"
                    )
                )

    async def chat_message(self, event):
        data = {
            "id": event["id"],
            "sender_id": event["sender_id"],
            "sender": event["sender_id"],
            "sender_name": event.get("sender_name", f"User {event['sender_id']}"),
            "message": event["message"],
            "content": event["message"],
            "sent_at": event["created_at"],
            "created_at": event["created_at"],
        }

        await self.send_json({
            "type": "message.new",
            "payload": data,
            **data,
        })
