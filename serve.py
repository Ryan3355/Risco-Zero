#!/usr/bin/env python3
"""Serve the checklist over HTTP so it can be opened from a QR Code.

Only Python's standard library is required.  Use --public-url when the address
shown in the kiosk browser differs from the public (or intranet) address that
phones should open.
"""

from __future__ import annotations

import argparse
import html
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent


def public_url(value: str) -> str:
    """Validate a URL that will be inserted into the page's QR configuration."""
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise argparse.ArgumentTypeError("use a complete HTTP(S) URL, such as http://192.168.1.20:8080")
    return value.rstrip("/")


def make_handler(qr_url: str | None):
    class ChecklistHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(ROOT), **kwargs)

        def end_headers(self):
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "same-origin")
            super().end_headers()

        def do_GET(self):
            if self.path.split("?", 1)[0] in {"", "/", "/index.html"} and qr_url:
                self.serve_index_with_qr_url()
                return
            super().do_GET()

        def serve_index_with_qr_url(self):
            page = (ROOT / "index.html").read_text(encoding="utf-8")
            page = page.replace(
                '<body data-site-url="">',
                f'<body data-site-url="{html.escape(qr_url, quote=True)}">',
                1,
            )
            content = page.encode("utf-8")
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)

    return ChecklistHandler


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the checklist for QR Code access.")
    parser.add_argument("--host", default="0.0.0.0", help="network interface to listen on (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8080, help="HTTP port (default: 8080)")
    parser.add_argument("--public-url", type=public_url, help="HTTP(S) address encoded in the QR Code")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), make_handler(args.public_url))
    address = args.public_url or f"http://{args.host}:{args.port}"
    print(f"Checklist available at {address}")
    print("Press Ctrl+C to stop the server.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
