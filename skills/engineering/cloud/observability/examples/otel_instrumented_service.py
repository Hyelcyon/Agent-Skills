import logging
import os
import time
from typing import Any
from wsgiref.simple_server import make_server

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

resource = Resource.create({"service.name": "order-processor", "service.version": "1.0.0"})
tracer_provider = TracerProvider(resource=resource)
tracer_provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(tracer_provider)
tracer = trace.get_tracer("order-processor")

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP Requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP Request Latency",
    ["method", "endpoint"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5]
)

class ContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        current_span = trace.get_current_span()
        span_ctx = current_span.get_span_context() if current_span else None
        if span_ctx and span_ctx.is_valid:
            record.trace_id = format(span_ctx.trace_id, "032x")
            record.span_id = format(span_ctx.span_id, "016x")
        else:
            record.trace_id = "0" * 32
            record.span_id = "0" * 16
        return True

logger = logging.getLogger("order-processor")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('{"time":"%(asctime)s","level":"%(levelname)s","trace_id":"%(trace_id)s","span_id":"%(span_id)s","msg":"%(message)s"}'))
logger.addHandler(handler)
logger.addFilter(ContextFilter())

def application(environ: dict[str, Any], start_response: Any) -> Any:
    path = environ.get("PATH_INFO", "/")
    method = environ.get("REQUEST_METHOD", "GET")

    if path == "/metrics":
        start_response("200 OK", [("Content-Type", CONTENT_TYPE_LATEST)])
        return [generate_latest()]

    start_time = time.monotonic()
    status_code = "200"

    with tracer.start_as_current_span(f"{method} {path}") as span:
        span.set_attribute("http.method", method)
        span.set_attribute("http.target", path)

        if path == "/order":
            logger.info("Executing transactional order creation")
            time.sleep(0.02)
            body = b'{"status":"order_created","order_id":"ord-9923"}'
        elif path == "/healthz":
            body = b'{"status":"healthy"}'
        else:
            status_code = "404"
            body = b'{"error":"not_found"}'

        duration = time.monotonic() - start_time
        REQUEST_COUNT.labels(method=method, endpoint=path, status=status_code).inc()
        REQUEST_LATENCY.labels(method=method, endpoint=path).observe(duration)

        start_response(f"{status_code} OK", [("Content-Type", "application/json")])
        return [body]

if __name__ == "__main__":
    bind_host = os.environ.get("BIND_HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8080"))
    server = make_server(bind_host, port, application)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        tracer_provider.shutdown()
