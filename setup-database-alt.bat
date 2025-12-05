@echo off
setlocal

rem -------------------------------------------------
rem Script de inicialização do PostgreSQL (PORTA 5433)
rem -------------------------------------------------

echo ========================================
echo JurisConnect - Inicializacao PostgreSQL
echo Porta: 5433 (alternativa)
echo ========================================
echo.

set PGROOT=%~dp0postgres
set PGBIN=%PGROOT%\bin
set PGDATA=%PGROOT%\data
set PGPORT=5433
set DBNAME=jurisconnect
set DBUSER=postgres

rem Definir variáveis de ambiente para o PostgreSQL
set PGHOST=localhost
set PGPORT=5433

rem -------------------------------------------------
rem Parar servidor existente (se houver)
echo Parando servidor existente...
"%PGBIN%\pg_ctl.exe" -D "%PGDATA%" stop -m fast 2>nul
timeout /t 2 /nobreak >nul

rem -------------------------------------------------
rem Iniciar servidor na porta 5433
echo Iniciando servidor PostgreSQL na porta 5433...
start /B "" "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -o "-p 5433" -l "%PGDATA%\logfile.log" start
timeout /t 5 /nobreak >nul

rem -------------------------------------------------
rem Verificar se o servidor iniciou
"%PGBIN%\pg_isready.exe" -p 5433 -h localhost -U %DBUSER% >nul 2>&1
if errorlevel 1 (
    echo ERRO: Servidor nao iniciou corretamente
    echo Verifique o log em: %PGDATA%\logfile.log
    pause
    exit /b 1
)

echo Servidor iniciado com sucesso!
echo.

rem -------------------------------------------------
rem Dropar e recriar banco
echo Dropando banco existente...
"%PGBIN%\psql.exe" -p 5433 -U %DBUSER% -c "DROP DATABASE IF EXISTS %DBNAME%;" 2>nul

echo Criando banco limpo...
"%PGBIN%\psql.exe" -p 5433 -U %DBUSER% -c "CREATE DATABASE %DBNAME%;"
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
    "%PGBIN%\psql.exe" -p 5433 -U %DBUSER% -d %DBNAME% -f "%%f" -q
)

echo.
echo ========================================
echo Setup concluido com sucesso!
echo ========================================
echo.
echo Banco de dados: %DBNAME%
echo Usuario: %DBUSER%
echo Porta: 5433 (IMPORTANTE: porta alternativa!)
echo.
echo Credenciais de acesso:
echo   Login: admin
echo   Senha: admin123
echo.
echo IMPORTANTE: Atualize o arquivo .env do backend:
echo   DB_PORT=5433
echo.
pause
endlocal
