import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "service.settings")

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application


class ChatConsumer:
    async def __call__(self, scope, receive, send):
        await send({"type": "websocket.accept"})
        while True:
            event = await receive()
            if event["type"] == "websocket.disconnect":
                return
            if event["type"] == "websocket.receive":
                await send({"type": "websocket.send", "text": event.get("text", "")})


async def websocket_application(scope, receive, send):
    if scope["path"].startswith("/ws/"):
        await ChatConsumer()(scope, receive, send)
        return
    await send({"type": "websocket.close", "code": 4404})


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": websocket_application,
})
