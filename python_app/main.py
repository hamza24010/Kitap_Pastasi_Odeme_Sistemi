import tkinter as tk
from tkinter import ttk
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import StorageService
from views.menu_view import MenuView
from views.pos_view import POSView
from views.dashboard_view import DashboardView

class App(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Kitap Pastası POS")
        self.geometry("1280x800")

        # Data Loading
        self.products = StorageService.load_products()
        self.tables = StorageService.load_tables()

        # Layout
        self.sidebar = ttk.Frame(self, width=200, style="Sidebar.TFrame")
        self.sidebar.pack(side=tk.LEFT, fill=tk.Y)

        self.content_area = ttk.Frame(self)
        self.content_area.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        # Styling
        style = ttk.Style()
        style.configure("Sidebar.TFrame", background="#f5f5f4")

        # Navigation
        self.create_sidebar_button("POS", self.show_pos)
        self.create_sidebar_button("Menü", self.show_menu)
        self.create_sidebar_button("Dashboard", self.show_dashboard)

        # Initial View
        self.show_pos()

    def create_sidebar_button(self, text, command):
        btn = tk.Button(
            self.sidebar,
            text=text,
            command=command,
            font=("Segoe UI", 12),
            bg="#e7e5e4",
            relief="flat",
            pady=15
        )
        btn.pack(fill=tk.X, padx=5, pady=2)

    def clear_content(self):
        for widget in self.content_area.winfo_children():
            widget.destroy()

    def show_pos(self):
        self.clear_content()
        POSView(self.content_area, self).pack(fill=tk.BOTH, expand=True)

    def show_menu(self):
        self.clear_content()
        MenuView(self.content_area, self).pack(fill=tk.BOTH, expand=True)

    def show_dashboard(self):
        self.clear_content()
        DashboardView(self.content_area, self).pack(fill=tk.BOTH, expand=True)

if __name__ == "__main__":
    app = App()
    app.mainloop()
