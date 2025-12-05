@echo off
setlocal

rem -------------------------------------------------
rem Script de RESET completo do banco de dados
rem ATENÇÃO: Este script apaga TODOS os dados!
rem -------------------------------------------------

echo ========================================
echo JurisConnect - RESET do Banco de Dados
echo ========================================
echo.
echo ATENCAO: Este script ira APAGAR todos os dados!
echo.
set /p CONFIRM="Tem certeza que deseja continuar? (S/N): "
if /i not "%CONFIRM%"=="S" (
    echo Operacao cancelada.
    exit /b 0
)

rem -------------------------------------------------
rem Definir diretórios
set PGROOT=%~dp0postgres
set PGBIN=%PGROOT%\bin
set PGDATA=%PGROOT%\data
set DBNAME=jurisconnect
set DBUSER=postgres

rem -------------------------------------------------
rem Parar o servidor PostgreSQL (se estiver rodando)
echo.
echo Parando servidor PostgreSQL...
"%PGBIN%\pg_ctl.exe" -D "%PGDATA%" stop -m fast 2>nul
timeout /t 3 /nobreak >nul

rem -------------------------------------------------
rem Iniciar servidor
echo Iniciando servidor PostgreSQL...
start /B "" "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -l "%PGDATA%\logfile.log" start
timeout /t 5 /nobreak >nul

rem -------------------------------------------------
rem Dropar banco existente
echo.
echo Dropando banco de dados existente...
"%PGBIN%\psql.exe" -U %DBUSER% -c "DROP DATABASE IF EXISTS %DBNAME%;" 2>nul

rem -------------------------------------------------
rem Criar banco limpo
echo Criando banco de dados limpo...
"%PGBIN%\psql.exe" -U %DBUSER% -c "CREATE DATABASE %DBNAME%;"
if errorlevel 1 (
    echo ERRO: Falha ao criar banco
    pause
    exit /b 1
)

rem -------------------------------------------------
rem Aplicar scripts SQL
echo.
echo Aplicando scripts SQL...
echo.

for %%f in (db\*.sql) do (
    echo Executando %%f...
    "%PGBIN%\psql.exe" -U %DBUSER% -d %DBNAME% -f "%%f" -q
    if errorlevel 1 (
        echo AVISO: Erro ao executar %%f
    )
)

echo.
echo ========================================
echo Reset concluido com sucesso!
echo ========================================
echo.
echo Banco de dados: %DBNAME%
echo Usuario: %DBUSER%
echo Porta: 5432
echo.
echo Credenciais de acesso:
echo   Login: admin
echo   Senha: admin123
echo.
pause
endlocal
