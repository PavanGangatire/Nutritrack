@echo off
echo ========================================
echo   Nutritrack Backend - Starting...
echo ========================================
set PATH=C:\Users\ACER\anaconda3;C:\Users\ACER\anaconda3\Scripts;%PATH%
cd /d "%~dp0"
python backend/app.py
pause
