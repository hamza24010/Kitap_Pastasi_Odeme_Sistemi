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
    c.execute('''
        CREATE TABLE IF NOT EXISTS debts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            total_amount REAL NOT NULL,
            remaining_amount REAL NOT NULL,
            items TEXT,
            is_paid INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS debt_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            debt_id INTEGER,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(debt_id) REFERENCES debts(id)
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

    date_str = datetime.now().strftime('%Y-%m-%d')

    # Try to get pre-calculated totals from frontend
    total_revenue = data.get('total_revenue')
    total_items = data.get('total_items')

    # If not provided, fallback to calculating from active tables (old behavior)
    if total_revenue is None or total_items is None:
        total_revenue = 0
        total_items = 0
        tables = data.get('tables', [])
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

# --- Debt API ---

@app.route('/api/debts', methods=['GET'])
def get_debts():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    # Get debts that are not fully paid or have some recent activity
    c.execute('SELECT * FROM debts WHERE is_paid = 0 ORDER BY updated_at DESC')
    rows = c.fetchall()
    conn.close()

    debts = []
    for row in rows:
        debts.append({
            "id": row['id'],
            "name": row['name'],
            "total_amount": row['total_amount'],
            "remaining_amount": row['remaining_amount'],
            "items": json.loads(row['items']) if row['items'] else [],
            "created_at": row['created_at'],
            "updated_at": row['updated_at']
        })
    return jsonify(debts)

@app.route('/api/debts', methods=['POST'])
def create_debt():
    data = request.json
    name = data.get('name')
    total_amount = data.get('total_amount')
    items = json.dumps(data.get('items', []))

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO debts (name, total_amount, remaining_amount, items)
        VALUES (?, ?, ?, ?)
    ''', (name, total_amount, total_amount, items))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route('/api/debts/<int:id>/pay', methods=['POST'])
def pay_debt(id):
    data = request.json
    amount = float(data.get('amount'))
    date_str = datetime.now().strftime('%Y-%m-%d')

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Get current debt
    c.execute('SELECT remaining_amount FROM debts WHERE id = ?', (id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Debt not found"}), 404

    current_remaining = row[0]
    new_remaining = max(0, current_remaining - amount)
    is_paid = 1 if new_remaining <= 0 else 0

    # Update debt
    c.execute('''
        UPDATE debts
        SET remaining_amount = ?, is_paid = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (new_remaining, is_paid, id))

    # Record payment
    c.execute('''
        INSERT INTO debt_payments (debt_id, amount, date)
        VALUES (?, ?, ?)
    ''', (id, amount, date_str))

    conn.commit()
    conn.close()

    return jsonify({"success": True, "remaining": new_remaining})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
