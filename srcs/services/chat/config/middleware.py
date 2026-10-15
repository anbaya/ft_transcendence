from threading import Lock

REQUEST_COUNT = 0
REQUEST_LOCK = Lock()


def get_request_count():
    with REQUEST_LOCK:
        return REQUEST_COUNT


class RequestCountMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        global REQUEST_COUNT

        response = self.get_response(request)

        if request.path not in ("/metrics", "/health"):
            with REQUEST_LOCK:
                REQUEST_COUNT += 1

        return response