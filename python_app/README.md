
# Python Uygulaması Seçenekleri

Bu klasör, Kitap Pastası POS uygulaması için iki farklı Python çözümü sunar.

## Gereksinimler

1. Python 3.8 veya üzeri
2. Bağımlılıkları yükleyin:
   ```bash
   pip install -r python_app/requirements.txt
   ```

---

## Seçenek 1: Birebir Aynı Arayüz (Önerilen)

Eğer web uygulamasının **birebir aynısı** olan bir masaüstü uygulaması istiyorsanız bu seçeneği kullanın. Bu yöntem, oluşturulan web arayüzünü (`dist` klasörü) bir Python penceresi içinde çalıştırır.

### Kurulum ve Çalıştırma

1. Önce ana dizinde React uygulamasını derleyin:
   ```bash
   npm install
   npm run build
   ```
   *(Bu işlem `dist` klasörünü oluşturacaktır)*

2. Python uygulamasını başlatın:
   ```bash
   python python_app/run_with_webview.py
   ```

### .exe Dosyası Oluşturma

```bash
pip install pyinstaller
pyinstaller --noconfirm --onefile --windowed --name "KitapPastasiPOS_Web" --add-data "dist;dist" python_app/run_with_webview.py
```
*Not: Windows'ta `--add-data "dist;dist"`, Mac/Linux'ta `--add-data "dist:dist"` kullanın.*

---

## Seçenek 2: Saf Python Arayüzü (Tkinter)

Eğer tamamen Python kütüphaneleri (Tkinter) ile yazılmış, web teknolojilerine ihtiyaç duymayan "native" bir uygulama istiyorsanız bu seçeneği kullanın. Arayüz web sürümüne **benzer** ancak birebir aynı değildir.

### Çalıştırma

```bash
python python_app/main.py
```

### .exe Dosyası Oluşturma

```bash
pyinstaller --noconfirm --onefile --windowed --name "KitapPastasiPOS_Native" --add-data "python_app/data;python_app/data" python_app/main.py
```
*Not: Windows'ta `--add-data "python_app/data;python_app/data"`, Mac/Linux'ta `--add-data "python_app/data:python_app/data"` kullanın.*
