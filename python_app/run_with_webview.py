import webview
import os
import sys
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(CURRENT_DIR, '..', 'dist')

def run_server(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=3000):
    os.chdir(DIST_DIR)
    server_address = ('127.0.0.1', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

def main():
    if not os.path.exists(DIST_DIR):
        print("Error: 'dist' directory not found.")
        print("Please run 'npm run build' in the root directory first.")
        sys.exit(1)

    # Start a simple HTTP server in a separate thread
    # This is often more reliable for React apps than loading file:// directly due to routing/CORS
    port = 3456
    t = threading.Thread(target=run_server, kwargs={'port': port}, daemon=True)
    t.start()

    # Create the window
    webview.create_window(
        'Kitap Pastası POS',
        f'http://127.0.0.1:{port}',
        width=1280,
        height=800,
        resizable=True
    )

    # Start the GUI loop
    webview.start()

if __name__ == '__main__':
    main()
