@echo off
echo ==========================================
echo      INICIANDO SISTEMA JURISCONNECT
echo ==========================================
echo.

:: Iniciar Backend em uma nova janela
echo Iniciando Backend...
start "JurisConnect Backend" cmd /k "cd src\jurisconnect-backend && npm start"

:: Aguardar 5 segundos para o backend subir
timeout /t 5 /nobreak >nul

:: Iniciar Frontend em uma nova janela
echo Iniciando Frontend...
start "JurisConnect Frontend" cmd /k "cd src\jurisconnect-frontend && npm run dev"

echo.
echo ==========================================
echo      SISTEMA INICIADO COM SUCESSO!
echo ==========================================
echo.
echo As janelas do Backend e Frontend foram abertas.
echo Nao feche essas janelas para manter o sistema rodando.
echo.
pause
