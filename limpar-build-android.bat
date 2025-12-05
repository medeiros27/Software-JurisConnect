@echo off
title Limpar Build Android - JurisConnect
color 0E

echo ====================================================
echo   LIMPANDO BUILD ANDROID
echo ====================================================
echo.

set FRONTEND_PATH=C:\Users\Bruno\Documents\Bruno\Software-JurisConnect\src\jurisconnect-frontend

echo [1/5] Parando processos que podem bloquear arquivos...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM node.exe 2>nul
taskkill /F /IM gradle.exe 2>nul
taskkill /F /IM adb.exe 2>nul
echo [OK] Processos encerrados

echo.
echo [2/5] Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo [3/5] Limpando build do Android (via gradlew)...
cd /d "%FRONTEND_PATH%\android"
call gradlew.bat clean
echo [OK] Gradle clean concluido

echo.
echo [4/5] Deletando pastas de cache manualmente...
cd /d "%FRONTEND_PATH%"

REM Deletar node_modules do capacitor (cache problemático)
if exist "node_modules\@capacitor\android\capacitor\build" (
    echo Deletando cache do Capacitor...
    rmdir /s /q "node_modules\@capacitor\android\capacitor\build" 2>nul
)

REM Deletar build do app Android
if exist "android\app\build" (
    echo Deletando build do app...
    rmdir /s /q "android\app\build" 2>nul
)

REM Deletar .gradle cache
if exist "android\.gradle" (
    echo Deletando .gradle...
    rmdir /s /q "android\.gradle" 2>nul
)

echo [OK] Caches deletados

echo.
echo [5/5] Sincronizando Capacitor...
call npx cap sync android

echo.
echo ====================================================
echo   LIMPEZA CONCLUIDA!
echo ====================================================
echo.
echo Agora voce pode:
echo 1. Abrir Android Studio
echo 2. Build -^> Rebuild Project
echo 3. Ou executar: npx cap open android
echo ====================================================
pause
