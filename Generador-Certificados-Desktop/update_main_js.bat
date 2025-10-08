@echo off
echo Actualizando archivo main.js...

rem Hacer una copia de seguridad del archivo original
if exist "src\main.js.bak" del "src\main.js.bak"
copy "src\main.js" "src\main.js.bak"

rem Reemplazar el archivo con la nueva versión
copy "src\main.js.new" "src\main.js"

echo Archivo main.js actualizado correctamente.
echo Se ha creado una copia de seguridad en src\main.js.bak

echo Presiona cualquier tecla para continuar...
pause > nul
