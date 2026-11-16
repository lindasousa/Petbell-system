@echo off
title Petbell - Teste de Desempenho e Mediana
echo ============================================================
echo   Executando Teste de Carga e Mediana (50 registros, 1.5 Mbps)
echo ============================================================
cd backend
node scripts/performance-test.js
pause
