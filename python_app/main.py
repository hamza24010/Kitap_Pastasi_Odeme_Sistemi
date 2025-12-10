import webview
import os
import sys
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socket

def get_free_port():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('localhost', 0))
    port = sock.getsockname()[1]
    sock.close()
    return port

def get_dist_path():
    if getattr(sys, 'frozen', False):
        base_path = sys._MEIPASS
        return os.path.join(base_path, 'dist')
    else:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(current_dir, '..', 'dist')

def show_error(title, message):
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror(title, message)
        root.destroy()
    except ImportError:
        print(f"ERROR: {title}\n{message}")

class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Check if file exists, if not serve index.html (for SPA routing)
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            # If strictly a directory, SimpleHTTPRequestHandler might serve a listing or index.html
            # But if it's a route like /pos, translate_path might point to a non-existent file/dir
            # We want to serve /index.html for any non-asset request
            if not self.path.startswith('/assets/'):
                self.path = '/index.html'

        super().do_GET()

def run_server(dist_path, port):
    os.chdir(dist_path)
    server_address = ('127.0.0.1', port)
    # Use custom handler for SPA support
    httpd = HTTPServer(server_address, SPAHandler)
    print(f"Starting internal server on port {port}...")
    httpd.serve_forever()

def main():
    dist_dir = get_dist_path()

    if not os.path.exists(dist_dir) or not os.path.exists(os.path.join(dist_dir, 'index.html')):
        msg = (
            f"Uygulama arayüz dosyaları bulunamadı!\n\n"
            f"Aranan yol: {dist_dir}\n\n"
            "Lütfen önce React projesini derleyin:\n"
            "1. Terminali açın\n"
            "2. 'npm install' yazın\n"
            "3. 'npm run build' yazın\n"
            "4. Tekrar deneyin."
        )
        print(msg)
        show_error("Dosya Bulunamadı", msg)
        sys.exit(1)

    port = get_free_port()
    t = threading.Thread(target=run_server, args=(dist_dir, port), daemon=True)
    t.start()

    webview.create_window(
        'Kitap Pastası POS',
        f'http://127.0.0.1:{port}',
        width=1280,
        height=800,
        resizable=True,
        min_size=(800, 600)
    )

    webview.start()

if __name__ == '__main__':
    main()
