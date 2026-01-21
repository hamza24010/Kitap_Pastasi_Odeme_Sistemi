
# Python Uygulaması

Bu klasör, Kitap Pastası POS uygulamasının Python sürümünü içerir.
Kullanıcı arayüzünü birebir korumak için, derlenmiş web arayüzünü (`dist` klasörü) Python içinde çalıştıran bir yapı kullanır.

## Gereksinimler

1. Python 3.8 veya üzeri
2. Bağımlılıkları yükleyin:
   ```bash
   pip install -r python_app/requirements.txt
   ```

## Çalıştırma (Geliştirme)

1. **Önce Arayüzü Derleyin:**
   Web arayüzünün (HTML/CSS/JS) oluşturulması için ana dizinde şu komutları çalıştırın:
   ```bash
   npm install
   npm run build
   ```
   *(Bu işlem `dist` klasörünü oluşturacaktır)*

2. **Uygulamayı Başlatın:**
   ```bash
   python python_app/main.py
   ```
   Bu komut, uygulamanın birebir arayüzünü içeren pencereyi açacaktır.

---

## Windows .exe Dosyası Oluşturma

Uygulamayı tek bir `.exe` dosyası olarak paketlemek için:

1. PyInstaller yükleyin:
   ```bash
   pip install pyinstaller
   ```

2. Derleme komutunu çalıştırın:
   ```bash
   pyinstaller --noconfirm --onefile --windowed --name "KitapPastasiPOS" --add-data "dist;dist" python_app/main.py
   ```
   *Not: Windows için `;`, Mac/Linux için `:` ayracı kullanılır.*

3. Oluşturulan `.exe` dosyası `dist/KitapPastasiPOS.exe` konumunda olacaktır.

---

## Alternatif: Native Arayüz (Tkinter)

Eğer web teknolojilerine hiç bulaşmadan, saf Python arayüzünü (arayüz benzerdir ancak birebir aynı değildir) görmek isterseniz:

```bash
python python_app/main_native_ui.py
```
