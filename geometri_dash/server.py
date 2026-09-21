#!/usr/bin/env python3
"""
Simple HTTP server for Geometry Dash game
Run with: python3 server.py
"""

import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"╔════════════════════════════════════════════╗")
        print(f"║   GEOMETRY DASH - Ultra Edition Server    ║")
        print(f"╚════════════════════════════════════════════╝")
        print(f"\n🚀 Server running at: http://localhost:{PORT}")
        print(f"📁 Serving directory: {DIRECTORY}")
        print(f"\n🎮 Open your browser and navigate to:")
        print(f"   http://localhost:{PORT}")
        print(f"\n⌨️  Press Ctrl+C to stop the server\n")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✨ Server stopped. Thanks for playing!")
