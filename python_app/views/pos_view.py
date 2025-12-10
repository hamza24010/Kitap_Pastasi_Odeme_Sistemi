import tkinter as tk
from tkinter import ttk, messagebox
import datetime
from models import StorageService, CartItem
from styles import *

class POSView(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg=BG_MAIN)
        self.controller = controller

        # Header
        header = tk.Frame(self, bg=BG_MAIN)
        header.pack(fill=tk.X, padx=40, pady=40)

        tk.Label(header, text="Salon Görünümü", font=("Times New Roman", 28, "bold"), bg=BG_MAIN, fg=TEXT_MAIN).pack(side=tk.LEFT)

        # Tables Grid Container (Scrollable)
        container = tk.Frame(self, bg=BG_MAIN)
        container.pack(fill=tk.BOTH, expand=True, padx=40, pady=(0, 40))

        canvas = tk.Canvas(container, bg=BG_MAIN, highlightthickness=0)
        scrollbar = ttk.Scrollbar(container, orient="vertical", command=canvas.yview)

        self.grid_frame = tk.Frame(canvas, bg=BG_MAIN)
        self.grid_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=self.grid_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self.refresh_tables()

    def refresh_tables(self):
        for widget in self.grid_frame.winfo_children():
            widget.destroy()

        tables = self.controller.tables

        # Responsive Grid Layout
        columns = 4
        for i, table in enumerate(tables):
            row = i // columns
            col = i % columns

            self.create_table_card(table, row, col)

    def create_table_card(self, table, row, col):
        # Card style logic
        is_occupied = table.isOccupied
        bg_color = WHITE if is_occupied else BG_MAIN
        border_color = ACCENT_AMBER if is_occupied else BORDER_COLOR

        card_frame = tk.Frame(
            self.grid_frame,
            bg=bg_color,
            highlightbackground=border_color,
            highlightthickness=2 if is_occupied else 1,
            width=250,
            height=180
        )
        card_frame.grid(row=row, column=col, padx=15, pady=15)
        card_frame.grid_propagate(False)

        # Click handler for the whole card
        def on_click(e):
            self.open_table_detail(table)

        for widget in [card_frame]:
            widget.bind("<Button-1>", on_click)

        # Content
        # Header
        header = tk.Frame(card_frame, bg=bg_color)
        header.pack(fill=tk.X, padx=15, pady=15)

        name_label = tk.Label(header, text=table.name, font=("Times New Roman", 16, "bold"), bg=bg_color, fg=TEXT_MAIN if is_occupied else TEXT_MUTED)
        name_label.pack(side=tk.LEFT)
        name_label.bind("<Button-1>", on_click)

        if is_occupied:
            status_badge = tk.Label(header, text="DOLU", bg="#fef3c7", fg="#b45309", font=("Segoe UI", 8, "bold"), padx=6, pady=2)
            status_badge.pack(side=tk.RIGHT)
            status_badge.bind("<Button-1>", on_click)

        # Body
        body = tk.Frame(card_frame, bg=bg_color)
        body.pack(fill=tk.BOTH, expand=True, padx=15)
        body.bind("<Button-1>", on_click)

        if is_occupied:
            item_count = sum(item.quantity for item in table.orders)
            total_amount = sum(item.price * item.quantity for item in table.orders)

            info_row = tk.Frame(body, bg=bg_color)
            info_row.pack(fill=tk.X, pady=(5,0))
            tk.Label(info_row, text=f"☕ {item_count} Ürün", font=FONT_SMALL, bg=bg_color, fg=TEXT_MUTED).pack(side=tk.LEFT)

            price_label = tk.Label(body, text=f"₺{total_amount:.2f}", font=("Segoe UI", 18, "bold"), bg=bg_color, fg=ACCENT_AMBER)
            price_label.pack(anchor="w", pady=(10,0))
            price_label.bind("<Button-1>", on_click)

            if table.openedAt:
                try:
                    dt = datetime.datetime.fromisoformat(table.openedAt)
                    time_str = dt.strftime("%H:%M")
                    tk.Label(body, text=f"Açılış: {time_str}", font=("Segoe UI", 8), bg=bg_color, fg="#a8a29e").pack(anchor="w", pady=(5,0))
                except:
                    pass
        else:
            center_frame = tk.Frame(body, bg=bg_color)
            center_frame.place(relx=0.5, rely=0.5, anchor="center")
            tk.Label(center_frame, text="👥", font=("Segoe UI", 24), bg=bg_color, fg=TEXT_MUTED).pack()
            tk.Label(center_frame, text="Boş Masa", font=FONT_BOLD, bg=bg_color, fg=TEXT_MUTED).pack()

            # Propagate click
            for w in center_frame.winfo_children():
                w.bind("<Button-1>", on_click)
            center_frame.bind("<Button-1>", on_click)


    def open_table_detail(self, table):
        TableDetailDialog(self, table, self.controller, self.on_table_update)

    def on_table_update(self):
        StorageService.save_tables(self.controller.tables)
        self.refresh_tables()


class TableDetailDialog(tk.Toplevel):
    def __init__(self, parent, table, controller, on_close):
        super().__init__(parent)
        self.title(f"{table.name} Detayı")
        self.table = table
        self.controller = controller
        self.on_close = on_close
        self.geometry("1000x700")
        self.configure(bg=BG_MAIN)

        # --- Right Panel (Cart) ---
        right_panel = tk.Frame(self, width=350, bg=WHITE, padx=20, pady=20)
        right_panel.pack(side=tk.RIGHT, fill=tk.Y)
        right_panel.pack_propagate(False)

        tk.Label(right_panel, text="Siparişler", font=("Times New Roman", 20, "bold"), bg=WHITE, fg=TEXT_MAIN).pack(anchor="w", pady=(0, 20))

        # Cart Treeview
        tree_frame = tk.Frame(right_panel)
        tree_frame.pack(fill=tk.BOTH, expand=True)

        self.cart_tree = ttk.Treeview(tree_frame, columns=("name", "qty", "price"), show="headings", height=15)
        self.cart_tree.heading("name", text="Ürün")
        self.cart_tree.heading("qty", text="Adet")
        self.cart_tree.heading("price", text="Tutar")
        self.cart_tree.column("name", width=140)
        self.cart_tree.column("qty", width=50, anchor="center")
        self.cart_tree.column("price", width=80, anchor="e")
        self.cart_tree.pack(fill=tk.BOTH, expand=True)

        # Totals
        self.total_label = tk.Label(right_panel, text="Toplam: 0.00 ₺", font=("Segoe UI", 20, "bold"), bg=WHITE, fg=ACCENT_AMBER)
        self.total_label.pack(pady=20, anchor="e")

        # Actions
        action_frame = tk.Frame(right_panel, bg=WHITE)
        action_frame.pack(fill=tk.X)

        tk.Button(action_frame, text="Nakit Ödeme", command=self.pay_cash, bg=ACCENT_GREEN, fg=WHITE, font=FONT_BOLD, relief="flat", pady=10).pack(fill=tk.X, pady=5)
        tk.Button(action_frame, text="Kredi Kartı", command=self.pay_credit, bg=ACCENT_BLUE, fg=WHITE, font=FONT_BOLD, relief="flat", pady=10).pack(fill=tk.X, pady=5)
        tk.Button(action_frame, text="Kapat", command=self.close_table, bg=BG_MAIN, fg=TEXT_MAIN, font=FONT_NORMAL, relief="flat", pady=10).pack(fill=tk.X, pady=(20, 5))

        # --- Left Panel (Menu) ---
        left_panel = tk.Frame(self, bg=BG_MAIN, padx=20, pady=20)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        # Categories
        cat_frame = tk.Frame(left_panel, bg=BG_MAIN)
        cat_frame.pack(fill=tk.X, pady=(0, 20))

        categories = ["Tümü"] + sorted(list(set(p.category for p in self.controller.products)))
        self.cat_var = tk.StringVar(value="Tümü")

        # Custom Radio Buttons style (as buttons)
        self.cat_buttons = {}
        for cat in categories:
            btn = tk.Button(
                cat_frame,
                text=cat,
                command=lambda c=cat: self.set_category(c),
                font=FONT_NORMAL,
                bg=WHITE,
                relief="flat",
                padx=15,
                pady=5
            )
            btn.pack(side=tk.LEFT, padx=5)
            self.cat_buttons[cat] = btn

        self.update_cat_buttons()

        # Products Grid
        self.product_canvas = tk.Canvas(left_panel, bg=BG_MAIN, highlightthickness=0)
        scrollbar = ttk.Scrollbar(left_panel, orient="vertical", command=self.product_canvas.yview)
        self.product_grid = tk.Frame(self.product_canvas, bg=BG_MAIN)

        self.product_grid.bind(
            "<Configure>",
            lambda e: self.product_canvas.configure(
                scrollregion=self.product_canvas.bbox("all")
            )
        )

        self.product_canvas.create_window((0, 0), window=self.product_grid, anchor="nw")
        self.product_canvas.configure(yscrollcommand=scrollbar.set)

        self.product_canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self.filter_products()
        self.refresh_cart()

    def set_category(self, cat):
        self.cat_var.set(cat)
        self.update_cat_buttons()
        self.filter_products()

    def update_cat_buttons(self):
        current = self.cat_var.get()
        for cat, btn in self.cat_buttons.items():
            if cat == current:
                btn.configure(bg=ACCENT_AMBER, fg=WHITE)
            else:
                btn.configure(bg=WHITE, fg=TEXT_MAIN)

    def filter_products(self):
        for widget in self.product_grid.winfo_children():
            widget.destroy()

        category = self.cat_var.get()
        products = self.controller.products
        if category != "Tümü":
            products = [p for p in products if p.category == category]

        cols = 3
        for i, product in enumerate(products):
            self.create_product_card(product, i, cols)

    def create_product_card(self, product, index, cols):
        row = index // cols
        col = index % cols

        card = tk.Button(
            self.product_grid,
            text=f"{product.name}\n\n{product.price:.2f} ₺",
            font=("Segoe UI", 11),
            bg=WHITE,
            fg=TEXT_MAIN,
            width=20,
            height=6,
            relief="flat",
            activebackground=BG_MAIN,
            command=lambda p=product: self.add_to_cart(p)
        )
        card.grid(row=row, column=col, padx=10, pady=10)

    def add_to_cart(self, product):
        existing = next((item for item in self.table.orders if item.productId == product.id), None)
        if existing:
            existing.quantity += 1
        else:
            self.table.orders.append(CartItem(
                productId=product.id,
                productName=product.name,
                price=product.price,
                quantity=1
            ))

        if not self.table.isOccupied:
            self.table.isOccupied = True
            self.table.openedAt = datetime.datetime.now().isoformat()

        self.refresh_cart()
        self.on_close() # Save state

    def refresh_cart(self):
        for item in self.cart_tree.get_children():
            self.cart_tree.delete(item)

        total = 0
        for item in self.table.orders:
            line_total = item.price * item.quantity
            total += line_total
            self.cart_tree.insert("", "end", values=(item.productName, item.quantity, f"{line_total:.2f} ₺"))

        self.total_label.config(text=f"Toplam: {total:.2f} ₺")

    def pay_cash(self):
        self.complete_payment("Nakit")

    def pay_credit(self):
        self.complete_payment("Kredi Kartı")

    def complete_payment(self, method):
        if not self.table.orders:
            return

        if messagebox.askyesno("Ödeme Onayı", f"{method} ile ödeme alındı mı?"):
            self.table.orders = []
            self.table.isOccupied = False
            self.table.openedAt = None
            self.refresh_cart()
            self.on_close()
            self.destroy()

    def close_table(self):
        self.on_close()
        self.destroy()
