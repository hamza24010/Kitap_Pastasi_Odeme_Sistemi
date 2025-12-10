<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Kitap Pastası POS

Kitap Pastası için geliştirilmiş ödeme ve sipariş takip sistemi.

Bu proje artık Windows masaüstü uygulaması olarak çalışabilmektedir.

## Kurulum ve Çalıştırma

**Gereksinimler:** Node.js (ve npm)

1. Proje dosyalarını indirin.
2. Terminali açın ve proje klasörüne gidin.
3. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
4. `.env` dosyasını oluşturun ve `GEMINI_API_KEY` değişkenini ekleyin (Eğer AI özellikleri kullanılıyorsa).

### Geliştirme Modu (Development)

Uygulamayı hem web tarayıcısında hem de Electron penceresinde geliştirme modunda çalıştırmak için:

```bash
npm run electron:dev
```

Bu komut:
- Vite sunucusunu başlatır (localhost:3000).
- Electron pencresini açar ve sunucuya bağlanır.
- Yapılan değişiklikler anlık olarak yansır (Hot Reload).

### Windows Uygulaması Olarak Derleme (Build)

Uygulamayı `.exe` dosyası olarak paketlemek için:

1. Terminalde şu komutu çalıştırın:
   ```bash
   npm run electron:build
   ```

2. İşlem tamamlandığında, `dist-electron` klasörü içinde kurulum dosyasını (`.exe`) bulabilirsiniz.
   - Genellikle `dist-electron/Kitap Pastası POS Setup 1.0.0.exe` (veya benzeri) adında olacaktır.
   - Ayrıca `dist-electron/win-unpacked` klasöründe kurulumsuz çalıştırılabilir hali de bulunabilir.

**Not:** Bu işlem Windows işletim sistemi üzerinde yapılmalıdır (veya Linux/Mac üzerinde Wine gibi araçlar gerektirir).
