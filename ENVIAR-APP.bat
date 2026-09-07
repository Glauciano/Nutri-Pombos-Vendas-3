@echo off
REM ============================================
REM  ENVIAR ATUALIZACAO DO NUTRI POMBOS
REM  Arraste o conteudo novo do ZIP para dentro
REM  desta pasta e de um DUPLO CLIQUE aqui.
REM ============================================
cd /d "%~dp0"
git add -A
git commit -m "Atualizacao do app - %date% %time%"
git push
echo.
echo ============================================
echo  ENVIADO! A Vercel publica em 1-2 minutos.
echo ============================================
pause
