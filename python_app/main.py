import webview
import threading
import socket
import sys
import os

# Ensure the backend can be imported
# If frozen, PyInstaller should have included it.
# If running as source, we might need to add path.
if not getattr(sys, 'frozen', False):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(current_dir)

try:
    from backend import app
except ImportError as e:
    # If this fails in the frozen app, we want to show a visible error
    import tkinter as tk
    from tkinter import messagebox
    root = tk.Tk()
    root.withdraw()
    messagebox.showerror("Kritik Hata", f"Backend modülü yüklenemedi!\n\n{str(e)}")
    sys.exit(1)

def get_free_port():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('localhost', 0))
    port = sock.getsockname()[1]
    sock.close()
    return port

def run_flask(port):
    # Run flask without reloader to avoid issues in thread
    app.run(host='127.0.0.1', port=port, use_reloader=False)

def main():
    port = get_free_port()

    # Start Flask in a separate thread
    t = threading.Thread(target=run_flask, args=(port,), daemon=True)
    t.start()

    # Create the window pointing to the Flask server
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
