@echo off
echo.
echo ==================================================
echo   PQC - Generador de Certificados Post-Cuanticos
echo ==================================================
echo.
echo Iniciando aplicacion anti-cuantica...
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Ejecutando aplicacion...
call npm start

pause