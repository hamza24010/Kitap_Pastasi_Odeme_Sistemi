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
from styles import *

class App(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Kitap Pastası")
        self.geometry("1280x800")
        self.configure(bg=BG_MAIN)

        # Data Loading
        self.products = StorageService.load_products()
        self.tables = StorageService.load_tables()

        # Layout
        self.sidebar = tk.Frame(self, width=SIDEBAR_WIDTH, bg=BG_SIDEBAR)
        self.sidebar.pack(side=tk.LEFT, fill=tk.Y)
        self.sidebar.pack_propagate(False) # Prevent shrinking

        self.content_area = tk.Frame(self, bg=BG_MAIN)
        self.content_area.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        self.active_page = "pos"
        self.nav_buttons = {}

        self.setup_sidebar()
        self.show_pos()

    def setup_sidebar(self):
        # Header
        header_frame = tk.Frame(self.sidebar, bg=BG_SIDEBAR, pady=20, padx=20)
        header_frame.pack(fill=tk.X)

        # Icon placeholder (Square)
        icon_box = tk.Label(header_frame, text="KP", bg=ACCENT_AMBER, fg=WHITE, font=("Segoe UI", 12, "bold"), width=4, height=2)
        icon_box.pack(side=tk.LEFT)

        title_frame = tk.Frame(header_frame, bg=BG_SIDEBAR, padx=10)
        title_frame.pack(side=tk.LEFT)

        tk.Label(title_frame, text="Kitap Pastası", bg=BG_SIDEBAR, fg=WHITE, font=("Times New Roman", 14, "bold")).pack(anchor="w")
        tk.Label(title_frame, text="Kafe Yönetim v1.0", bg=BG_SIDEBAR, fg=TEXT_MUTED, font=FONT_SMALL).pack(anchor="w")

        # Separator
        tk.Frame(self.sidebar, bg="#292524", height=1).pack(fill=tk.X, padx=0, pady=10)

        # Nav Items
        nav_frame = tk.Frame(self.sidebar, bg=BG_SIDEBAR, padx=10)
        nav_frame.pack(fill=tk.BOTH, expand=True)

        self.create_sidebar_button(nav_frame, "dashboard", "Özet", self.show_dashboard)
        self.create_sidebar_button(nav_frame, "pos", "Masalar & Sipariş", self.show_pos)
        self.create_sidebar_button(nav_frame, "menu", "Menü Yönetimi", self.show_menu)

        # Footer
        footer_frame = tk.Frame(self.sidebar, bg="#292524", padx=15, pady=15)
        footer_frame.pack(fill=tk.X, side=tk.BOTTOM, padx=15, pady=15)

        tk.Label(footer_frame, text="Sistem Durumu:", bg="#292524", fg=TEXT_SIDEBAR, font=FONT_SMALL).pack(anchor="w")
        tk.Label(footer_frame, text="Çevrimiçi", bg="#292524", fg=ACCENT_GREEN, font=("Segoe UI", 9, "bold")).pack(anchor="w")
        tk.Label(footer_frame, text="Kullanıcı: Kasa 1", bg="#292524", fg=TEXT_SIDEBAR, font=FONT_SMALL).pack(anchor="w", pady=(5,0))


    def create_sidebar_button(self, parent, page_id, text, command):
        btn_frame = tk.Frame(parent, bg=BG_SIDEBAR, pady=2)
        btn_frame.pack(fill=tk.X)

        # Using Label as button to have better control over hover/active states than standard Button
        btn = tk.Label(
            btn_frame,
            text=f"  {text}",
            font=("Segoe UI", 10, "bold"),
            bg=BG_SIDEBAR,
            fg=TEXT_SIDEBAR,
            anchor="w",
            padx=15,
            pady=12,
            cursor="hand2"
        )
        btn.pack(fill=tk.X)

        def on_click(e):
            command()

        btn.bind("<Button-1>", on_click)
        self.nav_buttons[page_id] = btn

        return btn

    def update_sidebar_active_state(self):
        for pid, btn in self.nav_buttons.items():
            if pid == self.active_page:
                btn.configure(bg=ACCENT_AMBER, fg=WHITE)
            else:
                btn.configure(bg=BG_SIDEBAR, fg=TEXT_SIDEBAR)

    def clear_content(self):
        for widget in self.content_area.winfo_children():
            widget.destroy()

    def show_pos(self):
        self.active_page = "pos"
        self.update_sidebar_active_state()
        self.clear_content()
        POSView(self.content_area, self).pack(fill=tk.BOTH, expand=True)

    def show_menu(self):
        self.active_page = "menu"
        self.update_sidebar_active_state()
        self.clear_content()
        MenuView(self.content_area, self).pack(fill=tk.BOTH, expand=True)

    def show_dashboard(self):
        self.active_page = "dashboard"
        self.update_sidebar_active_state()
        self.clear_content()
        DashboardView(self.content_area, self).pack(fill=tk.BOTH, expand=True)

if __name__ == "__main__":
    app = App()
    app.mainloop()
