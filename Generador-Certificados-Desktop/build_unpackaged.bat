@echo off
echo Construyendo aplicacion sin empaquetar en ASAR...

rem Modificar temporalmente package.json para evitar ASAR
echo Modificando configuracion...
powershell -Command "(Get-Content package.json) -replace '\"directories\": \{', '\"directories\": {' -replace '\"output\": \"dist\"', '\"output\": \"dist\"' -replace '\"win\": \{', '\"win\": {' | Set-Content package.json.temp"
powershell -Command "(Get-Content package.json.temp) -replace '\"build\": \{', '\"build\": {\"asar\": false,' | Set-Content package.json.build"
move /Y package.json.build package.json

rem Construir aplicacion
echo Construyendo aplicacion...
npm run pack

rem Restaurar package.json original
echo Restaurando configuracion original...
git checkout -- package.json

echo Construccion completada.
echo La aplicacion se encuentra en dist\win-unpacked\
