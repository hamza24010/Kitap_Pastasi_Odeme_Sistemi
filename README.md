
# Kitap Pastası POS - Windows Uygulaması

Bu proje, React ile geliştirilmiş POS sisteminin **birebir aynı arayüze sahip** Windows masaüstü uygulamasını oluşturur.

## 🚀 Hızlı Kurulum ve Dağıtım

### Adım 1: Uygulamayı Oluşturma
1. Bilgisayarınızda **Python** ve **Node.js** yüklü olduğundan emin olun.
2. Klasördeki **`build.bat`** dosyasına çift tıklayın.
3. İşlem bittiğinde uygulamanız `dist` klasöründe hazır olacaktır.

### Adım 2: Bilgisayara Kurma (Program Files)
Oluşturulan uygulamayı `C:\Program Files` altına kurmak ve masaüstü kısayolu oluşturmak için:

1. **`installer.bat`** dosyasına sağ tıklayın.
2. **"Yönetici olarak çalıştır"** (Run as Administrator) seçeneğine tıklayın.
3. Kurulum tamamlandığında masaüstünüzde **KitapPastasiPOS** kısayolunu göreceksiniz.

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
5. `pyinstaller --noconfirm --onefile --windowed --name "KitapPastasiPOS" --add-data "dist;dist" --paths python_app --hidden-import backend python_app/main.py` (EXE oluşturma)
