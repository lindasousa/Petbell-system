@echo off
title Petbell - Inicializador do Front-end Angular PWA
echo ============================================================
echo   Iniciando a Aplicacao Front-end Petbell (Angular 18)
echo ============================================================
cd frontend
echo Instalando dependencias caso necessario...
call npm.cmd install
echo Subindo servidor local em http://localhost:4200...
call npm.cmd start
pause
