@echo off
echo Matando processos antigos...
taskkill /F /IM cloudflared.exe 2>nul
timeout /t 2 /nobreak >nul
cls

echo ====================================================
echo   INICIANDO CLOUDFLARE TUNNEL
echo ====================================================
echo.
echo IMPORTANTE: Copie TODA a saida abaixo e envie para o chat
echo.

cloudflared tunnel --config "%USERPROFILE%\.cloudflared\jurisconnect.yml" run jurisconnect-frontend

pause
