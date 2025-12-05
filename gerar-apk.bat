@echo off
title Rebuild APK Android - JurisConnect
color 0B

echo ====================================================
echo   REBUILD APK ANDROID
echo ====================================================
echo.

set FRONTEND_PATH=C:\Users\Bruno\Documents\Bruno\Software-JurisConnect\src\jurisconnect-frontend

echo [0/4] Compilando Frontend (React)...
cd /d "%FRONTEND_PATH%"
call npm run build
echo.

echo [1/4] Sincronizando Capacitor com codigo atualizado...
call npx cap sync android
echo.

echo [2/4] Limpando build anterior...
cd /d "%FRONTEND_PATH%\android"
if exist "%FRONTEND_PATH%\android\app\build\outputs\apk\debug\app-debug.apk" del "%FRONTEND_PATH%\android\app\build\outputs\apk\debug\app-debug.apk"
call gradlew.bat clean
echo.

echo [3/4] Gerando APK (modo debug)...
call gradlew.bat assembleDebug
echo.

echo [4/4] APK gerado com sucesso!
echo.
echo ====================================================
echo   APK LOCALIZADO EM:
echo ====================================================
echo.
echo %FRONTEND_PATH%\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo ====================================================
echo   IMPORTANTE:
echo   - Seu app agora funciona em QUALQUER lugar (Wi-Fi ou 4G/5G)
echo   - O Backend precisa estar RODANDO aqui no PC (porta 3001)
echo   - Nao precisa mais configurar IP manual!
echo ====================================================
pause
