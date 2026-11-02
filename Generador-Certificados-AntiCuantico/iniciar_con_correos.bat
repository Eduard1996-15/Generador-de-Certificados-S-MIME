@echo off
echo.
echo ================================================================
echo   PQC - Generador de Certificados Post-Cuanticos con Correos
echo ================================================================
echo.
echo ✨ NUEVA FUNCIONALIDAD AGREGADA:
echo   📧 Generador de certificados de correo personalizado
echo   🔮 Formulario interactivo para usuarios individuales  
echo   📁 Acceso directo a carpetas de certificados
echo   📋 Instrucciones de instalacion automaticas
echo.
echo Iniciando aplicacion...
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Ejecutando aplicacion con nuevas funciones...
call npm start

echo.
echo ================================================================
echo   INSTRUCCIONES DE USO:
echo   1. Crear CA Post-Cuantica (boton principal)
echo   2. Hacer clic en "📧 Generar Certificados de Correo"
echo   3. Completar formulario con datos del usuario
echo   4. Generar certificado S/MIME personalizado
echo   5. Usar archivos .p12 en Thunderbird (password definida al generar el certificado)
echo ================================================================
echo.
pause