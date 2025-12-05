@echo off
title JurisConnect - Starter
color 0B

echo ====================================================
echo   JURISCONNECT - INICIANDO SISTEMA
echo ====================================================
echo.

REM Defina os caminhos
set BACKEND_PATH=C:\Users\Bruno\Documents\Bruno\Software-JurisConnect\src\jurisconnect-backend
set FRONTEND_PATH=C:\Users\Bruno\Documents\Bruno\Software-JurisConnect\src\jurisconnect-frontend
set PROJECT_PATH=C:\Users\Bruno\Documents\Bruno\Software-JurisConnect

echo [1/3] Iniciando BACKEND (porta 3001)...
start "JurisConnect Backend" cmd /k "cd /d %BACKEND_PATH% && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Iniciando FRONTEND (porta 5173)...
start "JurisConnect Frontend" cmd /k "cd /d %FRONTEND_PATH% && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Iniciando CLOUDFLARE TUNNEL...
start "Cloudflare Tunnel" cmd /k "cd /d %PROJECT_PATH% && cloudflared tunnel --config "%USERPROFILE%\.cloudflared\jurisconnect.yml" run jurisconnect-frontend"

echo.
echo ====================================================
echo   SISTEMA INICIADO!
echo ====================================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo Publico: https://app.jurisconnect.com.br
echo.
echo Pressione qualquer tecla para fechar esta janela
echo (os servicos continuarao rodando em segundo plano)
echo ====================================================
pause >nul
