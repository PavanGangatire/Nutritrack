@echo off
echo ========================================================
echo        Nutritrack - Installing Dependencies
echo ========================================================
echo.

IF EXIST "C:\Users\ACER\anaconda3\python.exe" (
    SET "PY_EXEC=C:\Users\ACER\anaconda3\python.exe"
) ELSE (
    SET "PY_EXEC=python"
)

echo Using Python: %PY_EXEC%
echo Installing requirements from backend\requirements.txt ...
echo.

"%PY_EXEC%" -m pip install -r backend\requirements.txt

echo.
echo Dependencies installed!
pause
