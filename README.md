
# Kitap Pastası POS - Windows Uygulaması

Bu proje, React ile geliştirilmiş POS sisteminin **birebir aynı arayüze sahip** Windows masaüstü uygulamasını oluşturur.

**Windows 7 Desteği:**
Bu uygulama Windows 7 üzerinde çalışacak şekilde tasarlanmıştır. Ancak şunlara dikkat edilmelidir:
1. Derleme yaparken **Python 3.8** sürümü kullanılmalıdır. (Python 3.9 ve üzeri Windows 7'yi desteklemez).
2. Windows 7 bilgisayarda **Microsoft Edge WebView2 Runtime** yüklü olmalıdır.

## 🚀 Hızlı Kurulum ve Dağıtım

### Adım 1: Uygulamayı Oluşturma
1. Bilgisayarınızda **Python 3.8** ve **Node.js** yüklü olduğundan emin olun.
2. Klasördeki **`build.bat`** dosyasına çift tıklayın.
3. İşlem bittiğinde uygulamanız `dist` klasöründe hazır olacaktır.

### Adım 2: Bilgisayara Kurma (Program Files)
Oluşturulan uygulamayı `C:\Program Files` altına kurmak ve masaüstü kısayolu oluşturmak için:

1. **`installer.bat`** dosyasına sağ tıklayın.
2. **"Yönetici olarak çalıştır"** (Run as Administrator) seçeneğine tıklayın.
3. Kurulum tamamlandığında masaüstünüzde **KitapPastasiPOS** kısayolunu göreceksiniz.

---

## Windows 7 İçin Önemli Notlar

Uygulamanın Windows 7'de sorunsuz çalışması için hedef bilgisayarda şunların yapılması gerekebilir:

1. **WebView2 Runtime Yüklemesi:**
   Uygulama arayüzü modern web teknolojileri kullandığı için, Windows 7'de "Microsoft Edge WebView2 Runtime"ın yüklü olması gerekir.
   İndirme Linki: [WebView2 Runtime İndir](https://go.microsoft.com/fwlink/p/?LinkId=2124703) (Evergreen Bootstrapper)

2. **Güncellemeler:**
   Windows 7'nin güncel olduğundan (SP1 ve sonrası) emin olun.

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
