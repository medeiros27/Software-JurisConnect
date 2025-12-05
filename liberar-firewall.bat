@echo off
title Liberar Porta 3001 no Firewall
color 0C

echo ====================================================
echo   LIBERANDO PORTA 3001 NO FIREWALL
echo ====================================================
echo.
echo ATENCAO: Execute este arquivo como ADMINISTRADOR
echo          (Botao direito -^> Executar como administrador)
echo.
pause

echo.
echo [1/3] Removendo regra antiga (se existir)...
netsh advfirewall firewall delete rule name="JurisConnect Backend" protocol=TCP localport=3001 2>nul

echo.
echo [2/3] Criando regra de entrada (TCP 3001)...
netsh advfirewall firewall add rule name="JurisConnect Backend" dir=in action=allow protocol=TCP localport=3001

echo.
echo [3/3] Criando regra de saida (TCP 3001)...
netsh advfirewall firewall add rule name="JurisConnect Backend OUT" dir=out action=allow protocol=TCP localport=3001

echo.
echo ====================================================
echo   PORTA 3001 LIBERADA NO FIREWALL!
echo ====================================================
echo.
echo Agora teste novamente do celular:
echo http://192.168.15.3:3001/api/v1/health
echo.
pause
