@echo off
echo Kitap Pastasi POS - Windows Uygulamasi Hazirlaniyor...
echo.
echo Bu islem sirasiyla sunlari yapacaktir:
echo 1. Gerekli kutuphaneleri (npm ve pip) yukler
echo 2. Web arayuzunu derler
echo 3. Python uygulamasini .exe haline getirir
echo.
echo Lutfen bekleyiniz...
echo.

python build_app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo HATA: Bir sorun olustu. Lutfen yukaridaki hata mesajini kontrol edin.
    echo Python ve Node.js'in yuklu oldugundan emin olun.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ISLEM BASARIYLA TAMAMLANDI!
echo Olusturulan uygulama surada: dist\KitapPastasiPOS.exe
echo.
echo Kapatmak icin bir tusa basin...
pause
