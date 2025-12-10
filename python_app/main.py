import webview
import threading
import socket
import sys

# Import the Flask app from backend.py
# If running as script, python_app directory is in path or we are inside it.
try:
    from backend import app
except ImportError:
    # If main.py is run from root (e.g. python python_app/main.py)
    sys.path.append('python_app')
    from backend import app

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
