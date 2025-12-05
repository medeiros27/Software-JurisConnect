@echo off
title JurisConnect - Parar Servicos
color 0C

echo ====================================================
echo   JURISCONNECT - PARANDO SERVICOS
echo ====================================================
echo.

echo [1/2] Parando Node.js (Backend e Frontend)...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js encerrado
) else (
    echo [INFO] Nenhum processo Node.js encontrado
)

echo.
echo [2/2] Parando Cloudflare Tunnel...
taskkill /F /IM cloudflared.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Cloudflare Tunnel encerrado
) else (
    echo [INFO] Nenhum processo Cloudflared encontrado
)

echo.
echo ====================================================
echo   TODOS OS SERVICOS FORAM PARADOS
echo ====================================================
pause
