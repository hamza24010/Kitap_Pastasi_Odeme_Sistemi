
# Kitap Pastası POS - Windows Uygulaması

Bu proje, React ile geliştirilmiş POS sisteminin **birebir aynı arayüze sahip** Windows masaüstü uygulamasını oluşturur.

## 🚀 Hızlı Kurulum ve Oluşturma

Tek bir komutla uygulamanızı hazır hale getirebilirsiniz.

**Gereksinimler:** Node.js ve Python yüklü olmalıdır.

1. Terminali açın.
2. Aşağıdaki komutu çalıştırın:

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
