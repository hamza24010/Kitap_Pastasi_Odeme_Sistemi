@echo off
setlocal

:: Define variables
set APP_NAME=KitapPastasiPOS
set INSTALL_DIR=C:\Program Files\%APP_NAME%
set EXECUTABLE=dist\%APP_NAME%.exe
set SHORTCUT_NAME=%APP_NAME%.lnk

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Yonetici izinleri gereklidir. Lutfen sag tiklayip "Yonetici olarak calistir" secenegini kullanin.
    pause
    exit /b
)

echo.
echo %APP_NAME% Kurulumu Baslatiliyor...
echo ------------------------------------------

:: Check if the executable exists
if not exist "%EXECUTABLE%" (
    echo HATA: Derlenmis uygulama bulunamadi (%EXECUTABLE%).
    echo Lutfen once 'build.bat' dosyasini calistirin.
    pause
    exit /b
)

:: Create Installation Directory
echo.
echo 1. Kurulum klasoru olusturuluyor...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copy Files
echo 2. Dosyalar kopyalaniyor...
copy /Y "%EXECUTABLE%" "%INSTALL_DIR%\"

:: Create Desktop Shortcut using PowerShell
echo 3. Masaustu kisayolu olusturuluyor...
set SCRIPT="%TEMP%\CreateShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = "%USERPROFILE%\Desktop\%SHORTCUT_NAME%" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%INSTALL_DIR%\%APP_NAME%.exe" >> %SCRIPT%
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> %SCRIPT%
echo oLink.Description = "Kitap Pastasi POS Uygulamasi" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo ------------------------------------------
echo KURULUM BASARIYLA TAMAMLANDI!
echo.
echo Uygulama yeri: %INSTALL_DIR%
echo Kisayol: Masaustu
echo.
pause
