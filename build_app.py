import os
import subprocess
import sys
import shutil

def run_command(command, cwd=None, shell=True):
    print(f"Executing: {command}")
    try:
        subprocess.check_call(command, shell=shell, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(e)
        sys.exit(1)

def main():
    print("=== Kitap Pastası POS - Windows Uygulaması Oluşturucu ===")
    print("Bu işlem uygulamanın birebir arayüzünü içeren bir .exe dosyası oluşturacaktır.")
    print("-" * 60)

    # 1. Check prerequisites
    if shutil.which('npm') is None:
        print("HATA: Node.js (npm) bulunamadı. Lütfen Node.js yükleyin.")
        sys.exit(1)

    if shutil.which('python') is None and shutil.which('python3') is None:
        print("HATA: Python bulunamadı.")
        sys.exit(1)

    # 2. Install Node Dependencies
    print("\n[1/4] Web Arayüzü Kütüphaneleri Yükleniyor...")
    run_command("npm install")

    # 3. Build React App
    print("\n[2/4] Web Arayüzü Derleniyor (HTML/CSS/JS)...")
    run_command("npm run build")

    # 4. Install Python Dependencies
    print("\n[3/4] Python Kütüphaneleri Yükleniyor...")
    run_command("pip install -r python_app/requirements.txt")

    # Ensure pyinstaller is installed
    try:
        import PyInstaller
    except ImportError:
        print("PyInstaller yükleniyor...")
        run_command("pip install pyinstaller")

    # 5. Build Executable
    print("\n[4/4] Windows Uygulaması (.exe) Oluşturuluyor...")

    # Check OS to determine separator
    sep = ';' if os.name == 'nt' else ':'

    cmd = (
        f'pyinstaller --noconfirm --onefile --windowed '
        f'--name "KitapPastasiPOS" '
        f'--add-data "dist{sep}dist" '
        f'python_app/main.py'
    )

    run_command(cmd)

    print("\n" + "="*60)
    print("İŞLEM TAMAMLANDI!")
    print("Uygulamanız şu klasörde hazır:")
    print(os.path.abspath(os.path.join('dist', 'KitapPastasiPOS.exe')))
    print("="*60)

if __name__ == "__main__":
    main()
