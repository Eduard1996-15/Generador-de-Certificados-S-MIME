@echo off
echo Actualizando archivos de la aplicacion...

rem Crear carpeta temporal para la actualizacion
mkdir temp_update 2>nul

rem Copiar archivos de la aplicacion a la carpeta temporal
echo Copiando archivos...
xcopy /E /Y "src\*.js" "temp_update\" 
xcopy /E /Y "src\renderer\*.js" "temp_update\renderer\"
xcopy /E /Y "src\renderer\*.html" "temp_update\renderer\"
xcopy /E /Y "src\renderer\*.css" "temp_update\renderer\"

rem Copiar archivos a la carpeta de la aplicacion portable
echo Copiando archivos a la aplicacion portable...
if exist "dist\win-unpacked\resources\app" (
    xcopy /E /Y "temp_update\*.*" "dist\win-unpacked\resources\app\"
    echo Archivos copiados a dist\win-unpacked\resources\app\
) else (
    echo La carpeta dist\win-unpacked\resources\app no existe.
    echo Es posible que la aplicacion este empaquetada en formato ASAR.
    echo Use electron-builder --dir --unpack=*.js para crear una version sin empaquetar.
)

rem Limpiar
rmdir /S /Q temp_update

echo Actualizacion completa.
echo Para crear una nueva version del ejecutable, abra PowerShell como administrador y ejecute:
echo cd "C:\Users\Admin\Documents\PROYECTOS Empresa\Generador-Certificados-Desktop"
echo npm run build -- --win
