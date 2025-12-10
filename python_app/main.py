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
        # Running as compiled .exe
        # PyInstaller puts data in sys._MEIPASS
        base_path = sys._MEIPASS
        # We will configure PyInstaller to put 'dist' at the root of _MEIPASS
        return os.path.join(base_path, 'dist')
    else:
        # Running as script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # dist is in the project root, one level up
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

def run_server(dist_path, port):
    os.chdir(dist_path)
    # Bind to localhost only for security
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
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

    # Start a simple HTTP server in a separate thread
    port = get_free_port()
    t = threading.Thread(target=run_server, args=(dist_dir, port), daemon=True)
    t.start()

    # Create the window
    webview.create_window(
        'Kitap Pastası POS',
        f'http://127.0.0.1:{port}',
        width=1280,
        height=800,
        resizable=True,
        min_size=(800, 600)
    )

    # Start the GUI loop
    webview.start()

if __name__ == '__main__':
    main()
