@echo off
REM ================================================================
REM  PQC - ANALIZADOR DE SEGURIDAD POST-CUANTICA
REM  Ejecuta analisis completo de vulnerabilidades en CA y certificados
REM ================================================================

echo.
echo ================================================================
echo   PQC - Analizador de Seguridad Post-Cuantica
echo ================================================================
echo.
echo Ejecutando analisis de seguridad...
echo.

cd /d "%~dp0"
node security-analyzer.js

echo.
echo ================================================================
echo   Analisis completado
echo ================================================================
echo.
echo Revisa los reportes generados:
echo   - SECURITY-REPORT.md  (reporte detallado)
echo   - security-report.json (datos estructurados)
echo.

pause
