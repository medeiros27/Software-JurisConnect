@echo off
title Diagnostico Completo - Android Login
color 0E

echo ====================================================
echo   DIAGNOSTICO COMPLETO - ANDROID LOGIN
echo ====================================================
echo.

echo [1] IP do PC:
ipconfig | findstr /i "IPv4"
echo.

echo [2] Backend esta rodando?
netstat -an | findstr ":3001"
echo.

echo [3] Testando backend localmente...
curl -s http://localhost:3001/api/v1/health
echo.

echo [4] Testando backend via IP local...
curl -s http://192.168.15.3:3001/api/v1/health
echo.

echo [5] Regras de Firewall para porta 3001:
netsh advfirewall firewall show rule name=all | findstr /i "3001"
echo.

echo [6] Processos Node.js rodando:
tasklist | findstr /i "node.exe"
echo.

echo ====================================================
echo   TESTES DO CELULAR
echo ====================================================
echo.
echo IMPORTANTE: Faca estes testes NO CELULAR:
echo.
echo 1. Abra o navegador do celular
echo 2. Acesse: http://192.168.15.3:3001/api/v1/health
echo 3. Deve mostrar: {"status":"ok"}
echo.
echo Se NAO funcionar, o problema eh firewall/rede
echo Se funcionar, o problema eh no APK/configuracao
echo.
echo ====================================================
pause
