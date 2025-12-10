import tkinter as tk
from tkinter import ttk, messagebox
from models import StorageService, CartItem

class POSView(ttk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller

        # Header
        header = ttk.Frame(self)
        header.pack(fill=tk.X, padx=20, pady=20)
        ttk.Label(header, text="Masalar", font=("Segoe UI", 24, "bold")).pack(side=tk.LEFT)

        # Tables Grid Container
        self.grid_frame = ttk.Frame(self)
        self.grid_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)

        self.refresh_tables()

    def refresh_tables(self):
        for widget in self.grid_frame.winfo_children():
            widget.destroy()

        tables = self.controller.tables

        # Simple grid layout logic
        columns = 4
        for i, table in enumerate(tables):
            row = i // columns
            col = i % columns

            self.create_table_card(table, row, col)

    def create_table_card(self, table, row, col):
        style = "Occupied.TButton" if table.isOccupied else "Empty.TButton"
        text = f"{table.name}\n{self.calculate_total(table):.2f} ₺" if table.isOccupied else table.name

        card = tk.Button(
            self.grid_frame,
            text=text,
            font=("Segoe UI", 12),
            bg="#fca5a5" if table.isOccupied else "#86efac", # Light red / Light green
            command=lambda t=table: self.open_table_detail(t),
            width=15,
            height=5
        )
        card.grid(row=row, column=col, padx=10, pady=10)

    def calculate_total(self, table):
        return sum(item.price * item.quantity for item in table.orders)

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
        self.geometry("800x600")

        # Layout: Left (Categories/Products), Right (Cart)

        # --- Right Panel (Cart) ---
        right_panel = ttk.Frame(self, width=300)
        right_panel.pack(side=tk.RIGHT, fill=tk.Y, padx=10, pady=10)

        ttk.Label(right_panel, text="Siparişler", font=("Segoe UI", 16, "bold")).pack(pady=10)

        self.cart_tree = ttk.Treeview(right_panel, columns=("name", "qty", "price"), show="headings", height=15)
        self.cart_tree.heading("name", text="Ürün")
        self.cart_tree.heading("qty", text="Adet")
        self.cart_tree.heading("price", text="Tutar")
        self.cart_tree.column("name", width=120)
        self.cart_tree.column("qty", width=50)
        self.cart_tree.column("price", width=80)
        self.cart_tree.pack(fill=tk.BOTH, expand=True)

        self.total_label = ttk.Label(right_panel, text="Toplam: 0.00 ₺", font=("Segoe UI", 14, "bold"))
        self.total_label.pack(pady=10)

        action_frame = ttk.Frame(right_panel)
        action_frame.pack(fill=tk.X, pady=10)

        ttk.Button(action_frame, text="Ödeme Al (Nakit)", command=self.pay_cash).pack(fill=tk.X, pady=2)
        ttk.Button(action_frame, text="Ödeme Al (Kredi)", command=self.pay_credit).pack(fill=tk.X, pady=2)
        ttk.Button(action_frame, text="Masayı Kapat", command=self.close_table).pack(fill=tk.X, pady=(10, 2))

        # --- Left Panel (Menu) ---
        left_panel = ttk.Frame(self)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Categories
        cat_frame = ttk.Frame(left_panel)
        cat_frame.pack(fill=tk.X, pady=5)

        categories = sorted(list(set(p.category for p in self.controller.products)))
        self.cat_var = tk.StringVar(value="Tümü")

        ttk.Radiobutton(cat_frame, text="Tümü", variable=self.cat_var, value="Tümü", command=self.filter_products).pack(side=tk.LEFT, padx=5)
        for cat in categories:
            ttk.Radiobutton(cat_frame, text=cat, variable=self.cat_var, value=cat, command=self.filter_products).pack(side=tk.LEFT, padx=5)

        # Products Grid (Using Listbox for simplicity in this swift implementation, or buttons in a frame)
        # Let's use a Frame with grid of buttons inside a Canvas for scrolling

        self.product_canvas = tk.Canvas(left_panel)
        scrollbar = ttk.Scrollbar(left_panel, orient="vertical", command=self.product_canvas.yview)
        self.product_grid = ttk.Frame(self.product_canvas)

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

    def filter_products(self):
        # Clear grid
        for widget in self.product_grid.winfo_children():
            widget.destroy()

        category = self.cat_var.get()
        products = self.controller.products
        if category != "Tümü":
            products = [p for p in products if p.category == category]

        # Populate grid
        cols = 3
        for i, product in enumerate(products):
            btn = tk.Button(
                self.product_grid,
                text=f"{product.name}\n{product.price:.2f} ₺",
                width=15,
                height=4,
                command=lambda p=product: self.add_to_cart(p)
            )
            btn.grid(row=i//cols, column=i%cols, padx=5, pady=5)

    def add_to_cart(self, product):
        # Check if item exists
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
            import datetime
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
        # Just close dialog
        self.on_close()
        self.destroy()
