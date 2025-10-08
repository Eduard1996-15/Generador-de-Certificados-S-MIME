@echo off
echo Actualizando archivos con créditos del desarrollador...

cd "%~dp0"

rem Actualizar main.js
echo Actualizando main.js...
if exist "src\main.js.bak" del "src\main.js.bak"
copy "src\main.js" "src\main.js.bak"
copy "src\main.js.new" "src\main.js"

rem Actualizar app-desktop.js
echo Actualizando app-desktop.js...
if exist "src\renderer\app-desktop.js.bak" del "src\renderer\app-desktop.js.bak"
copy "src\renderer\app-desktop.js" "src\renderer\app-desktop.js.bak"
copy "src\renderer\app-desktop.js.new" "src\renderer\app-desktop.js"

rem Actualizar index.html
echo Actualizando index.html...
if exist "src\renderer\index.html.bak" del "src\renderer\index.html.bak"
copy "src\renderer\index.html" "src\renderer\index.html.bak"
copy "src\renderer\index.html.new" "src\renderer\index.html"

rem Actualizar styles.css
echo Actualizando styles.css...
if exist "src\renderer\styles.css.bak" del "src\renderer\styles.css.bak"
copy "src\renderer\styles.css" "src\renderer\styles.css.bak"
copy "src\renderer\styles.css.new" "src\renderer\styles.css"

echo.
echo Todos los archivos han sido actualizados correctamente.
echo Se han creado copias de seguridad con extensión .bak

echo.
echo Presiona cualquier tecla para salir...
pause > nul
