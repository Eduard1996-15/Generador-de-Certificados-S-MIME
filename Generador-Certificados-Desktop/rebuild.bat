@echo off
pushd "%~dp0"
echo Limpiando cache...
rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>nul
echo Compilando aplicacion...
@echo off
title Rebuild Portable App
echo ========================================
echo REBUILD CERTIFICADOS S/MIME
echo ========================================
echo.
echo Limpiando compilaciones anteriores...
if exist "dist" rmdir /s /q "dist"

echo.
echo Construyendo aplicación portable...
npx electron-packager . "Generador-Certificados-SMIME" --platform=win32 --arch=x64 --out=dist --overwrite --ignore="node_modules/(electron-builder|7zip-bin)" --ignore="\.git" --ignore="\.vscode"

echo.
echo ========================================
echo BUILD COMPLETADO
echo ========================================
echo Aplicación portable disponible en:
echo ./dist/Generador-Certificados-SMIME-win32-x64/
echo Ejecutable: Generador-Certificados-SMIME.exe
echo.
pause
