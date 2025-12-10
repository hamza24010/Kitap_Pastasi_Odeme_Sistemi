
# Python Uygulaması Kurulumu

Bu klasör, Kitap Pastası POS uygulamasının Python (Tkinter) sürümünü içerir.

## Gereksinimler

- Python 3.8 veya üzeri

## Çalıştırma

Terminalden şu komutu çalıştırın:

```bash
python python_app/main.py
```

## Windows .exe Dosyası Oluşturma

Bu uygulamayı tek bir `.exe` dosyası haline getirmek için `pyinstaller` kullanabilirsiniz.

1. PyInstaller'ı yükleyin:
   ```bash
   pip install pyinstaller
   ```

2. Uygulamayı derleyin:
   ```bash
   pyinstaller --noconfirm --onefile --windowed --name "KitapPastasiPOS" --add-data "python_app/data;python_app/data" python_app/main.py
   ```

   *Not: Windows üzerinde çalıştırırken `;` yerine `;` (noktalı virgül) kullanılır. Linux/Mac'te `:` kullanılır.*

   Eğer `data` klasöründe sorun yaşarsanız, oluşturulan `.exe` dosyasının yanına `python_app/data` klasörünü manuel olarak kopyalayabilirsiniz veya kodda `data` yolunu `sys._MEIPASS` ile yönetecek şekilde güncelleyebilirsiniz.

3. Oluşturulan dosya `dist/KitapPastasiPOS.exe` konumunda olacaktır.
