import tkinter as tk
from tkinter import ttk
from models import StorageService

class DashboardView(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        # Header
        header = ttk.Frame(self)
        header.pack(fill=tk.X, padx=20, pady=20)
        ttk.Label(header, text="Dashboard", font=("Segoe UI", 24, "bold")).pack(side=tk.LEFT)

        # Content
        content = ttk.Frame(self)
        content.pack(fill=tk.BOTH, expand=True, padx=20)

        # Stats Cards
        stats_frame = ttk.Frame(content)
        stats_frame.pack(fill=tk.X, pady=20)

        self.create_stat_card(stats_frame, "Toplam Masa", str(len(self.controller.tables)), 0)

        occupied_count = sum(1 for t in self.controller.tables if t.isOccupied)
        self.create_stat_card(stats_frame, "Dolu Masa", str(occupied_count), 1)

        total_revenue = 0 # In a real app, calculate from historical orders
        self.create_stat_card(stats_frame, "Günlük Ciro", f"{total_revenue:.2f} ₺", 2)

        ttk.Label(content, text="Bu alan geliştirme aşamasındadır.", font=("Segoe UI", 12, "italic")).pack(pady=40)

    def create_stat_card(self, parent, title, value, col):
        frame = ttk.Frame(parent, borderwidth=1, relief="solid", padding=20)
        frame.grid(row=0, column=col, padx=10, sticky="ew")

        ttk.Label(frame, text=title, font=("Segoe UI", 10)).pack()
        ttk.Label(frame, text=value, font=("Segoe UI", 20, "bold")).pack()

        parent.grid_columnconfigure(col, weight=1)
