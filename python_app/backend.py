import os
import sys
import sqlite3
import json
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Setup Paths
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
    DIST_DIR = os.path.join(BASE_DIR, 'dist')
    DB_PATH = os.path.join(os.path.dirname(sys.executable), 'kitap_pastasi.db')
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DIST_DIR = os.path.join(BASE_DIR, '..', 'dist')
    DB_PATH = os.path.join(BASE_DIR, 'kitap_pastasi.db')

app = Flask(__name__, static_folder=DIST_DIR)
CORS(app)

# Database Setup
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS daily_sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            total_revenue REAL NOT NULL,
            total_items INTEGER NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- Routes ---

@app.route('/')
def index():
    if os.path.exists(os.path.join(DIST_DIR, 'index.html')):
        return send_from_directory(DIST_DIR, 'index.html')
    return "App is loading... Please ensure 'npm run build' has been run.", 200

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, 'index.html')

# --- API ---

@app.route('/api/end-of-day', methods=['POST'])
def end_of_day():
    data = request.json
    # Expected: { tables: [...], products: [...] } or calculated totals
    # Let's expect the frontend to send the summary or full data

    date_str = datetime.now().strftime('%Y-%m-%d')

    tables = data.get('tables', [])

    # Calculate totals
    total_revenue = 0
    total_items = 0

    for table in tables:
        for item in table.get('orders', []):
            total_revenue += item.get('price', 0) * item.get('quantity', 0)
            total_items += item.get('quantity', 0)

    details_json = json.dumps(data)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO daily_sales (date, total_revenue, total_items, details)
            VALUES (?, ?, ?, ?)
        ''', (date_str, total_revenue, total_items, details_json))
        conn.commit()
        message = "Gün sonu başarıyla kaydedildi."
    except sqlite3.IntegrityError:
        # Update existing
        c.execute('''
            UPDATE daily_sales
            SET total_revenue = ?, total_items = ?, details = ?, created_at = CURRENT_TIMESTAMP
            WHERE date = ?
        ''', (total_revenue, total_items, details_json, date_str))
        conn.commit()
        message = "Gün sonu güncellendi."
    finally:
        conn.close()

    return jsonify({"success": True, "message": message, "date": date_str})

@app.route('/api/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM daily_sales ORDER BY date DESC')
    rows = c.fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            "id": row['id'],
            "date": row['date'],
            "total_revenue": row['total_revenue'],
            "total_items": row['total_items'],
            "created_at": row['created_at']
            # We don't send details unless requested to keep it light
        })

    return jsonify(history)

@app.route('/api/history/<int:id>', methods=['GET'])
def get_history_detail(id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM daily_sales WHERE id = ?', (id,))
    row = c.fetchone()
    conn.close()

    if row:
        return jsonify({
            "id": row['id'],
            "date": row['date'],
            "total_revenue": row['total_revenue'],
            "total_items": row['total_items'],
            "details": json.loads(row['details']),
            "created_at": row['created_at']
        })
    return jsonify({"error": "Not found"}), 404

if __name__ == '__main__':
    app.run(port=5000, debug=True)
