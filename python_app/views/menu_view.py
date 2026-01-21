import tkinter as tk
from tkinter import ttk, messagebox
import uuid
from models import Product, StorageService
from styles import *

class MenuView(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg=BG_MAIN)
        self.controller = controller

        # Header
        header = tk.Frame(self, bg=BG_MAIN)
        header.pack(fill=tk.X, padx=40, pady=40)

        tk.Label(header, text="Menü Yönetimi", font=("Times New Roman", 28, "bold"), bg=BG_MAIN, fg=TEXT_MAIN).pack(side=tk.LEFT)

        add_btn = tk.Button(
            header,
            text="+ Yeni Ürün",
            command=self.show_add_dialog,
            bg=ACCENT_AMBER,
            fg=WHITE,
            font=FONT_BOLD,
            relief="flat",
            padx=15,
            pady=8
        )
        add_btn.pack(side=tk.RIGHT)

        # Product List (Treeview)
        list_frame = tk.Frame(self, bg=WHITE, padx=2, pady=2) # White border effect
        list_frame.pack(fill=tk.BOTH, expand=True, padx=40, pady=(0, 40))

        # Styling Treeview
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Treeview",
            background=WHITE,
            foreground=TEXT_MAIN,
            rowheight=40,
            fieldbackground=WHITE,
            font=FONT_NORMAL
        )
        style.configure("Treeview.Heading",
            background=BG_MAIN,
            foreground=TEXT_MUTED,
            font=FONT_BOLD
        )
        style.map("Treeview", background=[('selected', ACCENT_AMBER)])

        columns = ("name", "category", "price", "description")
        self.tree = ttk.Treeview(list_frame, columns=columns, show="headings", selectmode="browse")

        self.tree.heading("name", text="Ürün Adı")
        self.tree.heading("category", text="Kategori")
        self.tree.heading("price", text="Fiyat")
        self.tree.heading("description", text="Açıklama")

        self.tree.column("name", width=250)
        self.tree.column("category", width=150)
        self.tree.column("price", width=100)
        self.tree.column("description", width=400)

        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscroll=scrollbar.set)

        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Button Panel
        btn_panel = tk.Frame(self, bg=BG_MAIN)
        btn_panel.pack(fill=tk.X, padx=40, pady=(0, 40))

        tk.Button(
            btn_panel,
            text="Seçileni Düzenle",
            command=self.edit_selected,
            bg=WHITE,
            fg=TEXT_MAIN,
            font=FONT_NORMAL,
            relief="raised"
        ).pack(side=tk.LEFT, padx=5)

        tk.Button(
            btn_panel,
            text="Seçileni Sil",
            command=self.delete_selected,
            bg="#ef4444", # red
            fg=WHITE,
            font=FONT_NORMAL,
            relief="flat"
        ).pack(side=tk.LEFT, padx=5)

        self.refresh_list()

    def refresh_list(self):
        for item in self.tree.get_children():
            self.tree.delete(item)

        products = self.controller.products
        for p in products:
            self.tree.insert("", tk.END, iid=p.id, values=(p.name, p.category, f"{p.price:.2f} ₺", p.description))

    def show_add_dialog(self):
        ProductDialog(self, "Yeni Ürün", self.on_product_save)

    def edit_selected(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Uyarı", "Lütfen düzenlemek için bir ürün seçin.")
            return

        product_id = selected[0]
        product = next((p for p in self.controller.products if p.id == product_id), None)
        if product:
            ProductDialog(self, "Ürünü Düzenle", self.on_product_save, product)

    def delete_selected(self):
        selected = self.tree.selection()
        if not selected:
            return

        if messagebox.askyesno("Onay", "Bu ürünü silmek istediğinize emin misiniz?"):
            product_id = selected[0]
            self.controller.products = [p for p in self.controller.products if p.id != product_id]
            StorageService.save_products(self.controller.products)
            self.refresh_list()

    def on_product_save(self, product_data, product_id=None):
        if product_id:
            # Update existing
            for p in self.controller.products:
                if p.id == product_id:
                    p.name = product_data['name']
                    p.price = product_data['price']
                    p.category = product_data['category']
                    p.description = product_data['description']
                    break
        else:
            # Create new
            new_product = Product(
                id=str(uuid.uuid4()),
                name=product_data['name'],
                price=product_data['price'],
                category=product_data['category'],
                description=product_data['description']
            )
            self.controller.products.append(new_product)

        StorageService.save_products(self.controller.products)
        self.refresh_list()


class ProductDialog(tk.Toplevel):
    def __init__(self, parent, title, callback, product=None):
        super().__init__(parent)
        self.title(title)
        self.callback = callback
        self.product = product
        self.geometry("450x500")
        self.configure(bg=WHITE)

        # Center the window
        self.transient(parent)
        self.grab_set()

        # Form
        pad = 20

        tk.Label(self, text="Ürün Adı", bg=WHITE, font=FONT_BOLD).pack(anchor="w", padx=pad, pady=(20, 5))
        self.name_var = tk.StringVar(value=product.name if product else "")
        tk.Entry(self, textvariable=self.name_var, font=FONT_NORMAL, bg=BG_MAIN, relief="flat", highlightthickness=1, highlightbackground=BORDER_COLOR).pack(fill=tk.X, padx=pad, ipady=5)

        tk.Label(self, text="Kategori", bg=WHITE, font=FONT_BOLD).pack(anchor="w", padx=pad, pady=(15, 5))
        self.cat_var = tk.StringVar(value=product.category if product else "Kahve")
        ttk.Combobox(self, textvariable=self.cat_var, values=["Kahve", "Çay", "Tatlı", "Kitap & Dergi", "Atıştırmalık"], font=FONT_NORMAL).pack(fill=tk.X, padx=pad)

        tk.Label(self, text="Fiyat (₺)", bg=WHITE, font=FONT_BOLD).pack(anchor="w", padx=pad, pady=(15, 5))
        self.price_var = tk.DoubleVar(value=product.price if product else 0.0)
        tk.Entry(self, textvariable=self.price_var, font=FONT_NORMAL, bg=BG_MAIN, relief="flat", highlightthickness=1, highlightbackground=BORDER_COLOR).pack(fill=tk.X, padx=pad, ipady=5)

        tk.Label(self, text="Açıklama", bg=WHITE, font=FONT_BOLD).pack(anchor="w", padx=pad, pady=(15, 5))
        self.desc_var = tk.StringVar(value=product.description if product else "")
        tk.Entry(self, textvariable=self.desc_var, font=FONT_NORMAL, bg=BG_MAIN, relief="flat", highlightthickness=1, highlightbackground=BORDER_COLOR).pack(fill=tk.X, padx=pad, ipady=5)

        tk.Button(
            self,
            text="Kaydet",
            command=self.save,
            bg=ACCENT_AMBER,
            fg=WHITE,
            font=FONT_BOLD,
            relief="flat",
            pady=10
        ).pack(fill=tk.X, padx=pad, pady=30)

    def save(self):
        try:
            data = {
                'name': self.name_var.get(),
                'category': self.cat_var.get(),
                'price': float(self.price_var.get()),
                'description': self.desc_var.get()
            }
            if not data['name']:
                raise ValueError("Ürün adı boş olamaz.")

            self.callback(data, self.product.id if self.product else None)
            self.destroy()
        except ValueError as e:
            messagebox.showerror("Hata", str(e))
