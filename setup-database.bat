@echo off
setlocal

rem -------------------------------------------------
rem Script de inicialização do PostgreSQL portátil
rem JurisConnect - Setup completo do banco de dados
rem -------------------------------------------------

echo ========================================
echo JurisConnect - Inicializacao PostgreSQL
echo ========================================
echo.

rem -------------------------------------------------
rem 1. Definir diretórios
set PGROOT=%~dp0postgres
set PGBIN=%PGROOT%\bin
set PGDATA=%PGROOT%\data
set DBNAME=jurisconnect
set DBUSER=postgres

rem -------------------------------------------------
rem 2. Verificar se PostgreSQL está instalado
if not exist "%PGBIN%\postgres.exe" (
    echo ERRO: PostgreSQL nao encontrado em %PGBIN%
    echo.
    echo Por favor, baixe o PostgreSQL Portable e extraia em:
    echo %PGROOT%
    echo.
    echo Download: https://get.enterprisedb.com/postgresql/postgresql-15.10-1-windows-x64-binaries.zip
    pause
    exit /b 1
)

rem -------------------------------------------------
rem 3. Inicializar cluster (primeira execução)
if not exist "%PGDATA%\PG_VERSION" (
    echo Inicializando cluster PostgreSQL...
    "%PGBIN%\initdb.exe" -D "%PGDATA%" -U %DBUSER% --encoding=UTF8 --locale=C
    if errorlevel 1 (
        echo ERRO: Falha ao inicializar cluster
        pause
        exit /b 1
    )
    echo Cluster inicializado com sucesso!
    echo.
)

rem -------------------------------------------------
rem 4. Iniciar servidor PostgreSQL
echo Iniciando servidor PostgreSQL...
start /B "" "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -l "%PGDATA%\logfile.log" start
timeout /t 5 /nobreak >nul

rem -------------------------------------------------
rem 5. Criar banco de dados
echo Criando banco de dados %DBNAME%...
"%PGBIN%\psql.exe" -U %DBUSER% -c "CREATE DATABASE %DBNAME%;" 2>nul
if errorlevel 1 (
    echo Banco %DBNAME% ja existe ou erro ao criar
) else (
    echo Banco %DBNAME% criado com sucesso!
)

rem -------------------------------------------------
rem 6. Aplicar scripts SQL
echo.
echo Aplicando scripts SQL...
echo.

for %%f in (db\*.sql) do (
    echo Executando %%f...
    "%PGBIN%\psql.exe" -U %DBUSER% -d %DBNAME% -f "%%f"
    if errorlevel 1 (
        echo AVISO: Erro ao executar %%f
    )
)

echo.
echo ========================================
echo Setup concluido com sucesso!
echo ========================================
echo.
echo Banco de dados: %DBNAME%
echo Usuario: %DBUSER%
echo Porta: 5432
echo.
echo Para conectar:
echo psql -U %DBUSER% -d %DBNAME%
echo.
pause
endlocal
