import tkinter as tk
from tkinter import ttk
from styles import *

class DashboardView(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg=BG_MAIN)
        self.controller = controller

        # Header
        header = tk.Frame(self, bg=BG_MAIN)
        header.pack(fill=tk.X, padx=40, pady=40)

        tk.Label(header, text="Özet Rapor", font=("Times New Roman", 28, "bold"), bg=BG_MAIN, fg=TEXT_MAIN).pack(anchor="w")
        tk.Label(header, text="Günlük işletme istatistikleri", font=FONT_NORMAL, bg=BG_MAIN, fg=TEXT_MUTED).pack(anchor="w")

        # Stats Grid
        stats_frame = tk.Frame(self, bg=BG_MAIN)
        stats_frame.pack(fill=tk.X, padx=40, pady=20)

        # Calculate Stats
        occupied_count = sum(1 for t in self.controller.tables if t.isOccupied)
        total_tables = len(self.controller.tables)

        active_revenue = sum(
            sum(item.price * item.quantity for item in t.orders)
            for t in self.controller.tables
        )

        active_items = sum(
            sum(item.quantity for item in t.orders)
            for t in self.controller.tables
        )

        # Cards
        self.create_stat_card(stats_frame, "Anlık Ciro (Açık Masalar)", f"₺{active_revenue:.2f}", ACCENT_GREEN, 0)
        self.create_stat_card(stats_frame, "Doluluk Oranı", f"{occupied_count} / {total_tables}", ACCENT_BLUE, 1)
        self.create_stat_card(stats_frame, "Aktif Sipariş Kalemi", str(active_items), ACCENT_AMBER, 2)

        # AI Section Placeholder
        ai_frame = tk.Frame(self, bg="#292524", padx=30, pady=30)
        ai_frame.pack(fill=tk.X, padx=40, pady=40)

        tk.Label(ai_frame, text="✨ GÜNÜN YAPAY ZEKA ÖNERİSİ", font=("Segoe UI", 10, "bold"), bg="#292524", fg=ACCENT_AMBER).pack(anchor="w")
        tk.Label(ai_frame, text="Kitap & Kahve Eşleşmesi", font=("Times New Roman", 24, "bold"), bg="#292524", fg=WHITE).pack(anchor="w", pady=(10, 5))

        suggestion = "Bugünün yağmurlu havasında, Dostoyevski'nin 'Suç ve Ceza'sı ile koyu kavrulmuş bir Türk Kahvesi mükemmel gider. Yanına bitter çikolatalı kurabiye eklemeyi unutmayın."

        tk.Label(ai_frame, text=f'"{suggestion}"', font=("Segoe UI", 12, "italic"), bg="#292524", fg="#d6d3d1", wraplength=800, justify="left").pack(anchor="w", pady=(10, 0))

    def create_stat_card(self, parent, title, value, color, col):
        card = tk.Frame(parent, bg=WHITE, padx=25, pady=25)
        card.grid(row=0, column=col, padx=10, sticky="ew")

        # Icon placeholder (Circle)
        icon_frame = tk.Frame(card, bg=color, width=50, height=50) # In a real app, use canvas for circle
        # Simplified square for icon bg

        tk.Label(card, text=title, font=("Segoe UI", 10, "bold"), bg=WHITE, fg=TEXT_MUTED).pack(anchor="w")
        tk.Label(card, text=value, font=("Segoe UI", 24, "bold"), bg=WHITE, fg=TEXT_MAIN).pack(anchor="w", pady=(5,0))

        parent.grid_columnconfigure(col, weight=1)
