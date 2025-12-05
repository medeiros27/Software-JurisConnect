@echo off
setlocal

rem Script para executar todos os testes de performance
echo ========================================
echo JurisConnect - Testes de Performance
echo ========================================
echo.

rem Verificar se k6 está instalado
where k6 >nul 2>&1
if errorlevel 1 (
    echo ERRO: k6 nao encontrado!
    echo.
    echo Instale o k6:
    echo   choco install k6
    echo   OU
    echo   scoop install k6
    echo.
    pause
    exit /b 1
)

echo k6 encontrado: 
k6 version
echo.

rem Verificar se backend está rodando
curl -s http://localhost:3000/api/v1/health >nul 2>&1
if errorlevel 1 (
    echo AVISO: Backend nao esta rodando em http://localhost:3000
    echo Por favor, inicie o backend antes de executar os testes.
    echo.
    set /p CONTINUE="Deseja continuar mesmo assim? (S/N): "
    if /i not "%CONTINUE%"=="S" exit /b 0
)

echo.
echo Selecione o teste a executar:
echo.
echo 1. Load Test (15 min) - Teste de carga normal
echo 2. Stress Test (35 min) - Encontrar limite do sistema
echo 3. Spike Test (8 min) - Recuperacao apos pico
echo 4. Soak Test (2h 10min) - Detectar vazamentos de memoria
echo 5. Breakpoint Test (27 min) - Ponto de quebra
echo 6. Write Test (5 min) - Operacoes de escrita
echo 7. Todos os testes (exceto Soak)
echo.

set /p CHOICE="Digite o numero do teste: "

if "%CHOICE%"=="1" goto load
if "%CHOICE%"=="2" goto stress
if "%CHOICE%"=="3" goto spike
if "%CHOICE%"=="4" goto soak
if "%CHOICE%"=="5" goto breakpoint
if "%CHOICE%"=="6" goto write
if "%CHOICE%"=="7" goto all
goto invalid

:load
echo.
echo Executando Load Test...
k6 run load-test.js
goto end

:stress
echo.
echo Executando Stress Test...
k6 run stress-test.js
goto end

:spike
echo.
echo Executando Spike Test...
k6 run spike-test.js
goto end

:soak
echo.
echo Executando Soak Test (2h 10min)...
echo ATENCAO: Este teste demora mais de 2 horas!
set /p CONFIRM="Tem certeza? (S/N): "
if /i not "%CONFIRM%"=="S" goto end
k6 run soak-test.js
goto end

:breakpoint
echo.
echo Executando Breakpoint Test...
k6 run breakpoint-test.js
goto end

:write
echo.
echo Executando Write Test...
k6 run write-test.js
goto end

:all
echo.
echo Executando todos os testes (exceto Soak)...
echo.
echo [1/5] Load Test...
k6 run load-test.js
echo.
echo [2/5] Stress Test...
k6 run stress-test.js
echo.
echo [3/5] Spike Test...
k6 run spike-test.js
echo.
echo [4/5] Breakpoint Test...
k6 run breakpoint-test.js
echo.
echo [5/5] Write Test...
k6 run write-test.js
echo.
echo Todos os testes concluidos!
goto end

:invalid
echo Opcao invalida!
goto end

:end
echo.
echo ========================================
echo Testes finalizados
echo ========================================
pause
endlocal
