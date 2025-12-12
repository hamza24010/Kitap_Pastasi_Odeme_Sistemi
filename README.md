
# Kitap Pastası POS - Windows Uygulaması

Bu proje, React ile geliştirilmiş POS sisteminin **birebir aynı arayüze sahip** Windows masaüstü uygulamasını oluşturur.

## 🚀 En Kolay Kurulum (Windows)

1. Bilgisayarınızda **Python** ve **Node.js** yüklü olduğundan emin olun.
2. Klasördeki **`build.bat`** dosyasına çift tıklayın.
3. İşlem bittiğinde siyah pencere size tamamlandığını söyleyecektir.
4. Oluşturulan uygulamanızı **`dist`** klasörü içinde **`KitapPastasiPOS.exe`** olarak bulabilirsiniz.

---

## Terminal ile Kurulum

Eğer terminal kullanmayı tercih ederseniz:

```bash
python build_app.py
```

Bu script sırasıyla şunları yapacaktır:
1. Gerekli kütüphaneleri yükler (npm & pip).
2. Web arayüzünü derler (`npm run build`).
3. Python ile web arayüzünü birleştirir.
4. `dist` klasörü içinde **KitapPastasiPOS.exe** dosyasını oluşturur.

Oluşturulan `.exe` dosyası tek başına çalışabilir ve kurulum gerektirmez.

---

## Manuel Kurulum (Alternatif)

Eğer script kullanmak istemezseniz manuel adımlar:

1. `npm install`
2. `npm run build`
3. `pip install -r python_app/requirements.txt`
4. `python python_app/main.py` (Test için çalıştırma)
5. `pyinstaller --noconfirm --onefile --windowed --name "KitapPastasiPOS" --add-data "dist;dist" python_app/main.py` (EXE oluşturma)
