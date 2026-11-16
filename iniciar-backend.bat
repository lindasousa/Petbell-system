@echo off
title Petbell - Inicializador do Back-end Node.js
echo ============================================================
echo   Iniciando o Servidor Back-end Petbell (Express + Prisma)
echo ============================================================
cd backend
echo Instalando dependencias caso necessario...
call npm.cmd install
echo Gerando cliente do Prisma ORM...
call npx.cmd prisma generate
echo Executando o servidor na porta 3000...
call npm.cmd run dev
pause
